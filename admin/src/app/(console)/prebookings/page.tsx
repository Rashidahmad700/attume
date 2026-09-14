'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/format';
import {
  useGetPrebookingsQuery,
  useUpdatePrebookingStatusMutation,
} from '@/store/api/adminApi';
import type { PrebookingStatus } from '@/types';

const STATUSES: PrebookingStatus[] = ['new', 'contacted', 'converted', 'cancelled'];

const TONE: Record<PrebookingStatus, string> = {
  new: 'border-olive text-olive',
  contacted: 'border-bronze text-bronze',
  converted: 'border-ink text-ink',
  cancelled: 'border-line text-ink-muted',
};

/**
 * The demand list. While the shop is pre-booking this is where the interest
 * lands, and the export is what gets mailed the day a batch is ready.
 */
export default function PrebookingsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PrebookingStatus | ''>('');
  const { data, isLoading } = useGetPrebookingsQuery({
    search: search || undefined,
    status: status || undefined,
  });
  const [updateStatus, { isLoading: isSaving }] = useUpdatePrebookingStatusMutation();

  const prebookings = data?.data.prebookings ?? [];
  const counts = data?.data.counts ?? {};
  const total = data?.data.pagination.total ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-bronze">Demand</span>
          <h1 className="mt-2 font-serif text-4xl font-light text-ink">Pre-bookings</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {total} recorded · {counts.new ?? 0} not yet contacted
          </p>
        </div>

        {/* Plain link, not fetch: the browser handles the download and the
            session cookie rides along. */}
        <a
          href={`/api/v1/admin/prebookings/export${status ? `?status=${status}` : ''}`}
          className="rounded-xl border border-ink px-6 py-3 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
        >
          Export CSV
        </a>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, email, phone or city"
          className="field max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as PrebookingStatus | '')}
          className="field max-w-[12rem]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-line bg-ivory-soft">
            <tr>
              <th className="th">Date</th>
              <th className="th">Name</th>
              <th className="th">Contact</th>
              <th className="th">Fragrance</th>
              <th className="th">Qty</th>
              <th className="th">City</th>
              <th className="th">Source</th>
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="cell text-ink-muted" colSpan={8}>
                  Loading pre-bookings…
                </td>
              </tr>
            )}

            {!isLoading && prebookings.length === 0 && (
              <tr>
                <td className="cell text-ink-muted" colSpan={8}>
                  Nothing yet. Pre-bookings taken on the storefront appear here.
                </td>
              </tr>
            )}

            {prebookings.map((entry) => (
              <tr key={entry.id} className="border-b border-line/60 last:border-0">
                <td className="cell whitespace-nowrap text-ink-muted">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="cell font-medium text-ink">{entry.name}</td>
                <td className="cell">
                  <a href={`mailto:${entry.email}`} className="text-ink hover:text-olive">
                    {entry.email}
                  </a>
                  {entry.phone && <div className="text-xs text-ink-muted">{entry.phone}</div>}
                </td>
                <td className="cell">{entry.productName ?? '—'}</td>
                <td className="cell">{entry.productSlug ? entry.quantity : '—'}</td>
                <td className="cell text-ink-muted">{entry.city ?? '—'}</td>
                <td className="cell text-ink-muted">{entry.source}</td>
                <td className="cell">
                  <select
                    value={entry.status}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateStatus({
                        id: entry.id,
                        status: event.target.value as PrebookingStatus,
                      })
                    }
                    className={`rounded-full border bg-transparent px-3 py-1 text-[11px] tracking-[0.1em] uppercase ${TONE[entry.status]}`}
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
