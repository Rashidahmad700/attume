import type { ReactNode } from 'react';

/** Label : value row — stacks on mobile, two columns from sm up. */
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-6 sm:py-5">
      <dt className="eyebrow flex items-baseline text-ink-muted">
        <span>{label}</span>
        <span className="ml-2 hidden text-line sm:inline">:</span>
      </dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}
