import type { Metadata } from 'next';
import { CartView } from '@/components/cart/CartView';

export const metadata: Metadata = {
  title: 'Your bag',
  description: 'Review the fragrances in your attume bag.',
};

export default function CartPage() {
  return <CartView />;
}
