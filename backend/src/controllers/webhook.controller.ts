/**
 * Razorpay's own account of what happened, and the only one the shop believes.
 *
 * This endpoint is public — anyone on the internet can post to it — so the
 * signature is the whole of its security. It is checked against the raw
 * request bytes before the body is even parsed, and nothing else in here runs
 * until it passes.
 *
 * Every handler below is idempotent. Razorpay retries a webhook it gets no
 * answer to, for hours, so the same event arriving five times must settle an
 * order once.
 */
import type { Request, Response } from 'express';
import { markOrderFailed, markOrderPaid, recordRefund } from '../services/payment.service.js';
import { verifyWebhookSignature } from '../services/razorpay.service.js';

/** The slices of Razorpay's payload this cares about. */
interface WebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        method?: string;
        status: string;
        error_description?: string;
      };
    };
    refund?: {
      entity: { id: string; payment_id: string; amount: number; notes?: Record<string, string> };
    };
  };
}

/** POST /api/v1/webhooks/razorpay — mounted with a raw body parser. */
export async function razorpayWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.header('x-razorpay-signature');
  const raw = req.body as Buffer;

  if (!signature || !Buffer.isBuffer(raw) || !verifyWebhookSignature(raw, signature)) {
    // No detail in the reply: an unsigned caller learns only that it failed.
    console.error('[webhook] rejected a request with a bad or missing signature');
    res.status(400).json({ success: false, message: 'Invalid signature' });
    return;
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(raw.toString('utf8')) as WebhookPayload;
  } catch {
    res.status(400).json({ success: false, message: 'Malformed payload' });
    return;
  }

  const payment = body.payload.payment?.entity;
  const refund = body.payload.refund?.entity;

  // Ids only. The full body carries customer contact details and belongs in
  // Razorpay's dashboard rather than in our logs.
  console.log(`[webhook] ${body.event} ${payment?.id ?? refund?.id ?? ''}`);

  try {
    switch (body.event) {
      case 'payment.captured':
      case 'order.paid': {
        if (!payment) break;
        await markOrderPaid({
          gatewayOrderId: payment.order_id,
          gatewayPaymentId: payment.id,
          amountPaise: payment.amount,
          method: payment.method,
          source: 'webhook',
        });
        break;
      }

      case 'payment.failed': {
        if (!payment) break;
        await markOrderFailed({
          gatewayOrderId: payment.order_id,
          reason: payment.error_description ?? 'Payment failed',
          source: 'webhook',
        });
        break;
      }

      case 'refund.processed': {
        if (!refund) break;
        await recordRefund({
          gatewayPaymentId: refund.payment_id,
          refundId: refund.id,
          amountPaise: refund.amount,
          reason: refund.notes?.reason,
        });
        break;
      }

      default:
        // Subscribed to more events than we act on, or Razorpay added one.
        // Acknowledged so it is not retried forever.
        break;
    }
  } catch (error) {
    // A non-2xx asks Razorpay to send it again, which is what we want when
    // the failure was ours — the handlers are safe to repeat.
    console.error(`[webhook] ${body.event} failed:`, (error as Error).message);
    res.status(500).json({ success: false, message: 'Could not process the event' });
    return;
  }

  res.status(200).json({ success: true });
}
