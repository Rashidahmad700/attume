/**
 * Fills the row beside the two fragrances that exist.
 *
 * A four-column grid holding two products leaves half the shelf empty, which
 * reads as a page that failed to load rather than a house with two scents.
 * These hold the place without naming what is coming — the house decides when
 * a fragrance is announced, not the grid it will one day sit in.
 */
export function ComingSoonCard() {
  return (
    <article aria-hidden="true" className="flex h-full flex-col">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-dashed border-line bg-ivory-soft">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <span className="font-serif text-4xl lowercase text-ink/20">attume</span>
          <span className="eyebrow text-ink-muted/70">In the lab</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-5">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-bronze-deep/60 uppercase">
          Coming soon
        </p>
        <h3 className="font-serif text-xl font-bold tracking-wide text-ink/40 uppercase">
          Next release
        </h3>
        <p className="text-xs leading-relaxed font-medium text-ink-muted/70">
          Matured until it stops changing. Announced when it is ready.
        </p>

        <div className="mt-auto pt-5">
          <span className="block w-full rounded-xl border border-dashed border-line py-3 text-center text-[11px] font-semibold tracking-[0.16em] text-ink-muted/70 uppercase">
            Not yet
          </span>
        </div>
      </div>
    </article>
  );
}
