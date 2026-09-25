import { env, razorpayConfigured } from './env.js';

/** Storefront commercial rules, kept in one place so cart and checkout agree. */
export const commerce = {
  /** 'prebook' — no payment is taken; 'live' — the bag and checkout are open. */
  mode: env.COMMERCE_MODE,
  isPrebook: env.COMMERCE_MODE === 'prebook',
  maxQuantityPerLine: 5,
  currency: 'INR',
  cod: {
    enabled: env.COD_ENABLED,
    /** Cash on delivery is offered only above this order value. */
    minOrderValue: env.COD_MIN_ORDER_VALUE,
  },
  online: {
    /**
     * Driven by the keys being present rather than by a flag of its own, so
     * there is no way to advertise online payment with nothing behind it.
     * Pre-booking closes it regardless: there is no order to pay for.
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

/** COD eligibility, evaluated on the order total the customer will pay. */
export function codAvailableFor(total: number): boolean {
  return commerce.cod.enabled && total >= commerce.cod.minOrderValue;
}
