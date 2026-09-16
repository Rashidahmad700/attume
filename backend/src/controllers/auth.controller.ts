import { User } from '../models/user.model.js';
import { normalisePhone } from '../utils/phone.js';
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

  // Either identifier signs someone in, so either one already in use means an
  // account exists — and says which, so the person knows how to get in.
  const existing = await User.findOne({ $or: [{ email }, { phone }] })
    .select('email phone')
    .lean();
  if (existing) {
    throw ApiError.conflict(
      existing.email === email
        ? 'An account with this email already exists — sign in instead'
        : 'An account with this phone number already exists — sign in instead',
    );
  }

  const user = await User.create({ name, email, password, phone });

  setAuthCookies(res, {
    sub: user.id,
    role: user.role,
    scope: 'storefront',
    tv: user.tokenVersion,
  });

  res.status(201).json({
    success: true,
    message: 'Account created',
    data: { user: user.toJSON() },
  });
});

/** POST /api/v1/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body as LoginInput;

  // One field, either kind of credential. A number is normalised first so it
  // matches however it was typed — and the raw digits are tried too, because
  // accounts created before numbers were stored in E.164 hold whatever was
  // typed at sign-up and would otherwise never match.
  const phone = normalisePhone(identifier);
  const digits = identifier.replace(/\D/g, '');
  const local = digits.replace(/^(?:0091|91|0)/, '');
  const user = await User.findOne(
    phone
      ? {
          // E.164 first, then the shapes an older record might hold: exactly
          // what was typed, the digits alone, and the ten-digit local form.
          $or: [{ phone }, { phone: identifier.trim() }, { phone: digits }, { phone: local }],
        }
      : { email: identifier.toLowerCase() },
  ).select('+password');

  // The same answer either way: whether an account exists is not something an
  // unauthenticated caller should be able to probe.
  if (!user) throw ApiError.unauthorized('Those details do not match an account');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Those details do not match an account');

  setAuthCookies(res, {
    sub: user.id,
    role: user.role,
    scope: 'storefront',
    tv: user.tokenVersion,
  });

  res.status(200).json({
    success: true,
    message: 'Signed in',
    data: { user: user.toJSON() },
  });
});

/** POST /api/v1/auth/logout */
export const logout = asyncHandler(async (req, res) => {
  // Clearing the cookie only stops this browser. Bumping the version makes
  // any copy of the refresh token useless, which is what "sign out" implies.
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) {
    try {
      const payload = verifyRefreshToken(token, 'storefront');
      await User.updateOne({ _id: payload.sub }, { $inc: { tokenVersion: 1 } });
    } catch {
      /* already invalid — clearing the cookie is enough */
    }
  }

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

  // A token minted before the last sign-out must not be revivable.
  if (payload.tv !== user.tokenVersion) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('This session has been signed out');
  }

  setAuthCookies(res, {
    sub: user.id,
    role: user.role,
    scope: 'storefront',
    tv: user.tokenVersion,
  });

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
