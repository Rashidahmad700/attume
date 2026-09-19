import { env } from '../config/env.js';
import type { IOrder } from '../models/order.model.js';
import type { IPrebooking } from '../models/prebooking.model.js';
import { sendMail } from './mailer.service.js';
import { renderOrderEmailHtml } from './orderEmail.js';
import { sendWhatsApp, whatsAppLink } from './whatsapp.service.js';

export interface NotifyResult {
  customerEmail: boolean;
  adminEmail: boolean;
  customerWhatsApp: boolean;
  adminWhatsApp: boolean;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0];

/**
 * Renders the HTML part, or nothing.
 *
 * Every other channel here is best-effort and catches its own failure, but a
 * template throws while the argument to sendMail is still being built — before
 * there is a promise to attach .catch to. That would reject notifyOrder and
 * fail the response for an order that is already written and already owns its
 * stock. A broken template must cost the styling, not the checkout.
 */
function orderHtmlOrNothing(order: IOrder): string | undefined {
  try {
    return renderOrderEmailHtml(order);
  } catch (error) {
    console.error('[notify] order email template failed:', (error as Error).message);
    return undefined;
  }
}

/**
 * Announces a pre-booking to the customer and to the shop, by email and — where
 * a number is available — WhatsApp.
 *
 * Every channel is best-effort and independent. The pre-booking is already
 * safely recorded by the time this runs, so a provider being down must never
 * turn a captured customer into an error page. Each result is returned so the
 * caller can log what actually went out.
 */
export async function notifyPrebooking(prebooking: IPrebooking): Promise<NotifyResult> {
  const what = prebooking.productName
    ? `${prebooking.productName}${prebooking.quantity > 1 ? ` ×${prebooking.quantity}` : ''}`
    : 'the attume list';

  const replyLink = prebooking.phone
    ? whatsAppLink(
        prebooking.phone,
        `Hello ${firstName(prebooking.name)}, thank you for pre-booking ${what} with attume.`,
      )
    : null;

  const customerMail = sendMail({
    to: prebooking.email,
    subject: prebooking.productName
      ? `Your pre-booking for ${prebooking.productName}`
      : 'You are on the attume list',
    text: [
      `Hello ${firstName(prebooking.name)},`,
      '',
      prebooking.productName
        ? `Your pre-booking for ${what} is recorded.`
        : 'You are on the attume list.',
      '',
      'Nothing has been charged. This reserves your place and holds the price shown — we will write to you with payment and delivery details before anything is dispatched.',
      '',
      'If you did not make this request, you can ignore this message and we will not write again.',
      '',
      '— attume',
      'attume.official@gmail.com',
    ].join('\n'),
  }).catch((error: Error) => {
    console.error('[notify] customer email failed:', error.message);
    return false;
  });

  const adminMail = sendMail({
    to: env.ADMIN_NOTIFY_EMAIL,
    subject: `New pre-booking — ${what}`,
    text: [
      'A pre-booking just came in.',
      '',
      `Name:      ${prebooking.name}`,
      `Email:     ${prebooking.email}`,
      `Phone:     ${prebooking.phone ?? '—'}`,
      `Fragrance: ${prebooking.productName ?? '— (list sign-up)'}`,
      `Quantity:  ${prebooking.quantity}`,
      `City:      ${prebooking.city ?? '—'}`,
      `Source:    ${prebooking.source}`,
      ...(prebooking.note ? [`Note:      ${prebooking.note}`] : []),
      '',
      // A one-tap reply, so the shop can answer from its own phone even
      // before the WhatsApp API is approved.
      ...(replyLink ? [`Reply on WhatsApp: ${replyLink}`, ''] : []),
      'The full list is in the admin console under Pre-bookings.',
    ].join('\n'),
  }).catch((error: Error) => {
    console.error('[notify] admin email failed:', error.message);
    return false;
  });

  const customerWhatsApp = prebooking.phone
    ? sendWhatsApp({
        to: prebooking.phone,
        label: `pre-booking confirmation for ${prebooking.email}`,
        // Business-initiated, so it needs an approved template. Without one
        // configured this falls back to text, which WhatsApp will only deliver
        // inside a 24-hour window — the log line makes that visible.
        template: env.WHATSAPP_PREBOOK_TEMPLATE
          ? {
              name: env.WHATSAPP_PREBOOK_TEMPLATE,
              language: env.WHATSAPP_TEMPLATE_LANGUAGE,
              params: [firstName(prebooking.name), what],
            }
          : undefined,
        text: [
          `Hello ${firstName(prebooking.name)}, your attume pre-booking for ${what} is recorded.`,
          '',
          'Nothing has been charged — this holds your place and the price shown. We will message you before anything ships.',
          '',
          '— attume',
        ].join('\n'),
      })
    : Promise.resolve(false);

  const adminWhatsApp = env.ADMIN_WHATSAPP_NUMBER
    ? sendWhatsApp({
        to: env.ADMIN_WHATSAPP_NUMBER,
        label: 'new pre-booking alert',
        text: [
          `New pre-booking: ${what}`,
          `${prebooking.name} · ${prebooking.email}${prebooking.phone ? ` · ${prebooking.phone}` : ''}`,
          ...(prebooking.city ? [`City: ${prebooking.city}`] : []),
          `Source: ${prebooking.source}`,
        ].join('\n'),
      })
    : Promise.resolve(false);

  const [customerEmailSent, adminEmailSent, customerWhatsAppSent, adminWhatsAppSent] =
    await Promise.all([customerMail, adminMail, customerWhatsApp, adminWhatsApp]);

  return {
    customerEmail: customerEmailSent,
    adminEmail: adminEmailSent,
    customerWhatsApp: customerWhatsAppSent,
    adminWhatsApp: adminWhatsAppSent,
  };
}

