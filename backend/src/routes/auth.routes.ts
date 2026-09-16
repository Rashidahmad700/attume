import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  signup,
} from '../controllers/auth.controller.js';
import {
  requestPasswordReset,
  resetPassword,
} from '../controllers/passwordless.controller.js';
import { sendOtp, verifyOtp } from '../controllers/otp.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter, otpLimiter, refreshLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import {
  loginSchema,
  otpSendSchema,
  otpVerifySchema,
  signupSchema,
} from '../validators/auth.validator.js';
import {
  emailOnlySchema,
  resetPasswordSchema,
} from '../validators/passwordless.validator.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshLimiter, refreshToken);
// Emailing a link is as sensitive as a login attempt, so it shares the limiter.
router.post('/forgot-password', authLimiter, validate(emailOnlySchema), requestPasswordReset);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);

router.get('/me', requireAuth, getCurrentUser);

// Codes are only ever sent to the signed-in customer's own contact details,
// so there is nothing here an anonymous caller can aim at someone else.
router.post('/otp/send', otpLimiter, requireAuth, validate(otpSendSchema), sendOtp);
router.post('/otp/verify', otpLimiter, requireAuth, validate(otpVerifySchema), verifyOtp);

export default router;
