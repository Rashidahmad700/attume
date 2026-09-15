import { z } from 'zod';

export const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});


export const resetPasswordSchema = z.object({
  token: z.string().trim().min(20, 'This link looks incomplete'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(50, 'Password must be 50 characters or fewer')
    .regex(/[a-zA-Z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});
