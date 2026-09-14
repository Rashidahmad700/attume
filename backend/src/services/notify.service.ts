import { env } from '../config/env.js';
import type { IPrebooking } from '../models/prebooking.model.js';
import { sendMail } from './mailer.service.js';
import { sendWhatsApp, whatsAppLink } from './whatsapp.service.js';

export interface NotifyResult {
  customerEmail: boolean;
  adminEmail: boolean;
  customerWhatsApp: boolean;
  adminWhatsApp: boolean;
}

const firstName = (name: string) => name.trim().split(/\s+/)[0];

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
