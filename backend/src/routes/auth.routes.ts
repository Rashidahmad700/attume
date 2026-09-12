import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  signup,
} from '../controllers/auth.controller.js';
import {
  requestMagicLink,
  requestPasswordReset,
  resetPassword,
  verifyMagicLink,
} from '../controllers/passwordless.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter, refreshLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';
import {
  emailOnlySchema,
  resetPasswordSchema,
  tokenOnlySchema,
} from '../validators/passwordless.validator.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshLimiter, refreshToken);
// Emailing a link is as sensitive as a login attempt, so it shares the limiter.
router.post('/magic-link', authLimiter, validate(emailOnlySchema), requestMagicLink);
router.post('/magic-link/verify', authLimiter, validate(tokenOnlySchema), verifyMagicLink);
router.post('/forgot-password', authLimiter, validate(emailOnlySchema), requestPasswordReset);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.get('/me', requireAuth, getCurrentUser);

export default router;
