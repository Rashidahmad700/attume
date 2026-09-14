import { Router } from 'express';
import { createPrebooking } from '../controllers/prebooking.controller.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { createPrebookingSchema } from '../validators/prebooking.validator.js';

const router = Router();

// Open to guests by design: asking someone to make an account before they can
// say they want a bottle would cost more sign-ups than it saves.
router.post('/', writeLimiter, validate(createPrebookingSchema), createPrebooking);

export default router;
