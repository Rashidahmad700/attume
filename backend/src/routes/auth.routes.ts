import { Router } from 'express';
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  signup,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter, refreshLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh-token', refreshLimiter, refreshToken);
router.get('/me', requireAuth, getCurrentUser);

export default router;
