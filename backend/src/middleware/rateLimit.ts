import rateLimit from 'express-rate-limit';
import { clientIp } from '../utils/clientIp.js';

/** Every limiter counts per shopper, not per storefront server. */
const shared = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: clientIp,
} as const;

/** Guards credential endpoints against brute force. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  ...shared,
  message: { success: false, message: 'Too many attempts. Try again in a few minutes.' },
});

/** Admin credentials are a higher-value target, so the budget is tighter. */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  ...shared,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

/**
 * Refresh is unauthenticated by design (the cookie is the credential), so it
 * needs its own ceiling — otherwise it is a free oracle for guessing tokens.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  ...shared,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});

/** Anything a guest can call repeatedly: cart pricing, catalogue search. */
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  ...shared,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

/** Writes that cost us something real — orders, reviews. */
export const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  ...shared,
  message: { success: false, message: 'Too many requests. Please try again in a few minutes.' },
});

