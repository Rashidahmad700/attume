import { env } from './env.js';

/** Storefront commercial rules, kept in one place so cart and checkout agree. */
export const commerce = {
  freeShippingThreshold: env.FREE_SHIPPING_THRESHOLD,
  shippingFee: env.SHIPPING_FEE,
  maxQuantityPerLine: 5,
  currency: 'INR',
  cod: {
    enabled: env.COD_ENABLED,
    /** Cash on delivery is offered only above this order value. */
    minOrderValue: env.COD_MIN_ORDER_VALUE,
  },
} as const;

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
}

/** COD eligibility, evaluated on the order total the customer will pay. */
export function codAvailableFor(total: number): boolean {
  return commerce.cod.enabled && total >= commerce.cod.minOrderValue;
}
