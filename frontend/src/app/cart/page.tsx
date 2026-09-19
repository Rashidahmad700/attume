import type { Metadata } from 'next';
import { CartRedirect } from '@/components/cart/CartRedirect';
import { PrebookNotice } from '@/components/PrebookNotice';
import { fetchCommerceConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Your bag',
  description: 'Review the fragrances in your attume bag.',
};

/**
 * The bag is a drawer at every width, so there is no cart page to render.
 *
 * The route is kept because links, bookmarks and old emails point at it —
 * landing here opens the drawer over the shop rather than showing a dead end.
 */
export default async function CartPage() {
  const commerce = await fetchCommerceConfig();
  if (commerce.isPrebook) return <PrebookNotice title="The bag opens with the shop" />;
  return <CartRedirect />;
}
