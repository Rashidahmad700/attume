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
import { env } from '../config/env.js';
import { Order, type OrderDocument } from '../models/order.model.js';
import { announceOrder } from './orderAnnounce.js';
import { releaseStock, reserveStock, reservationsFor } from './inventory.service.js';
import { sendMail } from './mailer.service.js';

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
    // Money arrived for an order that was already cancelled — the sweeper got
    // there first. The customer has paid, so the order is brought back rather
    // than left cancelled with the money kept.
    if (
      order.status === 'cancelled' &&
      order.stockReleased &&
      order.paymentStatus !== 'paid' &&
      order.paymentStatus !== 'refunded'
    ) {
      return settleAfterCancellation(order, input);
    }

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
 * Pays an order that had already been cancelled, and brings it back if the
 * stock is still there.
 *
 * The payment is claimed first, in one conditional write, so a webhook and the
 * browser arriving together cannot both reinstate it. If the bottles have sold
 * in the meantime the order stays cancelled and the shop is told to refund —
 * that is the one case a person has to handle.
 */
async function settleAfterCancellation(
  order: OrderDocument,
  input: Parameters<typeof markOrderPaid>[0],
): Promise<SettleResult | null> {
  const claimed = await Order.findOneAndUpdate(
    {
      _id: order._id,
      status: 'cancelled',
      stockReleased: true,
      paymentStatus: { $nin: ['paid', 'refunded'] },
    },
    {
      $set: {
        paymentStatus: 'paid',
        'payment.gatewayPaymentId': input.gatewayPaymentId,
        'payment.method': input.method,
        'payment.capturedAt': new Date(),
      },
      $push: {
        timeline: {
          status: 'paid',
          note: `Payment received after the order was cancelled (${input.method ?? 'online'})`,
          at: new Date(),
        },
      },
    },
    { new: true },
  );

  if (!claimed) {
    // Another caller claimed it between our read and this write.
    const current = await Order.findById(order._id);
    return current ? { order: current, changed: false } : null;
  }

  try {
    await reserveStock(reservationsFor(claimed));
  } catch (error) {
    console.error(
      `[payment] REFUND NEEDED — ${claimed.orderNumber} was paid after cancellation and its stock is gone: ${(error as Error).message}`,
    );
    await Order.updateOne(
      { _id: claimed._id },
      {
        $push: {
          timeline: {
            status: 'refund_required',
            note: 'Paid after cancellation, but the stock had already sold. Refund the payment.',
            at: new Date(),
          },
        },
      },
    );
    void sendMail({
      to: env.ADMIN_NOTIFY_EMAIL,
      subject: `Refund needed — ${claimed.orderNumber}`,
      text:
        `${claimed.orderNumber} was paid (${input.gatewayPaymentId}) after it had been cancelled, ` +
        `and the stock it held has since sold. Refund the payment from the Razorpay dashboard.`,
    }).catch((mailError: Error) => {
      console.error(`[payment] refund alert for ${claimed.orderNumber} failed:`, mailError.message);
    });
    return { order: claimed, changed: true };
  }

  const reinstated = await Order.findOneAndUpdate(
    { _id: claimed._id, status: 'cancelled', stockReleased: true },
    {
      $set: { status: 'confirmed', stockReleased: false },
      $push: {
        timeline: { status: 'confirmed', note: 'Order reinstated after payment', at: new Date() },
      },
    },
    { new: true },
  );

  if (!reinstated) {
    // Changed under us (an admin, most likely). Give the bottles back rather
    // than hold stock for an order we did not reinstate.
    await releaseStock(reservationsFor(claimed));
    const current = await Order.findById(claimed._id);
    return current ? { order: current, changed: true } : null;
  }

  console.log(`[payment] ${reinstated.orderNumber} reinstated — paid after cancellation`);
  void announceOrder(reinstated).catch((error: Error) => {
    console.error(`[payment] announcing ${reinstated.orderNumber} failed:`, error.message);
  });

  return { order: reinstated, changed: true };
}

/**
 * Notes a failed attempt without ending the order.
 *
 * Razorpay lets a customer try again inside the same Checkout — a declined
 * card, then UPI — and every attempt belongs to the same gateway order. So a
 * failed attempt is not a failed order: cancelling here once turned a card
 * decline followed by a successful UPI payment into a cancelled order with the
 * money taken. An order nobody pays for is ended by the sweeper instead.
 *
 * The payment id is in the note, and the note is part of the condition, so a
 * redelivered webhook adds nothing.
 */
export async function recordFailedAttempt(input: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  reason?: string;
  source: PaymentSource;
}): Promise<void> {
  const reason = input.reason ?? 'Payment failed';
  const note = `Attempt ${input.gatewayPaymentId} failed — ${reason}`;

  const result = await Order.updateOne(
    {
      'payment.gatewayOrderId': input.gatewayOrderId,
      paymentStatus: 'pending',
      'timeline.note': { $ne: note },
    },
    {
      $set: { 'payment.failureReason': reason },
      $push: { timeline: { status: 'payment_attempt_failed', note, at: new Date() } },
    },
  );

  if (result.modifiedCount > 0) {
    console.log(
      `[payment] attempt failed via ${input.source} on gateway order ${input.gatewayOrderId} — order stays open (${reason})`,
    );
  }
}

/**
 * Ends an unpaid order and hands the stock back. Used by the sweeper once the
 * payment window has long passed — never for a single failed attempt.
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
