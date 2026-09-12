import rateLimit from 'express-rate-limit';

/** Guards credential endpoints against brute force. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again in a few minutes.' },
});

/** Admin credentials are a higher-value target, so the budget is tighter. */
export const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' },
});

/**
 * Refresh is unauthenticated by design (the cookie is the credential), so it
 * needs its own ceiling — otherwise it is a free oracle for guessing tokens.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again shortly.' },
});

/** Anything a guest can call repeatedly: cart pricing, catalogue search. */
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

/** Writes that cost us something real — orders, reviews. */
export const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in a few minutes.' },
});
