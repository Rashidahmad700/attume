import { Router } from 'express';
import {
  cancelMyOrder,
  getMyOrder,
  listMyOrders,
  placeOrder,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { placeOrderSchema } from '../validators/checkout.validator.js';

const router = Router();

// Ordering requires an account — guest checkout is a later decision.
router.use(requireAuth);

router.route('/').get(listMyOrders).post(writeLimiter, validate(placeOrderSchema), placeOrder);
router.get('/:orderNumber', getMyOrder);
router.patch('/:orderNumber/cancel', writeLimiter, cancelMyOrder);

export default router;
