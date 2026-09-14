/**
 * Sends one of each message to you, so the channels can be proved without
 * waiting for a real customer.
 *
 *   npm run test-notify -- --email you@example.com --phone 9876543210
 *
 * Reports what was actually delivered rather than what was attempted: a channel
 * with no provider configured prints its message and reports false.
 */
import { env } from '../config/env.js';
import { checkEmail } from '../services/emailCheck.service.js';
import { notifyPrebooking } from '../services/notify.service.js';
import { toWhatsAppNumber } from '../services/whatsapp.service.js';
import type { IPrebooking } from '../models/prebooking.model.js';

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(`--${flag}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = arg('email');
  const phone = arg('phone');

  if (!email) {
    console.error('Usage: npm run test-notify -- --email you@example.com [--phone 9876543210]');
    process.exit(1);
  }

  console.log('\nConfigured channels');
  console.log(`  email provider      ${env.RESEND_API_KEY ? 'Resend (live)' : 'none — prints to this terminal'}`);
  console.log(`  admin notified at   ${env.ADMIN_NOTIFY_EMAIL}`);
  console.log(
    `  whatsapp provider   ${
      env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID
        ? 'WhatsApp Cloud API (live)'
        : 'none — automation off, admin email carries a wa.me reply link'
    }`,
  );
  console.log(`  whatsapp template   ${env.WHATSAPP_PREBOOK_TEMPLATE ?? 'none — free text only'}`);
  console.log(`  admin whatsapp      ${env.ADMIN_WHATSAPP_NUMBER ?? 'not set'}`);

  const check = await checkEmail(email);
  console.log(`\nEmail check for ${email}: ${check.ok ? 'deliverable' : `rejected — ${check.reason}`}`);
  if (!check.ok) process.exit(1);

  if (phone) console.log(`Phone ${phone} normalises to +${toWhatsAppNumber(phone) ?? '(unusable)'}`);

  // Not saved: this is a delivery test, not a pre-booking.
  const sample = {
    name: 'Test Customer',
    email,
    phone,
    productName: 'atolis',
    productSlug: 'atolis',
    quantity: 1,
    city: 'New Delhi',
    source: 'product',
    status: 'new',
  } as IPrebooking;

  const result = await notifyPrebooking(sample);

  console.log('\nDelivered');
  console.log(`  customer email      ${result.customerEmail ? 'sent' : 'not sent'}`);
  console.log(`  admin email         ${result.adminEmail ? 'sent' : 'not sent'}`);
  console.log(`  customer whatsapp   ${result.customerWhatsApp ? 'sent' : 'not sent'}`);
  console.log(`  admin whatsapp      ${result.adminWhatsApp ? 'sent' : 'not sent'}`);
  console.log('');

  process.exit(0);
}

void main();
