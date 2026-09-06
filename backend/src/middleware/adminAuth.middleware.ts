import type { RequestHandler } from 'express';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ADMIN_ACCESS_COOKIE, verifyAccessToken } from '../utils/tokens.js';

/**
 * Admin guard. Three independent checks must all pass:
 *  1. the cookie is signed with the admin key (different secret to storefront),
 *  2. the payload carries scope 'admin',
 *  3. the user still holds the admin role in the database.
 * Step 3 means demoting a user revokes access immediately, without waiting
 * for their token to expire.
 */
export const requireAdmin: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.[ADMIN_ACCESS_COOKIE] as string | undefined;
  if (!token) return next(ApiError.unauthorized());

  try {
    const payload = verifyAccessToken(token, 'admin');
    if (payload.role !== 'admin') return next(ApiError.forbidden());

    const user = await User.findById(payload.sub).select('role');
    if (!user || user.role !== 'admin') return next(ApiError.forbidden());

    req.user = { id: payload.sub, role: 'admin' };
    next();
  } catch (error) {
    next(error);
  }
};
