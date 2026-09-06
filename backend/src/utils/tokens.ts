import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';

export type TokenPayload = {
  sub: string;
  role: 'customer' | 'admin';
};

export const ACCESS_COOKIE = 'attume_access';
export const REFRESH_COOKIE = 'attume_refresh';

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
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
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions(toMs(env.JWT_ACCESS_EXPIRES_IN)));
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookieOptions(toMs(env.JWT_REFRESH_EXPIRES_IN)));
}

export function clearAuthCookies(res: Response): void {
  const options: CookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAMESITE,
    domain: env.cookieDomain,
    path: '/',
  };
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
}
