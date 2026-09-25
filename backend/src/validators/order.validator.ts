import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/order.model.js';

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().trim().max(200).optional(),
});

export const paymentStatusSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES),
  note: z.string().trim().max(200).optional(),
});

export const orderQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type OrderQueryInput = z.infer<typeof orderQuerySchema>;

/**
 * A refund raised from the admin console. Rupees in, because that is what the
 * person typing it is looking at — the conversion to paise happens once, in
 * the commerce config. An absent amount refunds the whole payment.
 */
export const refundSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  reason: z.string().trim().max(200).optional(),
});
