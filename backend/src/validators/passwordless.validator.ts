import { z } from 'zod';

export const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export const tokenOnlySchema = z.object({
  token: z.string().trim().min(20, 'This link looks incomplete'),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, 'This link looks incomplete'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