/** Indian grouping, so ₹1,49,900 reads the way the shop prints it. */
const rupees = (paise: number) => `₹${paise.toLocaleString('en-IN')}`;

/** One line per item, aligned enough to scan in a plain-text mail. */
const itemLines = (order: IOrder) =>
  order.items.map(
    (item) => `  ${item.quantity} × ${item.name} (${item.sku}) — ${rupees(item.subtotal)}`,
  );

const addressLines = (order: IOrder) => {
  const to = order.shippingAddress;
  return [
    to.name,
    to.line1,
    ...(to.line2 ? [to.line2] : []),
    `${to.city}, ${to.state} ${to.postalCode}`,
    to.country,
    ...(to.phone ? [to.phone] : []),
  ];
};

/**
 * Announces a placed order to the customer and to the shop.
 *
 * Deliberately mirrors `notifyPrebooking`: the order is already written and
 * owns its stock by the time this runs, so every channel is best-effort and a
 * provider being down must never turn a paid customer into an error page.
 *
 * The shop's copy is the operational one — it carries the address, the payment
 * method and the amount to collect, because for a cash-on-delivery order that
 * email is the picking slip.
 */
const NOTHING_SENT: NotifyResult = {
  customerEmail: false,
  adminEmail: false,
  customerWhatsApp: false,
  adminWhatsApp: false,
};

/**
 * Never rejects.
 *
 * By the time this runs the order is written and owns its stock, so the
 * checkout has already succeeded. Anything that goes wrong assembling a
 * message — a template, a missing field, a provider — is a failure to
 * announce the order, not a failure to take it, and the caller records which
 * channels reported delivery either way.
 */
export async function notifyOrder(order: IOrder): Promise<NotifyResult> {
  try {
    return await buildAndSendOrderNotifications(order);
  } catch (error) {
    console.error('[notify] order notification failed entirely:', (error as Error).message);
    return NOTHING_SENT;
  }
}

