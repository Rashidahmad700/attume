import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Admin sessions are signed with their own keys, so a storefront token can
  // never be replayed against an admin route.
  ADMIN_JWT_ACCESS_SECRET: z.string().min(16, 'ADMIN_JWT_ACCESS_SECRET must be at least 16 chars'),
  ADMIN_JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'ADMIN_JWT_REFRESH_SECRET must be at least 16 chars'),
  ADMIN_JWT_ACCESS_EXPIRES_IN: z.string().default('30m'),
  ADMIN_JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_DOMAIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  cookieDomain: raw.COOKIE_DOMAIN && raw.COOKIE_DOMAIN.length > 0 ? raw.COOKIE_DOMAIN : undefined,
};

export type Env = typeof env;
