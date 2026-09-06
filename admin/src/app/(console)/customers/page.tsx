'use client';

import { useState } from 'react';
import { formatDate, formatPrice } from '@/lib/format';
import { useGetCustomersQuery } from '@/store/api/adminApi';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useGetCustomersQuery({ search: search || undefined });

  const customers = data?.data.customers ?? [];
  const total = data?.data.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="eyebrow text-bronze">People</span>
        <h1 className="mt-2 font-serif text-4xl font-light text-ink">Customers</h1>
        <p className="mt-2 text-sm text-ink-muted">{total} registered</p>
      </header>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name or email"
        className="field max-w-sm"
      />

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-line bg-ivory-soft">
            <tr>
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">Phone</th>
              <th className="th">Orders</th>
              <th className="th">Spent</th>
              <th className="th">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="cell text-ink-muted" colSpan={6}>
                  Loading customers…
                </td>
              </tr>
            )}
            {!isLoading && customers.length === 0 && (
              <tr>
                <td className="cell text-ink-muted" colSpan={6}>
                  No customers match this search.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-line last:border-b-0">
                <td className="cell font-medium">{customer.name}</td>
                <td className="cell text-ink-muted">{customer.email}</td>
                <td className="cell text-ink-muted">{customer.phone || '—'}</td>
                <td className="cell">{customer.orderCount}</td>
                <td className="cell">{formatPrice(customer.totalSpent)}</td>
                <td className="cell text-ink-muted">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
