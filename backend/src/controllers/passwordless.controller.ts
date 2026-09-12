import { env } from '../config/env.js';
import { AuthToken, createRawToken, hashToken } from '../models/authToken.model.js';
import { User } from '../models/user.model.js';
import { sendMail } from '../services/mailer.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setAuthCookies } from '../utils/tokens.js';

const LIFETIMES = {
  'magic-link': 15 * 60 * 1000,
  'password-reset': 60 * 60 * 1000,
} as const;

/**
 * Both flows answer identically whether or not the address exists. Anything
 * else turns these endpoints into a way to enumerate customers.
 */
const ACCEPTED = {
  success: true,
  message: 'If that email has an account, a link is on its way.',
};

async function issueToken(
  userId: string,
  type: 'magic-link' | 'password-reset',
): Promise<string> {
  // One live token per type: requesting a new link retires the previous one.
  await AuthToken.deleteMany({ user: userId, type, usedAt: { $exists: false } });

  const { raw, hash } = createRawToken();
  await AuthToken.create({
    user: userId,
    type,
    tokenHash: hash,
    expiresAt: new Date(Date.now() + LIFETIMES[type]),
  });
  return raw;
}

/** POST /api/v1/auth/magic-link */
export const requestMagicLink = asyncHandler(async (req, res) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  if (user) {
    const token = await issueToken(user.id as string, 'magic-link');
    const link = `${env.STOREFRONT_URL}/auth/sign-in?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Your attume sign-in link',
      text: [
        `Hello ${user.name.split(' ')[0]},`,
        '',
        'Use this link to sign in. It works once and expires in 15 minutes.',
        '',
        link,
        '',
        'If you did not ask for this, you can ignore this email.',
        '',
        'attume',
      ].join('\n'),
    });
  }

  res.status(200).json(ACCEPTED);
});

/** POST /api/v1/auth/magic-link/verify */
export const verifyMagicLink = asyncHandler(async (req, res) => {
  const { token } = req.body as { token: string };

  const record = await AuthToken.findOne({
    tokenHash: hashToken(token),
    type: 'magic-link',
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
  if (!record) throw ApiError.unauthorized('This link has expired or already been used');

  const user = await User.findById(record.user);
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  record.usedAt = new Date();
  await record.save();

  setAuthCookies(res, {
    sub: user.id as string,
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

/** POST /api/v1/auth/forgot-password */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email });

  if (user) {
    const token = await issueToken(user.id as string, 'password-reset');
    const link = `${env.STOREFRONT_URL}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your attume password',
      text: [
        `Hello ${user.name.split(' ')[0]},`,
        '',
        'Use this link to choose a new password. It works once and expires in an hour.',
        '',
        link,
        '',
        'If you did not ask for this, ignore this email — your password stays as it is.',
        '',
        'attume',
      ].join('\n'),
    });
  }

  res.status(200).json(ACCEPTED);
});

/** POST /api/v1/auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body as { token: string; password: string };

  const record = await AuthToken.findOne({
    tokenHash: hashToken(token),
    type: 'password-reset',
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
  if (!record) throw ApiError.unauthorized('This link has expired or already been used');

  const user = await User.findById(record.user).select('+password');
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  // Saving bumps tokenVersion, so every existing session is cut — which is the
  // point of a reset when the old password may be compromised.
  user.password = password;
  await user.save();

  record.usedAt = new Date();
  await record.save();

  // Any other reset links outstanding for this account are now void.
  await AuthToken.deleteMany({ user: user._id, type: 'password-reset' });

  setAuthCookies(res, {
    sub: user.id as string,
    role: user.role,
    scope: 'storefront',
    tv: user.tokenVersion,
  });

  res.status(200).json({
    success: true,
    message: 'Password updated',
    data: { user: user.toJSON() },
  });
});
