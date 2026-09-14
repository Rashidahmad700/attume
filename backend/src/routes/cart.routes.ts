import { Router } from 'express';
import { validateCart } from '../controllers/cart.controller.js';
import { publicApiLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { validateCartSchema } from '../validators/checkout.validator.js';

const router = Router();

// Guests have carts too, so this stays unauthenticated.
router.post('/validate', publicApiLimiter, validate(validateCartSchema), validateCart);

export default router;
