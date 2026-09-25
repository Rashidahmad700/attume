/**
 * Everything that talks to Razorpay, and nothing that decides anything.
 *
 * The signature checks live here rather than in the controllers because they
 * are the whole of the security model: Razorpay tells us an order was paid by
 * signing the claim with a secret only the two of us hold. A controller that
 * skipped this would be taking a stranger's word for it.
 *
 * Two different secrets are involved and they are not interchangeable:
 *   - the key secret signs what the browser hands back after Checkout
 *   - the webhook secret signs what Razorpay's servers post to us
 */
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env, razorpayConfigured } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/** Built once, on first use — the constructor throws when keys are absent. */
let client: Razorpay | null = null;

function gateway(): Razorpay {
  if (!razorpayConfigured) {
    throw ApiError.badRequest('Online payment is not available at the moment');
  }
  client ??= new Razorpay({
    key_id: env.RAZORPAY_KEY_ID!,
    key_secret: env.RAZORPAY_KEY_SECRET!,
  });
  return client;
}

/**
 * Compares two signatures without leaking where they first differ.
 *
 * A plain `===` returns as soon as a byte disagrees, and the time that takes
 * is measurable over enough attempts — which is a way to discover a valid
 * signature one byte at a time. timingSafeEqual takes the same time whatever
 * the input, but throws on unequal lengths, so that is checked first (a length
 * mismatch tells an attacker nothing they did not already supply).
 */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hmac(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export interface GatewayOrder {
  id: string;
  amount: number;
  currency: string;
}

/**
 * Opens an order on Razorpay's side. The amount is fixed here and Checkout
 * will not let the customer pay a different one, which is what stops a browser
 * deciding its own price.
 */
export async function createGatewayOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<GatewayOrder> {
  const created = await gateway().orders.create({
    amount: input.amountPaise,
    currency: 'INR',
    receipt: input.receipt,
    // Razorpay's own idempotency: a repeated receipt returns the same order
    // rather than opening a second one for the same checkout.
    notes: input.notes,
  });

  return {
    id: created.id,
    amount: Number(created.amount),
    currency: created.currency,
  };
}

/**
 * Checks what the browser handed back after Checkout closed.
 *
 * Razorpay signs `order_id|payment_id` with the key secret. This proves the
 * pair came from Razorpay — it does not prove the money was captured, which
 * is why the webhook still has the final say.
 */
export function verifyCheckoutSignature(input: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
}): boolean {
  if (!razorpayConfigured) return false;
  const expected = hmac(
    env.RAZORPAY_KEY_SECRET!,
    `${input.gatewayOrderId}|${input.gatewayPaymentId}`,
  );
  return signaturesMatch(expected, input.signature);
}

/**
 * Checks a webhook against the raw bytes Razorpay sent.
 *
 * It must be the raw body: re-serialising parsed JSON reorders keys and drops
 * whitespace, and the signature is over the exact bytes. This is why the
 * webhook route is mounted before the JSON body parser.
 */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = hmac(env.RAZORPAY_WEBHOOK_SECRET, rawBody.toString('utf8'));
  return signaturesMatch(expected, signature);
}

/**
 * Asks Razorpay what actually happened to a payment.
 *
 * The signature proves a payment id belongs to an order; it does not prove the
 * money was captured. With automatic capture the two arrive together, but the
 * setting can be changed in the dashboard without anyone touching this code,
 * so the status is read rather than assumed.
 */
export async function fetchPayment(gatewayPaymentId: string): Promise<{
  id: string;
  status: string;
  amount: number;
  method?: string;
  orderId?: string;
}> {
  const payment = await gateway().payments.fetch(gatewayPaymentId);
  return {
    id: payment.id,
    status: payment.status,
    amount: Number(payment.amount),
    method: payment.method,
    orderId: payment.order_id ?? undefined,
  };
}

/** Raises a refund. Partial when an amount is given, otherwise the whole payment. */
export async function refundPayment(input: {
  gatewayPaymentId: string;
  amountPaise?: number;
  reason?: string;
}): Promise<{ id: string; amount: number }> {
  const refund = await gateway().payments.refund(input.gatewayPaymentId, {
    ...(input.amountPaise ? { amount: input.amountPaise } : {}),
    speed: 'normal',
    notes: input.reason ? { reason: input.reason } : undefined,
  });
  return { id: refund.id, amount: Number(refund.amount) };
}

/** What the browser is allowed to know. The secret is never part of this. */
export function publicGatewayConfig() {
  return { provider: 'razorpay' as const, keyId: env.RAZORPAY_KEY_ID ?? null };
}
