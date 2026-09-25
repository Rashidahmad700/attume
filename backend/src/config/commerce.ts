import { env, razorpayConfigured } from './env.js';

/** Storefront commercial rules, kept in one place so cart and checkout agree. */
export const commerce = {
  /** 'prebook' — no payment is taken; 'live' — the bag and checkout are open. */
  mode: env.COMMERCE_MODE,
  isPrebook: env.COMMERCE_MODE === 'prebook',
  maxQuantityPerLine: 5,
  currency: 'INR',
  online: {
    /**
     * The only way to pay. Driven by the keys being present rather than by a
     * flag of its own, so there is no way to advertise a payment with nothing
     * behind it — and when it is off, checkout is closed rather than falling
     * back to a method the shop no longer offers. Pre-booking closes it
     * regardless: there is no order to pay for.
     */
    enabled: razorpayConfigured && env.COMMERCE_MODE === 'live',
    provider: 'razorpay' as const,
    /**
     * Razorpay counts in paise, and only in whole ones. Every amount crosses
     * the boundary through this so rounding happens in exactly one place.
     */
    toPaise(rupees: number): number {
      return Math.round(rupees * 100);
    },
  },
} as const;
