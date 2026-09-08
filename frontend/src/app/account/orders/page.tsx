'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/lib/products';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';

const statusTone: Record<string, string> = {
  pending: 'text-bronze',
  confirmed: 'text-olive',
  packed: 'text-olive',
  shipped: 'text-ink',
  delivered: 'text-olive',
  cancelled: 'text-espresso',
  returned: 'text-espresso',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isInitialised } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetMyOrdersQuery(undefined, { skip: !user });

  useEffect(() => {
    if (isInitialised && !user) router.replace('/login?redirect=/account/orders');
  }, [isInitialised, user, router]);

  const orders = data?.data.orders ?? [];

  return (
    <Container className="py-16 lg:py-24">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Your account</span>
          <h1 className="mt-3 font-serif text-4xl font-light text-ink lg:text-5xl">Orders</h1>
        </div>
        <Link href="/account" className="link-underline eyebrow text-ink">
          Account details
        </Link>
      </header>

      {isLoading && <p className="mt-10 eyebrow text-ink-muted">Loading orders…</p>}

      {!isLoading && orders.length === 0 && (
        <div className="flex flex-col items-start gap-5 py-16">
          <p className="text-sm text-ink-muted">You have not placed an order yet.</p>
          <Link
            href="/shop"
            className="bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase hover:bg-olive"
          >
            Shop the collection
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <ul className="mt-10 flex flex-col">
          {orders.map((order) => (
            <li key={order.id} className="border-b border-line py-6 first:pt-0">
              <Link href={`/orders/${order.orderNumber}`} className="group flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-xl font-light text-ink group-hover:text-olive">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(order.placedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} item
                    {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}
                    {' · '}
                    {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}
                  </p>
                </div>
                <div className="flex items-center gap-8">
                  <span className={`eyebrow ${statusTone[order.status] ?? 'text-ink'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm text-ink">{formatPrice(order.amounts.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
