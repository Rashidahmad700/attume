import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderDetail } from '@/components/checkout/OrderDetail';

export const metadata: Metadata = { title: 'Order' };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return (
    <Suspense fallback={<div className="h-96" />}>
      <OrderDetail orderNumber={orderNumber} />
    </Suspense>
  );
}
