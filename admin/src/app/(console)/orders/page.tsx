'use client';

import { useState } from 'react';
import { StatusPill } from '@/components/StatusPill';
import { OrderDrawer } from '@/components/OrderDrawer';
import { formatDateTime, formatPrice } from '@/lib/format';
import { useGetOrdersQuery } from '@/store/api/adminApi';
import { ORDER_STATUSES, type OrderStatus } from '@/types';

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading } = useGetOrdersQuery({ search: search || undefined, status });
  const orders = data?.data.orders ?? [];
  const total = data?.data.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="eyebrow text-bronze">Fulfilment</span>
        <h1 className="mt-2 font-serif text-4xl font-light text-ink">Orders</h1>
        <p className="mt-2 text-sm text-ink-muted">{total} orders in total</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search order number, name or email"
          className="field max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus(undefined)}
            className={`border px-3 py-2 text-[10px] tracking-[0.12em] uppercase ${
              status === undefined ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-ink-muted'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`border px-3 py-2 text-[10px] tracking-[0.12em] uppercase ${
                status === value ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-ink-muted'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="border-b border-line bg-ivory-soft">
            <tr>
              <th className="th">Order</th>
              <th className="th">Customer</th>
              <th className="th">Items</th>
              <th className="th">Total</th>
              <th className="th">Payment</th>
              <th className="th">Status</th>
              <th className="th">Placed</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="cell text-ink-muted" colSpan={8}>
                  Loading orders…
                </td>
              </tr>
            )}
            {!isLoading && orders.length === 0 && (
              <tr>
                <td className="cell text-ink-muted" colSpan={8}>
                  No orders match this filter.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-line last:border-b-0">
                <td className="cell font-medium">{order.orderNumber}</td>
                <td className="cell">
                  {order.customer.name}
                  <span className="block text-xs text-ink-muted">{order.customer.email}</span>
                </td>
                <td className="cell text-ink-muted">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                </td>
                <td className="cell">{formatPrice(order.amounts.total)}</td>
                <td className="cell">
                  <StatusPill value={order.paymentStatus} />
                  <span className="ml-2 text-xs text-ink-muted uppercase">{order.paymentMethod}</span>
                </td>
                <td className="cell">
                  <StatusPill value={order.status} />
                </td>
                <td className="cell text-ink-muted">{formatDateTime(order.placedAt)}</td>
                <td className="cell text-right">
                  <button
                    type="button"
                    onClick={() => setOpenId(order.id)}
                    className="eyebrow text-olive hover:underline"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId && <OrderDrawer orderId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
