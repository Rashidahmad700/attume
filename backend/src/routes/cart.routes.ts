import { Router } from 'express';
import { validateCart } from '../controllers/cart.controller.js';
import { publicApiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Guests have carts too, so this stays unauthenticated.
router.post('/validate', publicApiLimiter, validateCart);

export default router;
