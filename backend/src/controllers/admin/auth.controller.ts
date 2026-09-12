import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import {
  ADMIN_REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  verifyRefreshToken,
} from '../../utils/tokens.js';
import type { LoginInput } from '../../validators/auth.validator.js';

/**
 * POST /api/v1/admin/auth/login
 * There is no admin signup endpoint by design — accounts are promoted with the
 * create-admin script. A non-admin who guesses valid credentials still gets the
 * same generic 401, so this endpoint never reveals who is an admin.
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  const isMatch = user ? await user.comparePassword(password) : false;

  if (!user || !isMatch || user.role !== 'admin') {
    throw ApiError.unauthorized('Invalid credentials');
  }

  setAuthCookies(res, {
    sub: user.id,
    role: 'admin',
    scope: 'admin',
    tv: user.tokenVersion,
  });

  res.status(200).json({
    success: true,
    message: 'Signed in',
    data: { admin: user.toJSON() },
  });
});

/** POST /api/v1/admin/auth/logout */
export const adminLogout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
  if (token) {
    try {
      const payload = verifyRefreshToken(token, 'admin');
      await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
    } catch {
      /* already invalid */
    }
  }

  clearAuthCookies(res, 'admin');
  res.status(200).json({ success: true, message: 'Signed out' });
});

/** POST /api/v1/admin/auth/refresh-token */
export const adminRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[ADMIN_REFRESH_COOKIE] as string | undefined;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(token, 'admin');
  } catch {
    clearAuthCookies(res, 'admin');
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  // Re-check the role on every refresh so revocation takes effect quickly.
  const user = await User.findById(payload.sub);
  if (!user || user.role !== 'admin') {
    clearAuthCookies(res, 'admin');
    throw ApiError.unauthorized('Admin access revoked');
  }

  if (payload.tv !== user.tokenVersion) {
    clearAuthCookies(res, 'admin');
    throw ApiError.unauthorized('This session has been signed out');
  }

  setAuthCookies(res, {
    sub: user.id,
    role: 'admin',
    scope: 'admin',
    tv: user.tokenVersion,
  });

  res.status(200).json({
    success: true,
    message: 'Session refreshed',
    data: { admin: user.toJSON() },
  });
});

/** GET /api/v1/admin/auth/me */
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('Admin not found');

  res.status(200).json({ success: true, data: { admin: user.toJSON() } });
});
