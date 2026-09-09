import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import instagramRoutes from './instagram.routes.js';
import adminRoutes from './admin/index.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'attume-api', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/instagram', instagramRoutes);

// Admin surface — separate cookies, separate JWT keys, separate frontend origin.
router.use('/admin', adminRoutes);

export default router;
