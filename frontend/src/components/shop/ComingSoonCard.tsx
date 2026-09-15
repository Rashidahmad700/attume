/**
 * Fills the row beside the two fragrances that exist.
 *
 * A four-column grid holding two products leaves half the shelf empty, which
 * reads as a page that failed to load rather than a house with two scents.
 * These name what is coming instead, and are deliberately inert — there is
 * nothing behind them to open.
 */
const upcoming = [
  { name: 'Oud', note: 'Rose, saffron, real oud' },
  { name: 'Monsoon', note: 'Petrichor, wet earth, vetiver' },
];

export function ComingSoonCard({ index }: { index: number }) {
  const item = upcoming[index % upcoming.length];

  return (
    <article aria-hidden="true" className="flex h-full flex-col">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-dashed border-line bg-ivory-soft">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <span className="font-serif text-3xl lowercase text-ink/25">{item.name}</span>
          <span className="eyebrow text-ink-muted/70">In the lab</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-bronze-deep/60 uppercase">
          Coming soon
        </p>
        <h3 className="font-serif text-xl font-bold tracking-wide text-ink/40 uppercase">
          {item.name}
        </h3>
        <p className="text-xs leading-relaxed font-medium text-espresso/50">{item.note}</p>

        <div className="mt-auto pt-5">
          <span className="block w-full rounded-xl border border-dashed border-line py-3 text-center text-[11px] font-semibold tracking-[0.16em] text-ink-muted/70 uppercase">
            Not yet
          </span>
        </div>
      </div>
    </article>
  );
}
