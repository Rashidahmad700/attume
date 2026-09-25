/**
 * What the browser reports after Razorpay Checkout closes.
 *
 * This exists to make the customer's wait short: the webhook is what the shop
 * believes, but it can take seconds or minutes, and nobody should watch a
 * spinner for that. So the browser's word is accepted here — after being
 * checked hard enough that accepting it is safe:
 *
 *   1. the caller owns the order
 *   2. the signature matches, proving Razorpay produced this payment id for
 *      this gateway order and that nobody invented either
 *   3. Razorpay itself is asked what became of the payment
 *
 * If any of that fails the order simply stays pending, and the webhook settles
 * it. A customer who closes the tab at the wrong moment loses nothing.
 */
import { Order } from '../models/order.model.js';
import { markOrderPaid } from '../services/payment.service.js';
import { fetchPayment, verifyCheckoutSignature } from '../services/razorpay.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { VerifyPaymentInput } from '../validators/payment.validator.js';

/** POST /api/v1/orders/:orderNumber/pay/verify */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { gatewayPaymentId, signature } = req.body as VerifyPaymentInput;

  const order = await Order.findOne({
    orderNumber: req.params.orderNumber.toUpperCase(),
    user: req.user!.id,
  });
  if (!order) throw ApiError.notFound('Order not found');
  if (!order.payment) throw ApiError.badRequest('This order was not paid online');

  // Already settled — by a webhook that beat the browser back, or by this
  // same request arriving twice. Either way there is nothing left to do.
  if (order.paymentStatus === 'paid') {
    res.status(200).json({
      success: true,
      message: 'Payment already confirmed',
      data: { order: order.toJSON() },
    });
    return;
  }

  const signatureValid = verifyCheckoutSignature({
    gatewayOrderId: order.payment.gatewayOrderId,
    gatewayPaymentId,
    signature,
  });

  if (!signatureValid) {
    // Deliberately not failing the order: a bad signature says this caller
    // cannot be believed, not that the payment did not happen. If money really
    // did move, the webhook will say so and the order will settle properly.
    console.error(
      `[payment] rejected signature for ${order.orderNumber} (payment ${gatewayPaymentId})`,
    );
    throw ApiError.badRequest('We could not verify that payment. Please contact us before retrying.');
  }

  const payment = await fetchPayment(gatewayPaymentId);

  // The signature covers the pair, but check the pairing anyway — a valid
  // signature for a different order would otherwise settle this one.
  if (payment.orderId !== order.payment.gatewayOrderId) {
    console.error(
      `[payment] ${gatewayPaymentId} belongs to ${payment.orderId}, not ${order.orderNumber}`,
    );
    throw ApiError.badRequest('That payment does not belong to this order');
  }

  if (payment.status !== 'captured') {
    // Authorised but not captured, or still processing. The webhook will
    // arrive when it settles; the customer is told to wait rather than pay again.
    res.status(202).json({
      success: true,
      message: 'Payment is still being confirmed',
      data: { order: order.toJSON(), pending: true },
    });
    return;
  }

  const settled = await markOrderPaid({
    gatewayOrderId: order.payment.gatewayOrderId,
    gatewayPaymentId: payment.id,
    amountPaise: payment.amount,
    method: payment.method,
    source: 'checkout',
  });

  if (!settled) throw ApiError.badRequest('We could not confirm that payment. Please contact us.');

  res.status(200).json({
    success: true,
    message: 'Payment confirmed',
    data: { order: settled.order.toJSON() },
  });
});
