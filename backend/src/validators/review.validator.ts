import { z } from 'zod';

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: z.string().trim().max(120).optional().or(z.literal('').transform(() => undefined)),
  body: z.string().trim().min(4, 'Tell us a little more').max(1500),
});
