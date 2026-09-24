import { env } from './env.js';

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
} as const;

/** COD eligibility, evaluated on the order total the customer will pay. */
export function codAvailableFor(total: number): boolean {
  return commerce.cod.enabled && total >= commerce.cod.minOrderValue;
}
