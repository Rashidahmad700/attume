import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export type TokenScope = 'storefront' | 'admin';

export type TokenPayload = {
  sub: string;
  role: 'customer' | 'admin';
  scope: TokenScope;
  /** Bumped on sign-out; a refresh carrying a stale value is rejected. */
  tv: number;
};

/**
 * Pinned so a token cannot arrive claiming a different algorithm. Without
 * this, jsonwebtoken will verify whatever the header asks for.
 */
const ALGORITHM = 'HS256' as const;

export const ACCESS_COOKIE = 'attume_access';
export const REFRESH_COOKIE = 'attume_refresh';
export const ADMIN_ACCESS_COOKIE = 'attume_admin_access';
export const ADMIN_REFRESH_COOKIE = 'attume_admin_refresh';

/** Each scope carries its own keys, lifetimes and cookie names. */
const scopeConfig = {
  storefront: {
    accessSecret: () => env.JWT_ACCESS_SECRET,
    refreshSecret: () => env.JWT_REFRESH_SECRET,
    accessExpiry: () => env.JWT_ACCESS_EXPIRES_IN,
    refreshExpiry: () => env.JWT_REFRESH_EXPIRES_IN,
    accessCookie: ACCESS_COOKIE,
    refreshCookie: REFRESH_COOKIE,
  },
  admin: {
    accessSecret: () => env.ADMIN_JWT_ACCESS_SECRET,
    refreshSecret: () => env.ADMIN_JWT_REFRESH_SECRET,
    accessExpiry: () => env.ADMIN_JWT_ACCESS_EXPIRES_IN,
    refreshExpiry: () => env.ADMIN_JWT_REFRESH_EXPIRES_IN,
    accessCookie: ADMIN_ACCESS_COOKIE,
    refreshCookie: ADMIN_REFRESH_COOKIE,
  },
} as const;

export const cookieNames = (scope: TokenScope) => ({
  access: scopeConfig[scope].accessCookie,
  refresh: scopeConfig[scope].refreshCookie,
});

function sign(payload: TokenPayload, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn, algorithm: ALGORITHM } as SignOptions);
}

export function verifyAccessToken(token: string, scope: TokenScope = 'storefront'): TokenPayload {
  const config = scopeConfig[scope];
  const payload = jwt.verify(token, config.accessSecret(), {
    algorithms: [ALGORITHM],
  }) as TokenPayload;
  // Defence in depth: reject a token minted for a different surface.
  if (payload.scope !== scope) throw new jwt.JsonWebTokenError('Token scope mismatch');
  return payload;
}

export function verifyRefreshToken(token: string, scope: TokenScope = 'storefront'): TokenPayload {
  const config = scopeConfig[scope];
  const payload = jwt.verify(token, config.refreshSecret(), {
    algorithms: [ALGORITHM],
  }) as TokenPayload;
  if (payload.scope !== scope) throw new jwt.JsonWebTokenError('Token scope mismatch');
  return payload;
}

/** ms helper for cookie maxAge, supports 15m / 7d / 3600s style strings. */
function toMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 15 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2] as 's' | 'm' | 'h' | 'd';
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 } as const;
  return value * multipliers[unit];
}

function baseCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.cookieDomain,
    path: '/',
    maxAge,
  };
}

export function setAuthCookies(res: Response, payload: TokenPayload): void {
  const config = scopeConfig[payload.scope];
  const accessToken = sign(payload, config.accessSecret(), config.accessExpiry());
  const refreshToken = sign(payload, config.refreshSecret(), config.refreshExpiry());

  res.cookie(config.accessCookie, accessToken, baseCookieOptions(toMs(config.accessExpiry())));
  res.cookie(config.refreshCookie, refreshToken, baseCookieOptions(toMs(config.refreshExpiry())));
}

export function clearAuthCookies(res: Response, scope: TokenScope = 'storefront'): void {
  const config = scopeConfig[scope];
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.cookieDomain,
    path: '/',
  };
  res.clearCookie(config.accessCookie, options);
  res.clearCookie(config.refreshCookie, options);
}
