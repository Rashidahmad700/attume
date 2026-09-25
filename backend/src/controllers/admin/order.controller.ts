import { containsFilter } from '../../utils/escapeRegex.js';
import type { FilterQuery } from 'mongoose';
import { Order, type IOrder, type OrderStatus, type PaymentStatus } from '../../models/order.model.js';
import { commerce } from '../../config/commerce.js';
import { recordRefund } from '../../services/payment.service.js';
import { refundPayment } from '../../services/razorpay.service.js';
import { Product } from '../../models/product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { OrderQueryInput } from '../../validators/order.validator.js';

/** Forward-only status flow; cancelling is allowed until the parcel ships. */
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

/** GET /api/v1/admin/orders */
export const listOrders = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, page, limit } = req.query as unknown as OrderQueryInput;

  const filter: FilterQuery<IOrder> = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: containsFilter(search) },
      { 'customer.email': containsFilter(search) },
      { 'customer.name': containsFilter(search) },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders: orders.map((order) => order.toJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/** GET /api/v1/admin/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  res.status(200).json({ success: true, data: { order: order.toJSON() } });
});

/** PATCH /api/v1/admin/orders/:id/status */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const current = await Order.findById(req.params.id);
  if (!current) throw ApiError.notFound('Order not found');

  if (current.status === status) throw ApiError.badRequest(`Order is already ${status}`);
  if (!allowedTransitions[current.status].includes(status)) {
    throw ApiError.badRequest(
      `Cannot move an order from ${current.status} to ${status}. Allowed: ${
        allowedTransitions[current.status].join(', ') || 'none'
      }`,
    );
  }

  // The status read above is only a hint by the time we write, so the write
  // repeats it as a condition: two admins acting at once cannot both move the
  // same order. Cancelling claims the stock in the same update, so the units
  // are released once — the stockReleased guard stays even though customers
  // can no longer cancel, because it is what makes a double-click safe.
  const claimsStock = status === 'cancelled';
  const order = await Order.findOneAndUpdate(
    {
      _id: current._id,
      status: current.status,
      ...(claimsStock ? { stockReleased: { $ne: true } } : {}),
    },
    {
      $set: { status, ...(claimsStock ? { stockReleased: true } : {}) },
      $push: { timeline: { status, note, at: new Date() } },
    },
    { new: true },
  );

  if (!order) {
    throw ApiError.conflict('That order changed while you were working on it — reload and retry');
  }

  // Cancelling before dispatch returns the reserved units to the catalogue.
  // A return does not: the goods have to come back and be inspected first, so
  // the admin puts them back with the stock control when they arrive.
  if (claimsStock) {
    await Promise.all(
      order.items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }),
      ),
    );
  }

  res.status(200).json({
    success: true,
    message: `Order marked ${status}`,
    data: { order: order.toJSON() },
  });
});

/** PATCH /api/v1/admin/orders/:id/payment */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, note } = req.body as { paymentStatus: PaymentStatus; note?: string };
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  order.paymentStatus = paymentStatus;
  order.timeline.push({ status: paymentStatus, note, at: new Date() });
  await order.save();

  res.status(200).json({
    success: true,
    message: `Payment marked ${paymentStatus}`,
    data: { order: order.toJSON() },
  });
});

/**
 * POST /api/v1/admin/orders/:id/refund
 *
 * Raises the refund with the gateway and records it here as well, so the
 * console shows it at once rather than waiting for the webhook. Both paths are
 * idempotent on the refund id, so whichever arrives second changes nothing.
 *
 * Only an order actually paid online can be refunded here. Cash on delivery is
 * settled between the shop and the customer, and there is nothing for a
 * gateway to send back.
 */
export const refundOrder = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body as { amount?: number; reason?: string };

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (!order.payment?.gatewayPaymentId) {
    throw ApiError.badRequest('This order has no online payment to refund');
  }
  if (order.paymentStatus !== 'paid') {
    throw ApiError.badRequest(`An order marked ${order.paymentStatus} cannot be refunded`);
  }

  const amountPaise = amount ? commerce.online.toPaise(amount) : undefined;
  if (amountPaise && amountPaise > order.payment.amount) {
    throw ApiError.badRequest('A refund cannot exceed what was paid');
  }

  const refund = await refundPayment({
    gatewayPaymentId: order.payment.gatewayPaymentId,
    amountPaise,
    reason,
  });

  await recordRefund({
    gatewayPaymentId: order.payment.gatewayPaymentId,
    refundId: refund.id,
    amountPaise: refund.amount,
    reason,
  });

  const updated = await Order.findById(order._id);

  res.status(200).json({
    success: true,
    message: `Refund of ₹${(refund.amount / 100).toFixed(2)} raised`,
    data: { order: updated?.toJSON() },
  });
});
