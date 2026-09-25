import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Admin sessions are signed with their own keys, so a storefront token can
  // never be replayed against an admin route.
  ADMIN_JWT_ACCESS_SECRET: z.string().min(16, 'ADMIN_JWT_ACCESS_SECRET must be at least 16 chars'),
  ADMIN_JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'ADMIN_JWT_REFRESH_SECRET must be at least 16 chars'),
  ADMIN_JWT_ACCESS_EXPIRES_IN: z.string().default('30m'),
  ADMIN_JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),

  /**
   * Shared with the storefront, which sends it with each proxied request so the
   * shopper's IP it forwards can be believed. Without it, rate limits count the
   * storefront server as one visitor. Generate with: openssl rand -hex 32
   */
  API_PROXY_SECRET: z.string().min(32, 'API_PROXY_SECRET must be at least 32 chars').optional(),

  // Email. Without a key the mailer prints to the terminal instead of sending.
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('attume <onboarding@resend.dev>'),
  /** Where sign-in and reset links point. */
  STOREFRONT_URL: z
    .string()
    .default('http://localhost:3000')
    // A trailing slash would turn links into "https://site//reset-password".
    .transform((v) => v.trim().replace(/\/+$/, '')),

  /**
   * Where images in email are loaded from. Defaults to the storefront, which
   * is correct in production. In development it must be set to a public host:
   * an inbox renders on Google's servers, which cannot reach localhost, so the
   * pictures arrive broken.
   */
  EMAIL_ASSET_BASE_URL: z
    .string()
    .optional()
    .transform((v) => v?.trim().replace(/\/+$/, '')),

  /** Where new pre-bookings and orders are announced to the shop. */
  ADMIN_NOTIFY_EMAIL: z.string().default('attume.official@gmail.com'),
  ADMIN_WHATSAPP_NUMBER: z.string().optional(),

  // WhatsApp Cloud API. Without a token the message is printed instead of sent.
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  /** Approved template used to confirm a pre-booking to a customer. */
  WHATSAPP_PREBOOK_TEMPLATE: z.string().optional(),
  /** Approved template used to confirm a placed order to a customer. */
  WHATSAPP_ORDER_TEMPLATE: z.string().optional(),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().default('en'),

  // Instagram feed. Optional — without a token the API serves curated posts.
  INSTAGRAM_ACCESS_TOKEN: z.string().optional(),
  INSTAGRAM_PROFILE: z.string().default('attume.official'),

  // Commerce rules
  /**
   * "prebook" takes interest without money changing hands, which is what the
   * shop runs on until a payment gateway is approved. "live" turns the bag and
   * checkout back on — the only switch needed on the day the gateway lands.
   */
  COMMERCE_MODE: z.enum(['prebook', 'live']).default('prebook'),
  /**
   * Razorpay. All three are optional so the shop still runs on cash on
   * delivery alone — online payment simply is not offered when they are
   * absent, rather than the API refusing to start.
   *
   * The key id is public: it is handed to the browser to open Checkout. The
   * other two never leave the server.
   */
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  /**
   * Set by you in the Razorpay dashboard when adding the webhook, and pasted
   * here. Deliberately not the same value as the key secret: a webhook is an
   * unauthenticated public endpoint, and its signature is the only thing
   * standing between a stranger and marking any order paid.
   */
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  /**
   * Lets an environment run test keys under NODE_ENV=production.
   *
   * QA is a production build — Render sets NODE_ENV=production on every box,
   * including the one the shop is not actually selling from — so "is this
   * production?" cannot be answered from NODE_ENV alone. An environment that
   * is allowed to take fake money therefore says so out loud. The real shop
   * never sets this, so a test key there still refuses to start.
   */
  ALLOW_TEST_PAYMENT_KEYS: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  cookieDomain: raw.COOKIE_DOMAIN && raw.COOKIE_DOMAIN.length > 0 ? raw.COOKIE_DOMAIN : undefined,
};

export type Env = typeof env;

/**
 * Online payment is offered only when the whole set is present. A key without
 * a webhook secret would take money and never hear that it arrived, which is
 * worse than not offering the option at all.
 */
export const razorpayConfigured = Boolean(
  raw.RAZORPAY_KEY_ID && raw.RAZORPAY_KEY_SECRET && raw.RAZORPAY_WEBHOOK_SECRET,
);

/**
 * Test keys on the real shop would show a customer a Checkout that takes no
 * money and reports success. Refuse to start rather than sell for nothing.
 *
 * QA opts out by setting ALLOW_TEST_PAYMENT_KEYS, because it is a production
 * build too and would otherwise be unable to test payment at all.
 */
if (env.isProd && !raw.ALLOW_TEST_PAYMENT_KEYS && raw.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
  console.error(
    'Refusing to start: RAZORPAY_KEY_ID is a test key and NODE_ENV=production. ' +
      'Set ALLOW_TEST_PAYMENT_KEYS=true if this is QA.',
  );
  process.exit(1);
}

if (raw.ALLOW_TEST_PAYMENT_KEYS && !raw.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
  // Harmless in itself, but it means someone meant to be testing and is not.
  console.warn('[api] ALLOW_TEST_PAYMENT_KEYS is set but the Razorpay key is not a test key');
}

if (razorpayConfigured && raw.RAZORPAY_KEY_SECRET === raw.RAZORPAY_WEBHOOK_SECRET) {
  console.error(
    'Refusing to start: RAZORPAY_WEBHOOK_SECRET must differ from RAZORPAY_KEY_SECRET.',
  );
  process.exit(1);
}

/** Guard for destructive maintenance scripts — seeding live data is never intended. */
export function assertNotProduction(action: string): void {
  if (env.isProd) {
    console.error(`Refusing to ${action} while NODE_ENV=production.`);
    process.exit(1);
  }
}
