import type { Product } from '@/types';

/** Accord bars, the note pyramid, and when the fragrance suits best. */
export function ScentProfile({ product }: { product: Product }) {
  return (
    <section className="grid gap-12 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <h2 className="eyebrow text-bronze">Main accords</h2>
        <ul className="flex flex-col gap-3">
          {product.accords.map((accord) => (
            <li key={accord.name} className="flex items-center gap-4">
              <span className="w-28 shrink-0 text-sm text-ink">{accord.name}</span>
              <span className="h-1.5 flex-1 bg-line/60">
                <span
                  className="block h-full bg-olive"
                  style={{ width: `${accord.strength}%` }}
                  aria-hidden="true"
                />
              </span>
              <span className="w-10 shrink-0 text-right text-xs text-ink-muted">
                {accord.strength}
              </span>
            </li>
          ))}
        </ul>

        {(product.wear.seasons.length > 0 || product.wear.times.length > 0) && (
          <div className="flex flex-col gap-3 border-t border-line pt-6">
            <h3 className="eyebrow text-bronze">Wear it</h3>
            <div className="flex flex-wrap gap-2">
              {[...product.wear.seasons, ...product.wear.times].map((tag) => (
                <span key={tag} className="border border-line px-3 py-1.5 text-xs text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <h2 className="eyebrow text-bronze">The pyramid</h2>
        <ol className="flex flex-col">
          {(
            [
              ['Top notes', product.notes.top, 'First 15 minutes'],
              ['Heart notes', product.notes.middle, 'The next few hours'],
              ['Base notes', product.notes.base, 'What stays behind'],
            ] as const
          ).map(([label, notes, when]) => (
            <li key={label} className="border-b border-line py-5 last:border-b-0">
              <div className="flex items-baseline justify-between gap-4">
                <span className="eyebrow text-ink-muted">{label}</span>
                <span className="text-xs text-ink-muted">{when}</span>
              </div>
              <p className="mt-2 font-serif text-2xl leading-snug font-light text-ink">
                {notes.length > 0 ? notes.join(' · ') : '—'}
              </p>
            </li>
          ))}
        </ol>

        {product.inspiredBy?.name && (
          <div className="border border-line bg-ivory-soft p-6">
            <h3 className="eyebrow text-bronze">If you know it by</h3>
            <p className="mt-3 font-serif text-2xl font-light text-ink">
              {product.inspiredBy.name}
              <span className="text-ink-muted"> — {product.inspiredBy.house}</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {product.inspiredBy.closeness ? `${product.inspiredBy.closeness}. ` : ''}
              attume is an independent house; this is a comparison of character, not a copy or an
              affiliation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
