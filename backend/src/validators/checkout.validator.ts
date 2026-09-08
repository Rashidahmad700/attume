import { z } from 'zod';

const addressSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number'),
  line1: z.string().trim().min(3, 'Address line 1 is required').max(120),
  line2: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  city: z.string().trim().min(2, 'City is required').max(60),
  state: z.string().trim().min(2, 'State is required').max(60),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Enter a valid 6-digit PIN code'),
  country: z.string().trim().min(2).max(60).default('India'),
});

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(5),
      }),
    )
    .min(1, 'Your bag is empty'),
  // Either an id from the saved address book, or a full address typed at checkout.
  addressId: z.string().trim().optional(),
  address: addressSchema.optional(),
  paymentMethod: z.enum(['cod', 'online']).default('cod'),
  saveAddress: z.boolean().optional().default(false),
  /** Client-generated; makes a double-submit return the first order. */
  idempotencyKey: z.string().trim().min(8).max(64),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
