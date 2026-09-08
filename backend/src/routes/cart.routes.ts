import { Router } from 'express';
import { validateCart } from '../controllers/cart.controller.js';

const router = Router();

// Guests have carts too, so this stays unauthenticated.
router.post('/validate', validateCart);

export default router;
