import { z } from 'zod';

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may contain lowercase letters, numbers and hyphens');

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(80),
  slug,
  tagline: z.string().trim().min(4, 'Tagline is required').max(160),
  description: z.string().trim().max(2000).optional().default(''),
  notes: z.array(z.string().trim().min(1)).max(12).optional().default([]),
  concentration: z.string().trim().max(60).optional().default('Extrait de Parfum'),
  sizeMl: z.coerce.number().int().positive().optional().default(50),
  sku: z.string().trim().toUpperCase().min(3, 'SKU is required').max(24),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  compareAtPrice: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').optional().default(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().default(5),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  isFeatured: z.boolean().optional().default(false),
  badge: z.string().trim().max(24).optional().or(z.literal('').transform(() => undefined)),
  images: z
    .array(z.object({ url: z.string().trim().min(1), alt: z.string().trim().optional() }))
    .max(8)
    .optional()
    .default([]),
});

export const productUpdateSchema = productCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

/** Stock edits get their own endpoint so the audit trail stays readable. */
export const stockUpdateSchema = z.object({
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

export const productQuerySchema = z.object({
  search: z.string().trim().max(80).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  stock: z.enum(['in', 'low', 'out']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
