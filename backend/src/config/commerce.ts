/** Storefront commercial rules, kept in one place so cart and checkout agree. */
export const commerce = {
  freeShippingThreshold: 2000,
  shippingFee: 99,
  maxQuantityPerLine: 5,
  currency: 'INR',
} as const;

export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= commerce.freeShippingThreshold ? 0 : commerce.shippingFee;
}
