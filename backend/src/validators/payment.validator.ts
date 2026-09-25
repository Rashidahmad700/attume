import { z } from 'zod';

/**
 * What Razorpay Checkout hands the browser on success. The gateway order id is
 * deliberately not accepted from the client — it is read from the order being
 * paid, so a caller cannot point a real payment at someone else's order.
 */
export const verifyPaymentSchema = z.object({
  gatewayPaymentId: z.string().trim().min(6).max(64),
  signature: z
    .string()
    .trim()
    // HMAC-SHA256, hex. Shape-checked here so obvious rubbish never reaches
    // the comparison.
    .regex(/^[a-f0-9]{64}$/, 'Malformed payment signature'),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
