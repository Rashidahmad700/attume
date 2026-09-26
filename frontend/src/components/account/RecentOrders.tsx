'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/products';
import { useGetMyOrdersQuery } from '@/store/api/orderApi';

/** Status colours, matching the orders page so one order reads the same in both. */
const statusTone: Record<string, string> = {
  pending: 'text-bronze-deep',
  confirmed: 'text-olive',
  packed: 'text-olive',
  shipped: 'text-ink',
  delivered: 'text-olive',
  cancelled: 'text-espresso',
  returned: 'text-espresso',
};

/** Enough to recognise recent activity; the rest lives behind "View all". */
const SHOWN = 3;

/**
 * The account page's orders panel.
 *
 * Shows the actual orders rather than describing that they exist — a line of
 * prose about tracking dispatch tells someone nothing about whether their
 * parcel has moved.
 */
export function RecentOrders() {
  const { data, isLoading } = useGetMyOrdersQuery();
  const orders = (data?.data.orders ?? []).slice(0, SHOWN);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-ivory-soft">
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
        <h2 className="eyebrow text-ink">Orders</h2>
        <Link href="/account/orders" className="link-underline eyebrow text-olive">
          View all
        </Link>
      </header>

      {isLoading ? (
        <ul className="px-6 sm:px-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <li key={index} className="flex items-center gap-4 border-b border-line py-5 last:border-b-0">
              <Skeleton className="h-16 w-14 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-16" />
            </li>
          ))}
        </ul>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
          <p className="text-sm text-ink-muted">
            No orders yet. Your dispatch and delivery updates will appear here.
          </p>
          <Link
            href="/shop"
            className="rounded-xl border border-olive bg-olive px-7 py-3 text-[11px] font-bold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive"
          >
            Shop the collection
          </Link>
        </div>
      ) : (
        <ul className="px-6 sm:px-8">
          {orders.map((order) => {
            const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id} className="border-b border-line last:border-b-0">
                <Link
                  href={`/orders/${order.orderNumber}`}
                  className="group flex items-center gap-4 py-5"
                >
                  {/* Overlapping thumbnails — the order is recognisable by what
                      is in it long before the number means anything. */}
                  <div className="flex shrink-0 -space-x-3">
                    {order.items.slice(0, 3).map((item, index) => (
                      <span
                        key={item.slug + index}
                        className="relative flex h-16 w-14 items-center justify-center overflow-hidden rounded border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)] ring-2 ring-ivory-soft"
                      >
                        {item.image ? (
                          <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                        ) : (
                          <span className="px-1 text-center font-serif text-[11px] lowercase text-olive">
                            {item.name}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg leading-tight text-ink group-hover:text-olive">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-muted">
                      {order.items.map((item) => item.name).join(', ')}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {new Date(order.placedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {' · '}
                      {count} item{count === 1 ? '' : 's'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className={`eyebrow ${statusTone[order.status] ?? 'text-ink'}`}>
                      {order.status}
                    </span>
                    <span className="price text-sm font-bold text-ink">
                      {formatPrice(order.amounts.total)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
