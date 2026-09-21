import { z } from 'zod';
import { isValidPhone, normalisePhone } from '../utils/phone.js';

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80)
    // Letters, spaces and the punctuation names actually carry — O'Brien,
    // Jean-Luc — but not digits.
    .regex(/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u, 'Name cannot contain numbers'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(50, 'Password must be 50 characters or fewer')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  // Required, and checked against the country's numbering plan rather than a
  // shape regex — the number is how an order gets delivered.
  phone: z
    .string()
    .trim()
    .min(1, 'Contact number is required')
    .refine(isValidPhone, 'Enter a valid 10-digit mobile number')
    .transform((value) => normalisePhone(value) as string),
});

/**
 * One field for either an email address or a phone number. Asking someone to
 * remember which one they signed up with is a needless way to lose them.
 */
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or phone number'),
  password: z.string().min(1, 'Password is required'),
});

/** The console has a fixed set of accounts, so it stays email-only. */
export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

