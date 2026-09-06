'use client';

import Link from 'next/link';
import { StatCard } from '@/components/StatCard';
import { StatusPill } from '@/components/StatusPill';
import { formatDateTime, formatPrice } from '@/lib/format';
import { useGetDashboardQuery } from '@/store/api/adminApi';

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardQuery();
  const stats = data?.data;

  if (isLoading || !stats) {
    return <p className="eyebrow text-ink-muted">Loading dashboard…</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <header>
        <span className="eyebrow text-bronze">Overview</span>
        <h1 className="mt-2 font-serif text-4xl font-light text-ink">Dashboard</h1>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders — all time"
          value={stats.orders.total}
          hint={`${stats.orders.today} today · ${stats.orders.thisWeek} this week`}
        />
        <StatCard
          label="Revenue — paid"
          value={formatPrice(stats.revenue.allTime)}
          tone="good"
          hint={`${formatPrice(stats.revenue.last30Days)} in last 30 days`}
        />
        <StatCard
          label="Awaiting action"
          value={stats.orders.pending}
          tone={stats.orders.pending > 0 ? 'warn' : 'default'}
          hint="Orders still pending confirmation"
        />
        <StatCard
          label="Customers"
          value={stats.customers.total}
          hint={`${stats.customers.newThisWeek} joined this week`}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products live" value={`${stats.catalogue.active}/${stats.catalogue.total}`} />
        <StatCard
          label="Out of stock"
          value={stats.catalogue.outOfStock}
          tone={stats.catalogue.outOfStock > 0 ? 'danger' : 'default'}
          hint="Hidden from purchase on the storefront"
        />
        <StatCard
          label="Low stock"
          value={stats.catalogue.lowStock}
          tone={stats.catalogue.lowStock > 0 ? 'warn' : 'default'}
          hint="At or below the reorder threshold"
        />
        <StatCard label="Shipped" value={stats.orders.shipped} hint={`${stats.orders.delivered} delivered`} />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="panel">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="eyebrow text-ink">Recent orders</h2>
            <Link href="/orders" className="eyebrow text-olive hover:underline">
              View all
            </Link>
          </header>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-muted">
              No orders yet. They will appear here as soon as checkout is live.
            </p>
          ) : (
            <table className="w-full">
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-line last:border-b-0">
                    <td className="cell font-medium">{order.orderNumber}</td>
                    <td className="cell text-ink-muted">{order.customer.name}</td>
                    <td className="cell">{formatPrice(order.amounts.total)}</td>
                    <td className="cell">
                      <StatusPill value={order.status} />
                    </td>
                    <td className="cell text-right text-ink-muted">{formatDateTime(order.placedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="eyebrow text-ink">Needs restocking</h2>
            <Link href="/products?stock=low" className="eyebrow text-olive hover:underline">
              Manage stock
            </Link>
          </header>
          {stats.lowStockProducts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-muted">Every product is comfortably in stock.</p>
          ) : (
            <table className="w-full">
              <tbody>
                {stats.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-line last:border-b-0">
                    <td className="cell font-medium">{product.name}</td>
                    <td className="cell text-ink-muted">{product.sku}</td>
                    <td className="cell">
                      <span className={product.stock === 0 ? 'text-espresso' : 'text-bronze'}>
                        {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
