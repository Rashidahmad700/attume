/**
 * Returns the stock held by online orders nobody paid for.
 *
 * An online order reserves its bottles before the customer sees Checkout,
 * because the alternative is selling the same last bottle twice while two
 * people are both typing a UPI PIN. The cost is that a closed tab leaves stock
 * held by an order that will never be paid, and without this the catalogue
 * quietly empties.
 *
 * Deliberately generous: a customer switching to a banking app, failing once
 * and retrying has twenty minutes here, and Razorpay's own payment window is
 * shorter than that. Anything still pending after it was abandoned.
 *
 * Safe against a payment landing late — releasing flips `stockReleased` in the
 * same conditional write, and a webhook arriving afterwards finds the order no
 * longer `pending` and does nothing. Such an order shows as cancelled while
 * the money arrived, which is why it is logged loudly rather than silently.
 */
import { Order } from '../models/order.model.js';
import { markOrderFailed } from './payment.service.js';

/** How long an unpaid online order may hold its stock. */
const ABANDON_AFTER_MINUTES = 20;
const SWEEP_EVERY_MS = 5 * 60 * 1000;

export async function releaseAbandonedOrders(): Promise<number> {
  const cutoff = new Date(Date.now() - ABANDON_AFTER_MINUTES * 60 * 1000);

  const stale = await Order.find({
    paymentMethod: 'online',
    paymentStatus: 'pending',
    stockReleased: false,
    placedAt: { $lt: cutoff },
  }).select('orderNumber payment.gatewayOrderId');

  let released = 0;
  for (const order of stale) {
    if (!order.payment?.gatewayOrderId) continue;
    const result = await markOrderFailed({
      gatewayOrderId: order.payment.gatewayOrderId,
      reason: `Payment not completed within ${ABANDON_AFTER_MINUTES} minutes`,
      source: 'sweeper',
    });
    if (result) released += 1;
  }

  return released;
}

/**
 * Runs the sweep on a timer for the life of the process. `unref` so it never
 * holds a shutdown open — a sweep missed at restart is picked up by the next one.
 */
export function startAbandonedOrderSweeper(): NodeJS.Timeout {
  const run = () => {
    void releaseAbandonedOrders()
      .then((count) => {
        if (count > 0) console.log(`[sweeper] released stock from ${count} abandoned order(s)`);
      })
      .catch((error: Error) => {
        console.error('[sweeper] sweep failed:', error.message);
      });
  };

  run();
  const timer = setInterval(run, SWEEP_EVERY_MS);
  timer.unref();
  return timer;
}
