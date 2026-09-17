import { createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import type { Request } from 'express';
import { env } from '../config/env.js';

/** Set by the storefront's middleware on every request it proxies here. */
export const PROXY_SECRET_HEADER = 'x-attume-proxy-secret';
export const CLIENT_IP_HEADER = 'x-attume-client-ip';

function matchesSecret(presented: string, secret: string): boolean {
  // Hashing first gives equal lengths, which timingSafeEqual requires.
  const a = createHash('sha256').update(presented).digest();
  const b = createHash('sha256').update(secret).digest();
  return timingSafeEqual(a, b);
}

/**
 * The shopper's IP, for rate limiting.
 *
 * Browser traffic reaches the API through the storefront's rewrite, so
 * `req.ip` is the storefront server's address — shared by every shopper, which
 * would put the whole shop behind one login budget. The storefront forwards the
 * real address, and it is believed only alongside the shared secret: anyone can
 * call the API directly and send the header themselves.
 */
export function clientIp(req: Request): string {
  const secret = env.API_PROXY_SECRET;
  const presented = req.get(PROXY_SECRET_HEADER);
  const forwarded = req.get(CLIENT_IP_HEADER)?.trim();

  if (secret && presented && forwarded && isIP(forwarded) && matchesSecret(presented, secret)) {
    return forwarded;
  }
  return req.ip ?? 'unknown';
}
