import { Router } from 'express';
import { createPrebooking, listMyPrebookings } from '../controllers/prebooking.controller.js';
import { attachUserIfPresent, requireAuth } from '../middleware/auth.middleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { createPrebookingSchema } from '../validators/prebooking.validator.js';

const router = Router();

// Open to guests by design: asking someone to make an account before they can
// say they want a bottle would cost more sign-ups than it saves.
router.post(
  '/',
  writeLimiter,
  attachUserIfPresent,
  validate(createPrebookingSchema),
  createPrebooking,
);

// What this customer has already pre-booked, so the product page can say so.
router.get('/mine', requireAuth, listMyPrebookings);

export default router;
