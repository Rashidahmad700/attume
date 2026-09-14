import Link from 'next/link';

/**
 * Stands in for the bag and checkout while the shop is pre-booking. Reached
 * only from a stale tab or a bookmark, so it explains and points onward
 * rather than redirecting someone somewhere they did not ask to go.
 */
export function PrebookNotice({ title }: { title: string }) {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-5 py-24 text-center sm:px-8">
      <span className="eyebrow text-olive">Pre-booking open</span>
      <h1 className="font-serif text-4xl font-medium text-ink">{title}</h1>
      <p className="text-sm leading-relaxed text-ink-muted">
        We are taking pre-bookings rather than orders while payments are being set up. Reserve a
        bottle on its page — nothing is charged, and you will be written to before anything ships.
      </p>
      <Link
        href="/shop"
        className="rounded-xl bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
      >
        See the fragrances
      </Link>
    </section>
  );
}
