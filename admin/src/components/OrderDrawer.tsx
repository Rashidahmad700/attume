'use client';

import { useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { formatDateTime, formatPrice } from '@/lib/format';
import { parseApiError } from '@/lib/apiError';
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
} from '@/store/api/adminApi';
import { PAYMENT_STATUSES, type OrderStatus, type PaymentStatus } from '@/types';

/** Mirrors the transition rules the API enforces, so buttons match reality. */
const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

export function OrderDrawer({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data, isLoading } = useGetOrderQuery(orderId);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [updatePayment, { isLoading: isUpdatingPayment }] = useUpdatePaymentStatusMutation();
  const [error, setError] = useState('');

  const order = data?.data.order;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto bg-ivory-soft"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <span className="eyebrow text-bronze">Order</span>
            <h2 className="font-serif text-2xl font-light text-ink">
              {order?.orderNumber ?? 'Loading…'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="eyebrow text-ink-muted hover:text-ink">
            Close
          </button>
        </header>

        {isLoading || !order ? (
          <p className="px-6 py-8 text-sm text-ink-muted">Loading order…</p>
        ) : (
          <div className="flex flex-col gap-8 px-6 py-6">
            {error && (
              <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
                {error}
              </p>
            )}

            <section className="flex flex-wrap items-center gap-3">
              <StatusPill value={order.status} />
              <StatusPill value={order.paymentStatus} />
              <span className="text-xs text-ink-muted">
                Placed {formatDateTime(order.placedAt)} · {order.paymentMethod.toUpperCase()}
              </span>
            </section>

            <section className="panel p-5">
              <h3 className="eyebrow mb-3 text-ink-muted">Move order forward</h3>
              {nextStatuses[order.status].length === 0 ? (
                <p className="text-sm text-ink-muted">
                  This order is closed — no further status changes are allowed.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nextStatuses[order.status].map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={async () => {
                        setError('');
                        try {
                          await updateStatus({ id: order.id, status }).unwrap();
                        } catch (caught) {
                          setError(parseApiError(caught).message);
                        }
                      }}
                      className={`border px-4 py-2 text-[10px] tracking-[0.12em] uppercase ${
                        status === 'cancelled' || status === 'returned'
                          ? 'border-espresso text-espresso hover:bg-espresso hover:text-ivory'
                          : 'border-ink bg-ink text-ivory hover:bg-olive hover:border-olive'
                      }`}
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-ink-muted">
                Cancelling before dispatch returns the reserved units to stock automatically.
              </p>
            </section>

            <section className="panel p-5">
              <h3 className="eyebrow mb-3 text-ink-muted">Payment</h3>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_STATUSES.map((paymentStatus: PaymentStatus) => (
                  <button
                    key={paymentStatus}
                    type="button"
                    disabled={isUpdatingPayment || order.paymentStatus === paymentStatus}
                    onClick={async () => {
                      setError('');
                      try {
                        await updatePayment({ id: order.id, paymentStatus }).unwrap();
                      } catch (caught) {
                        setError(parseApiError(caught).message);
                      }
                    }}
                    className="border border-line px-4 py-2 text-[10px] tracking-[0.12em] uppercase hover:border-ink disabled:opacity-30"
                  >
                    {paymentStatus}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="eyebrow mb-3 text-ink-muted">Items</h3>
              <div className="panel">
                {order.items.map((item) => (
                  <div
                    key={item.sku}
                    className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-b-0"
                  >
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="block text-xs text-ink-muted">
                        {item.sku} · {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </div>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-ink-muted">Subtotal</span>
                  <span>{formatPrice(order.amounts.subtotal)}</span>
                </div>
                <div className="flex justify-between px-4 pb-3 text-sm">
                  <span className="text-ink-muted">Shipping</span>
                  <span>{formatPrice(order.amounts.shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-line px-4 py-3 text-sm font-medium">
                  <span>Total</span>
                  <span>{formatPrice(order.amounts.total)}</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="eyebrow mb-3 text-ink-muted">Ship to</h3>
              <address className="panel p-4 text-sm leading-relaxed not-italic">
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

            <section>
              <h3 className="eyebrow mb-3 text-ink-muted">History</h3>
              <ol className="panel divide-y divide-line">
                {order.timeline.length === 0 && (
                  <li className="px-4 py-3 text-sm text-ink-muted">No changes recorded yet.</li>
                )}
                {order.timeline.map((event, index) => (
                  <li key={index} className="flex justify-between px-4 py-3 text-sm">
                    <span className="capitalize">{event.status}</span>
                    <span className="text-xs text-ink-muted">{formatDateTime(event.at)}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
