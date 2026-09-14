import { z } from 'zod';
import { PREBOOKING_SOURCES, PREBOOKING_STATUSES } from '../models/prebooking.model.js';

export const createPrebookingSchema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid contact number')
    .optional()
    .or(z.literal('').transform(() => undefined)),
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
