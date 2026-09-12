import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  adminRefreshToken,
  getCurrentAdmin,
} from '../../controllers/admin/auth.controller.js';
import { getDashboard } from '../../controllers/admin/dashboard.controller.js';
import {
  archiveProduct,
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  updateStock,
} from '../../controllers/admin/product.controller.js';
import {
  getOrder,
  listOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from '../../controllers/admin/order.controller.js';
import { listCustomers } from '../../controllers/admin/customer.controller.js';
import { requireAdmin } from '../../middleware/adminAuth.middleware.js';
import { adminAuthLimiter, refreshLimiter } from '../../middleware/rateLimit.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from '../../validators/auth.validator.js';
import { orderQuerySchema, orderStatusSchema, paymentStatusSchema } from '../../validators/order.validator.js';
import {
  productCreateSchema,
  productQuerySchema,
  productUpdateSchema,
  stockUpdateSchema,
} from '../../validators/product.validator.js';

const router = Router();

// Public admin surface: login and refresh only. No signup route exists.
router.post('/auth/login', adminAuthLimiter, validate(loginSchema), adminLogin);
router.post('/auth/refresh-token', refreshLimiter, adminRefreshToken);
router.post('/auth/logout', adminLogout);

// Everything past this line demands a valid admin session.
router.use(requireAdmin);

router.get('/auth/me', getCurrentAdmin);
router.get('/dashboard', getDashboard);

router
  .route('/products')
  .get(validate(productQuerySchema, 'query'), listProducts)
  .post(validate(productCreateSchema), createProduct);

router
  .route('/products/:id')
  .get(getProduct)
  .patch(validate(productUpdateSchema), updateProduct)
  .delete(archiveProduct);

router.patch('/products/:id/stock', validate(stockUpdateSchema), updateStock);

router.get('/orders', validate(orderQuerySchema, 'query'), listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', validate(orderStatusSchema), updateOrderStatus);
router.patch('/orders/:id/payment', validate(paymentStatusSchema), updatePaymentStatus);

router.get('/customers', listCustomers);

export default router;
