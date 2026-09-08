'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { parseApiError } from '@/lib/apiError';
import { formatPrice } from '@/lib/products';
import { useCancelMyOrderMutation, useGetMyOrderQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';
import { OrderStatusTrail } from './OrderStatusTrail';

export function OrderDetail({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get('placed') === '1';

  const { user, isInitialised } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError } = useGetMyOrderQuery(orderNumber, { skip: !user });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelMyOrderMutation();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isInitialised && !user) router.replace(`/login?redirect=/orders/${orderNumber}`);
  }, [isInitialised, user, orderNumber, router]);

  if (!isInitialised || isLoading || !user) {
    return (
      <Container className="py-28">
        <p className="eyebrow text-ink-muted">Loading your order…</p>
      </Container>
    );
  }

  if (isError || !data) {
    return (
      <Container className="flex flex-col items-center gap-5 py-28 text-center">
        <h1 className="font-serif text-3xl font-light text-ink">Order not found</h1>
        <p className="text-sm text-ink-muted">
          We could not find {orderNumber} on your account.
        </p>
        <Link href="/account/orders" className="link-underline eyebrow text-olive">
          View your orders
        </Link>
      </Container>
    );
  }

  const order = data.data.order;
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <Container className="py-14 lg:py-20">
      {justPlaced && (
        <div className="mb-10 border border-olive/40 bg-olive/5 p-7">
          <span className="eyebrow text-olive">Thank you</span>
          <h1 className="mt-3 font-serif text-3xl font-light text-ink">Your order is placed</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            We are preparing {order.orderNumber} for dispatch.
            {order.paymentMethod === 'cod'
              ? ' Keep the exact amount ready for the courier.'
              : ''}{' '}
            You can follow its progress on this page at any time.
          </p>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Order</span>
          <h2 className="mt-3 font-serif text-4xl font-light text-ink">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Placed {new Date(order.placedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online'}
          </p>
        </div>
        <Link href="/account/orders" className="link-underline eyebrow text-ink">
          All orders
        </Link>
      </header>

      {error && (
        <p role="alert" className="mt-6 border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
          {error}
        </p>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          <OrderStatusTrail status={order.status} timeline={order.timeline} />

          <section>
            <h3 className="eyebrow mb-4 text-bronze">Items</h3>
            <ul className="border border-line">
              {order.items.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 text-sm last:border-b-0"
                >
                  <span>
                    <Link href={`/products/${item.slug}`} className="text-ink hover:text-olive">
                      {item.name}
                    </Link>
                    <span className="block text-xs text-ink-muted">
                      {item.sku} · {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </span>
                  <span className="text-ink">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="eyebrow mb-4 text-bronze">Delivering to</h3>
            <address className="border border-line p-5 text-sm leading-relaxed not-italic text-ink">
              {order.shippingAddress.name}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 && (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              )}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              {order.shippingAddress.phone && (
                <>
                  <br />
                  <span className="text-ink-muted">{order.shippingAddress.phone}</span>
                </>
              )}
            </address>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-5 border border-line bg-ivory-soft p-7">
          <h3 className="eyebrow text-ink">Summary</h3>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(order.amounts.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-ink">
                {order.amounts.shipping === 0
                  ? 'Complimentary'
                  : formatPrice(order.amounts.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="text-ink">
                {order.paymentMethod === 'cod' ? 'Due on delivery' : 'Total'}
              </dt>
              <dd className="font-serif text-2xl font-light text-ink">
                {formatPrice(order.amounts.total)}
              </dd>
            </div>
          </dl>

          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={async () => {
                setError('');
                if (!confirm('Cancel this order? The items go back on sale.')) return;
                try {
                  await cancelOrder(order.orderNumber).unwrap();
                } catch (caught) {
                  setError(parseApiError(caught).message);
                }
              }}
              className="border border-espresso/40 px-6 py-3 text-[11px] tracking-[0.14em] text-espresso uppercase hover:bg-espresso hover:text-ivory disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          )}

          <p className="text-[11px] leading-relaxed text-ink-muted">
            Questions about this order? Write to attume.official@gmail.com quoting{' '}
            {order.orderNumber}.
          </p>
        </aside>
      </div>
    </Container>
  );
}
