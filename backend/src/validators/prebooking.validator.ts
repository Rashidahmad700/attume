import { z } from 'zod';
import { isValidPhone, normalisePhone } from '../utils/phone.js';
import { PREBOOKING_SOURCES, PREBOOKING_STATUSES } from '../models/prebooking.model.js';

export const createPrebookingSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  // Optional, because a pre-booking is an expression of interest rather than
  // an order — but checked properly when given, using the same rule as sign-up.
  phone: z
    .string()
    .trim()
    .refine((value) => !value || isValidPhone(value), 'Enter a valid 10-digit mobile number')
    .transform((value) => (value ? (normalisePhone(value) as string) : undefined))
    .optional(),
  /** Absent for a plain list sign-up. */
  slug: z.string().trim().min(1).max(120).optional(),
  quantity: z.coerce.number().int().min(1).max(5).default(1),
  city: z.string().trim().max(60).optional().or(z.literal('').transform(() => undefined)),
  note: z.string().trim().max(500).optional().or(z.literal('').transform(() => undefined)),
  source: z.enum(PREBOOKING_SOURCES).default('product'),
});

export const prebookingQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(PREBOOKING_STATUSES).optional(),
  source: z.enum(PREBOOKING_SOURCES).optional(),
  slug: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const prebookingUpdateSchema = z.object({
  status: z.enum(PREBOOKING_STATUSES),
});

export type CreatePrebookingInput = z.infer<typeof createPrebookingSchema>;
export type PrebookingQueryInput = z.infer<typeof prebookingQuerySchema>;
