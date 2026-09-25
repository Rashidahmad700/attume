/**
 * Tells the customer and the shop that an order is real, and records what
 * actually got through.
 *
 * Extracted because two paths now reach it. A cash-on-delivery order is real
 * the moment it is written; an online one is not real until the money arrives,
 * so it is announced from the payment path instead. Both want the same
 * best-effort behaviour and the same audit trail, and neither may fail because
 * a mail provider is down — the order already exists and already owns its stock.
 */
import { Order, type IOrder, type OrderDocument } from '../models/order.model.js';
import { notifyOrder } from './notify.service.js';

export async function announceOrder(order: OrderDocument | IOrder): Promise<void> {
  const delivered = await notifyOrder(order);

  console.log(
    `[order] ${order.orderNumber} — email(customer:${delivered.customerEmail} admin:${delivered.adminEmail}) ` +
      `whatsapp(customer:${delivered.customerWhatsApp} admin:${delivered.adminWhatsApp})`,
  );

  // Written onto the order so a confirmation that never arrived can be found
  // later, rather than only in a log that has rotated away.
  await Order.updateOne(
    { orderNumber: order.orderNumber },
    { $set: { notified: { ...delivered, attemptedAt: new Date() } } },
  ).catch((error: Error) => {
    console.error('[order] could not record delivery status:', error.message);
  });

  // Loud, because this is the shop's only signal that something needs packing.
  if (!delivered.adminEmail) {
    console.error(
      `[order] ADMIN ALERT NOT DELIVERED for ${order.orderNumber} — check RESEND_API_KEY, MAIL_FROM and ADMIN_NOTIFY_EMAIL`,
    );
  }
}
