import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number');

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional().or(z.literal('').transform(() => undefined)),
  line1: z.string().trim().min(3, 'Address line 1 is required').max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  city: z.string().trim().min(2, 'City is required').max(60),
  state: z.string().trim().min(2, 'State is required').max(60),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().trim().min(2).max(60).default('India'),
  phone: phone.optional().or(z.literal('').transform(() => undefined)),
  isDefault: z.boolean().optional().default(false),
});

/** Every field optional on edit, but at least one must be present. */
export const addressUpdateSchema = addressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
    phone: phone.optional().or(z.literal('').transform(() => undefined)),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export type AddressInput = z.infer<typeof addressSchema>;
export type AddressUpdateInput = z.infer<typeof addressUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