async function buildAndSendOrderNotifications(order: IOrder): Promise<NotifyResult> {
  const { customer, orderNumber, amounts } = order;
  const payment = order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online';

  const replyLink = customer.phone
    ? whatsAppLink(
        customer.phone,
        `Hello ${firstName(customer.name)}, thank you for your attume order ${orderNumber}.`,
      )
    : null;

  const customerMail = sendMail({
    to: customer.email,
    subject: `Your attume order ${orderNumber}`,
    text: [
      `Hello ${firstName(customer.name)},`,
      '',
      `Your order ${orderNumber} is confirmed.`,
      '',
      ...itemLines(order),
      '',
      `Subtotal: ${rupees(amounts.subtotal)}`,
      `Shipping: ${amounts.shipping === 0 ? 'Free' : rupees(amounts.shipping)}`,
      `Total:    ${rupees(amounts.total)}`,
      `Payment:  ${payment}`,
      '',
      'Delivering to',
      ...addressLines(order).map((line) => `  ${line}`),
      '',
      `You can follow it at ${env.STOREFRONT_URL}/account/orders`,
      '',
      'If anything looks wrong, reply to this message and we will put it right.',
      '',
      '— attume',
      env.ADMIN_NOTIFY_EMAIL,
    ].join('\n'),
    // The text above stays as the fallback part; clients that refuse HTML,
    // and spam filters that distrust it, read that instead.
    html: orderHtmlOrNothing(order),
  }).catch((error: Error) => {
    console.error('[notify] customer order email failed:', error.message);
    return false;
  });

  const adminMail = sendMail({
    to: env.ADMIN_NOTIFY_EMAIL,
    subject: `New order ${orderNumber} — ${rupees(amounts.total)}${
      order.paymentMethod === 'cod' ? ' to collect' : ''
    }`,
    text: [
      'An order just came in.',
      '',
      `Order:    ${orderNumber}`,
      `Name:     ${customer.name}`,
      `Email:    ${customer.email}`,
      `Phone:    ${customer.phone ?? '—'}`,
      `Payment:  ${payment}`,
      `Placed:   ${order.placedAt.toISOString()}`,
      '',
      'Items',
      ...itemLines(order),
      '',
      `Subtotal: ${rupees(amounts.subtotal)}`,
      `Shipping: ${amounts.shipping === 0 ? 'Free' : rupees(amounts.shipping)}`,
      `Total:    ${rupees(amounts.total)}`,
      '',
      'Ship to',
      ...addressLines(order).map((line) => `  ${line}`),
      '',
      ...(replyLink ? [`Reply on WhatsApp: ${replyLink}`, ''] : []),
      'Move it forward in the admin console under Orders.',
    ].join('\n'),
  }).catch((error: Error) => {
    console.error('[notify] admin order email failed:', error.message);
    return false;
  });

  const customerWhatsApp = customer.phone
    ? sendWhatsApp({
        to: customer.phone,
        label: `order confirmation for ${orderNumber}`,
        // Business-initiated, so without an approved template WhatsApp only
        // delivers inside a 24-hour window — the log line makes that visible.
        template: env.WHATSAPP_ORDER_TEMPLATE
          ? {
              name: env.WHATSAPP_ORDER_TEMPLATE,
              language: env.WHATSAPP_TEMPLATE_LANGUAGE,
              params: [firstName(customer.name), orderNumber],
            }
          : undefined,
        text: [
          `Hello ${firstName(customer.name)}, your attume order ${orderNumber} is confirmed.`,
          '',
          `Total ${rupees(amounts.total)} · ${payment}`,
          '',
          '— attume',
        ].join('\n'),
      })
    : Promise.resolve(false);

  const adminWhatsApp = env.ADMIN_WHATSAPP_NUMBER
    ? sendWhatsApp({
        to: env.ADMIN_WHATSAPP_NUMBER,
        label: `new order alert ${orderNumber}`,
        text: [
          `New order ${orderNumber} — ${rupees(amounts.total)} (${payment})`,
          `${customer.name} · ${customer.email}${customer.phone ? ` · ${customer.phone}` : ''}`,
          ...order.items.map((item) => `${item.quantity} × ${item.name}`),
          `${order.shippingAddress.city}, ${order.shippingAddress.state}`,
        ].join('\n'),
      })
    : Promise.resolve(false);

  const [customerEmailSent, adminEmailSent, customerWhatsAppSent, adminWhatsAppSent] =
    await Promise.all([customerMail, adminMail, customerWhatsApp, adminWhatsApp]);

  return {
    customerEmail: customerEmailSent,
    adminEmail: adminEmailSent,
    customerWhatsApp: customerWhatsAppSent,
    adminWhatsApp: adminWhatsAppSent,
  };
}
