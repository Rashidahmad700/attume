'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { ThankYouBanner } from '@/components/checkout/ThankYouBanner';
import { formatPrice } from '@/lib/products';
import { site } from '@/lib/site';
import { useGetMyOrderQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';
import { OrderStatusTrail } from './OrderStatusTrail';

export function OrderDetail({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get('placed') === '1';

  const { user, isInitialised } = useAppSelector((state) => state.auth);
  /*
    An online order arrives here the moment the customer pays, which can be a
    second or two before the gateway's webhook confirms it. Polling while that
    is outstanding means the page settles by itself rather than asking someone
    who has just paid to refresh. Held in state because the interval depends on
    the answer the query has not returned yet.
  */
  const [pollInterval, setPollInterval] = useState(0);
  const { data, isLoading, isError } = useGetMyOrderQuery(orderNumber, {
    skip: !user,
    pollingInterval: pollInterval,
  });

  useEffect(() => {
    const order = data?.data.order;
    const outstanding =
      order?.paymentMethod === 'online' && order.paymentStatus === 'pending';
    setPollInterval(outstanding ? 4000 : 0);
  }, [data]);

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
        <h1 className="font-serif text-3xl font-medium text-ink">Order not found</h1>
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
  const awaitingPayment = order.paymentMethod === 'online' && order.paymentStatus === 'pending';

  return (
    <Container className="py-14 lg:py-20">
      {justPlaced && !awaitingPayment && <ThankYouBanner order={order} />}

      {/* Said plainly rather than hidden behind a spinner: the money has
          almost certainly left their account, and the one thing they must not
          do is pay a second time. */}
      {awaitingPayment && (
        <div
          role="status"
          className="mb-10 flex flex-col gap-2 rounded-2xl border border-bronze/40 bg-bronze/5 p-6"
        >
          <h2 className="font-serif text-2xl font-medium text-ink">Confirming your payment</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            This usually takes a few seconds and updates by itself. Please do not pay again — if
            anything was taken, it is against this order. If it has not settled in a few minutes,
            contact us quoting {order.orderNumber}.
          </p>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Order</span>
          <h2 className="mt-3 font-serif text-4xl font-medium text-ink">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Placed {new Date(order.placedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
            {' · '}
            {/* 'cod' cannot be chosen any more; it survives on orders taken
                before the gateway went live and must still read correctly. */}
            {order.paymentMethod === 'cod'
              ? 'Cash on delivery'
              : order.paymentStatus === 'paid'
                ? `Paid online${order.payment?.method ? ` · ${order.payment.method}` : ''}`
                : 'Online payment'}
          </p>
        </div>
        <Link href="/account/orders" className="link-underline eyebrow text-ink">
          All orders
        </Link>
      </header>


      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          <OrderStatusTrail status={order.status} timeline={order.timeline} />

          <section>
            <h3 className="eyebrow mb-4 text-bronze">Items</h3>
            <ul className="border border-line rounded-2xl">
              {order.items.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 text-sm last:border-b-0"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex min-w-0 flex-1 items-center gap-4"
                  >
                    {/* Orders placed before the image was snapshotted fall back
                        to the tinted frame rather than a broken picture. */}
                    <span className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="px-1 text-center font-serif text-[11px] lowercase text-olive">
                          {item.name}
                        </span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-ink hover:text-olive">{item.name}</span>
                      <span className="block text-xs text-ink-muted">
                        {item.sku} · {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </span>
                  </Link>
                  <span className="shrink-0 text-ink">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="eyebrow mb-4 text-bronze">Delivering to</h3>
            <address className="border border-line p-5 text-sm leading-relaxed not-italic text-ink rounded-2xl">
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

        <aside className="flex h-fit flex-col gap-5 border border-line bg-ivory-soft p-7 rounded-2xl">
          <h3 className="eyebrow text-ink">Summary</h3>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(order.amounts.subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="text-ink">
                {order.paymentMethod === 'cod' ? 'Due on delivery' : 'Total'}
              </dt>
              <dd className="price text-2xl font-bold text-ink">
                {formatPrice(order.amounts.total)}
              </dd>
            </div>
          </dl>


          {/* Orders are not cancelled from here. Someone who needs to change
              or stop one talks to the shop, which can still do it from the
              admin console — and a person answers faster than a form. */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-ivory p-5">
            <h3 className="eyebrow text-ink">Need help with this order?</h3>
            <p className="text-xs leading-relaxed text-ink-muted">
              To change or stop it, contact us quoting {order.orderNumber}.
            </p>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`}
              className="link-underline text-sm font-semibold text-olive"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phone.replace(/\s+/g, '')}`}
              className="link-underline text-sm font-semibold text-olive"
            >
              {site.phone}
            </a>
          </div>
        </aside>
      </div>
    </Container>
  );
}
