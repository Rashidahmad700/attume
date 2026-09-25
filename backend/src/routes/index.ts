import { Router } from 'express';
import { commerce } from '../config/commerce.js';
import { publicGatewayConfig } from '../services/razorpay.service.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import instagramRoutes from './instagram.routes.js';
import prebookingRoutes from './prebooking.routes.js';
import adminRoutes from './admin/index.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'attume-api', uptime: process.uptime() });
});

/**
 * What the storefront is allowed to do right now. Read on every render so the
 * shop can be switched from pre-booking to selling by changing one variable on
 * the server, with no rebuild of the site.
 */
router.get('/config', (_req, res) => {
  res.json({
    success: true,
    data: {
      commerce: {
        mode: commerce.mode,
        isPrebook: commerce.isPrebook,
        currency: commerce.currency,
        /*
          The key id is public — it is what opens Checkout in the browser —
          and is served from here rather than baked into the storefront build
          so switching test keys for live ones needs no redeploy of the site.
          It is withheld entirely while online payment is off, so there is no
          way to open a Checkout the API would refuse to settle.
        */
        online: commerce.online.enabled
          ? { enabled: true, ...publicGatewayConfig() }
          : { enabled: false, provider: null, keyId: null },
      },
    },
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/instagram', instagramRoutes);
router.use('/prebookings', prebookingRoutes);

// Admin surface — separate cookies, separate JWT keys, separate frontend origin.
router.use('/admin', adminRoutes);

export default router;
