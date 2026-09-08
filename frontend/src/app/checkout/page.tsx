import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your attume order.',
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
