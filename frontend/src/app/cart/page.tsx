import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';
import { PrebookNotice } from '@/components/PrebookNotice';
import { fetchCommerceConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Your bag',
  description: 'Review the fragrances in your attume bag.',
};

export default async function CartPage() {
  const commerce = await fetchCommerceConfig();
  if (commerce.isPrebook) return <PrebookNotice title="The bag opens with the shop" />;
  return <CartView />;
}
