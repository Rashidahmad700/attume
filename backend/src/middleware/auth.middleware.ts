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

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
