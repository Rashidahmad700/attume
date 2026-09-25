/**
 * The two state changes an online order can make, written so they are safe to
 * attempt any number of times from any number of places.
 *
 * Three things race to call these: the browser coming back from Checkout, the
 * webhook Razorpay posts, and a webhook Razorpay re-posts hours later because
 * the first got no answer. Each transition is therefore a single conditional
 * update — the condition names the state being left, so exactly one caller can
 * win and the rest become no-ops. Nothing here reads, decides, then writes.
 */
import { Order, type OrderDocument } from '../models/order.model.js';
import { announceOrder } from './orderAnnounce.js';
import { releaseStock, reservationsFor } from './inventory.service.js';

export type PaymentSource = 'checkout' | 'webhook';

export interface SettleResult {
  order: OrderDocument;
  /** False when another caller had already settled it — nothing was written. */
  changed: boolean;
}

/**
 * Marks an order paid and confirmed.
 *
 * The amount is checked against what the order says it costs before anything
 * is written. Razorpay fixes the amount when the gateway order is created, so
 * a mismatch should be impossible — which is exactly why it is worth refusing
 * on: if it ever happens, something is wrong that guessing cannot fix.
 */
export async function markOrderPaid(input: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  amountPaise: number;
  method?: string;
  source: PaymentSource;
}): Promise<SettleResult | null> {
  const order = await Order.findOne({ 'payment.gatewayOrderId': input.gatewayOrderId });
  if (!order) {
    console.error(`[payment] no order carries gateway order ${input.gatewayOrderId}`);
    return null;
  }

  if (order.payment && input.amountPaise !== order.payment.amount) {
    console.error(
      `[payment] AMOUNT MISMATCH on ${order.orderNumber} — gateway says ${input.amountPaise} paise, ` +
        `order says ${order.payment.amount}. Not marking paid.`,
    );
    return null;
  }

  // The condition is the guard: only an order still awaiting payment can be
  // moved to paid, so a redelivered webhook writes nothing and sends nothing.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: 'pending' },
    {
      $set: {
        paymentStatus: 'paid',
        status: 'confirmed',
        'payment.gatewayPaymentId': input.gatewayPaymentId,
        'payment.method': input.method,
        'payment.capturedAt': new Date(),
      },
      $push: {
        timeline: {
          status: 'paid',
          note: `Payment received (${input.method ?? 'online'})`,
          at: new Date(),
        },
      },
    },
    { new: true },
  );

  if (!updated) {
    console.log(
      `[payment] ${order.orderNumber} already settled — ${input.source} callback ignored`,
    );
    return { order, changed: false };
  }

  console.log(
    `[payment] ${updated.orderNumber} paid via ${input.source} (${input.gatewayPaymentId})`,
  );

  // Only now is the order real to the customer and to the shop. Not awaited:
  // a webhook must be answered within seconds and a mail provider can take
  // longer than that, and the money has arrived whether or not the mail does.
  void announceOrder(updated).catch((error: Error) => {
    console.error(`[payment] announcing ${updated.orderNumber} failed:`, error.message);
  });

  return { order: updated, changed: true };
}

/**
 * Marks a payment failed and hands the stock back.
 *
 * `stockReleased: false` is part of the condition and flipped in the same
 * write, so two failures for one order cannot return the bottles twice —
 * the same ledger rule cancellation uses.
 */
export async function markOrderFailed(input: {
  gatewayOrderId: string;
  reason?: string;
  source: PaymentSource | 'sweeper';
}): Promise<SettleResult | null> {
  const updated = await Order.findOneAndUpdate(
    {
      'payment.gatewayOrderId': input.gatewayOrderId,
      paymentStatus: 'pending',
      stockReleased: false,
    },
    {
      $set: {
        paymentStatus: 'failed',
        status: 'cancelled',
        stockReleased: true,
        'payment.failureReason': input.reason,
      },
      $push: {
        timeline: {
          status: 'failed',
          note: input.reason ?? 'Payment was not completed',
          at: new Date(),
        },
      },
    },
    { new: true },
  );

  if (!updated) return null;

  await releaseStock(reservationsFor(updated));
  console.log(
    `[payment] ${updated.orderNumber} failed via ${input.source} — stock returned (${input.reason ?? 'no reason given'})`,
  );

  return { order: updated, changed: true };
}

/** Records a refund the gateway has confirmed. Idempotent on the refund id. */
export async function recordRefund(input: {
  gatewayPaymentId: string;
  refundId: string;
  amountPaise: number;
  reason?: string;
}): Promise<void> {
  const result = await Order.updateOne(
    {
      'payment.gatewayPaymentId': input.gatewayPaymentId,
      'payment.refunds.refundId': { $ne: input.refundId },
    },
    {
      $set: { paymentStatus: 'refunded' },
      $push: {
        timeline: {
          status: 'refunded',
          note: `Refund of ₹${(input.amountPaise / 100).toFixed(2)}`,
          at: new Date(),
        },
        'payment.refunds': {
          refundId: input.refundId,
          amount: input.amountPaise,
          reason: input.reason,
          at: new Date(),
        },
      },
    },
  );

  if (result.modifiedCount === 0) {
    console.log(`[payment] refund ${input.refundId} already recorded — ignoring`);
  }
}
