import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { PrebookNotice } from '@/components/PrebookNotice';
import { fetchCommerceConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your attume order.',
};

export default async function CheckoutPage() {
  const commerce = await fetchCommerceConfig();
  if (commerce.isPrebook) return <PrebookNotice title="Checkout opens with the shop" />;
  return <CheckoutView />;
}
