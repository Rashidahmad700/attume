import { connectDB, disconnectDB } from './config/db.js';
import { env, razorpayConfigured } from './config/env.js';
import { commerce } from './config/commerce.js';
import { createApp } from './app.js';
import { startAbandonedOrderSweeper } from './services/abandonedOrders.js';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`[api] cors origins: ${env.corsOrigins.join(', ')}`);
    if (!env.RESEND_API_KEY) {
      console.warn('[api] RESEND_API_KEY is not set — emails are printed here, not sent');
    } else if (env.MAIL_FROM.includes('@resend.dev')) {
      console.warn(
        '[api] MAIL_FROM uses resend.dev — Resend only delivers to your own account address until you verify a domain',
      );
    }
    // An inbox renders on the provider's servers, which cannot reach a laptop.
    const assetBase = env.EMAIL_ASSET_BASE_URL || env.STOREFRONT_URL;
    if (/localhost|127\.0\.0\.1/.test(assetBase)) {
      console.warn(
        `[api] email images point at ${assetBase} — they will arrive broken. Set EMAIL_ASSET_BASE_URL to a public host.`,
      );
    }
    console.log(`[api] admin alerts go to ${env.ADMIN_NOTIFY_EMAIL}`);

    if (commerce.online.enabled) {
      const mode = env.RAZORPAY_KEY_ID?.startsWith('rzp_test_') ? 'TEST' : 'live';
      console.log(`[api] online payment on — razorpay ${mode} keys`);
    } else if (razorpayConfigured) {
      console.log('[api] razorpay keys present but COMMERCE_MODE is not "live" — online payment off');
    } else {
      console.warn('[api] razorpay keys missing — cash on delivery only');
    }
  });

  // Only meaningful while online orders exist, since only those hold stock
  // against a payment that may never come.
  if (commerce.online.enabled) startAbandonedOrderSweeper();

  const shutdown = async (signal: string) => {
    console.log(`\n[api] ${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    console.error('[api] unhandled rejection', reason);
  });
}

void bootstrap();
