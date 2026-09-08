import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Environment loading order:
 *   1. .env.<APP_ENV>   — per-environment file (.env.local, .env.qa, .env.production)
 *   2. .env             — fallback for anything the file above does not set
 * Real deployments set variables in the host's dashboard, where neither file
 * exists; dotenv silently skips missing files, so that path just works.
 */
const APP_ENV = (process.env.APP_ENV ?? 'local').toLowerCase();
const root = process.cwd();

for (const file of [`.env.${APP_ENV}`, '.env']) {
  const candidate = path.join(root, file);
  if (fs.existsSync(candidate)) dotenv.config({ path: candidate });
}

const envSchema = z.object({
  APP_ENV: z.enum(['local', 'qa', 'production']).default('local'),
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

  // Commerce rules — tunable per environment so QA can test edge cases.
  FREE_SHIPPING_THRESHOLD: z.coerce.number().default(2000),
  SHIPPING_FEE: z.coerce.number().default(99),
  COD_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  COD_MIN_ORDER_VALUE: z.coerce.number().default(999),
});

const parsed = envSchema.safeParse({ ...process.env, APP_ENV });

if (!parsed.success) {
  console.error(`Invalid environment variables (APP_ENV=${APP_ENV}):`);
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  ...raw,
  isProd: raw.APP_ENV === 'production',
  isQa: raw.APP_ENV === 'qa',
  isLocal: raw.APP_ENV === 'local',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  cookieDomain: raw.COOKIE_DOMAIN && raw.COOKIE_DOMAIN.length > 0 ? raw.COOKIE_DOMAIN : undefined,
};

export type Env = typeof env;

/**
 * Guard for destructive maintenance scripts. Seeding or wiping production data
 * is never a thing you meant to do from a terminal.
 */
export function assertNotProduction(action: string): void {
  if (env.isProd) {
    console.error(`Refusing to ${action} while APP_ENV=production.`);
    process.exit(1);
  }
}
