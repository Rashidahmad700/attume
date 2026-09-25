import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { razorpayWebhook } from './controllers/webhook.controller.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { webhookLimiter } from './middleware/rateLimit.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server calls with no Origin header.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  /*
    The payment webhook, mounted before the JSON parser and not after.

    Its signature is an HMAC over the exact bytes Razorpay sent. Parsing the
    body and re-serialising it to check the signature would reorder keys and
    drop whitespace, and every webhook would fail verification — in a way that
    looks intermittent rather than wrong. So this route takes the raw buffer,
    and only this route.
  */
  app.post(
    '/api/v1/webhooks/razorpay',
    webhookLimiter,
    express.raw({ type: '*/*', limit: '256kb' }),
    (req, res) => void razorpayWebhook(req, res),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (!env.isProd) app.use(morgan('dev'));

  app.use('/api/v1', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
