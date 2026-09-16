import type { RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../utils/tokens.js';
import type { UserRole } from '../models/user.model.js';

/** Requires a valid access token cookie (falls back to Bearer header). */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = (req.cookies?.[ACCESS_COOKIE] as string | undefined) ?? bearer;

  if (!token) return next(ApiError.unauthorized());

  try {
    const payload = verifyAccessToken(token, 'storefront');
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Attaches the customer when a valid session is present, and does nothing when
 * it is not.
 *
 * For routes a guest may use but a signed-in customer should not have to
 * repeat themselves on — pre-booking is open to anyone, yet an account's own
 * pre-booking should be tied to it. A bad or expired token is treated as
 * signed out rather than as an error.
 */
export const attachUserIfPresent: RequestHandler = (req, _res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = (req.cookies?.[ACCESS_COOKIE] as string | undefined) ?? bearer;
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token, 'storefront');
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    // Signed out, as far as this route is concerned.
  }
  next();
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
