import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  verifyRefreshToken,
} from '../utils/tokens.js';
import type { LoginInput, SignupInput } from '../validators/auth.validator.js';

/** POST /api/v1/auth/signup */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body as SignupInput;

  const existing = await User.findOne({ email }).lean();
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, phone });

  setAuthCookies(res, { sub: user.id, role: user.role, scope: 'storefront' });

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user: user.toJSON() },
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput;

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password');

  setAuthCookies(res, { sub: user.id, role: user.role, scope: 'storefront' });

  res.status(200).json({
    success: true,
    message: 'Signed in',
    data: { user: user.toJSON() },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Signed out' });
});

/** POST /api/v1/auth/refresh-token */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) throw ApiError.unauthorized('Refresh token missing');

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Account no longer exists');
  }

  setAuthCookies(res, { sub: user.id, role: user.role, scope: 'storefront' });

  res.status(200).json({
    success: true,
    message: 'Session refreshed',
    data: { user: user.toJSON() },
  });
});

/** GET /api/v1/auth/me */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  res.status(200).json({
    success: true,
    data: { user: user.toJSON() },
  });
});
