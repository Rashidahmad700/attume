import { Router } from 'express';
import { getMyOrder, listMyOrders, placeOrder } from '../controllers/order.controller.js';
import { verifyPayment } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { placeOrderSchema } from '../validators/checkout.validator.js';
import { verifyPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

// Ordering requires an account — guest checkout is a later decision.
router.use(requireAuth);

router.route('/').get(listMyOrders).post(writeLimiter, validate(placeOrderSchema), placeOrder);
router.get('/:orderNumber', getMyOrder);

/**
 * The browser's report from Razorpay Checkout. Rate limited like any other
 * write: a valid signature cannot be guessed, but there is no reason to let
 * anyone sit here trying.
 */
router.post(
  '/:orderNumber/pay/verify',
  writeLimiter,
  validate(verifyPaymentSchema),
  verifyPayment,
);

export default router;
