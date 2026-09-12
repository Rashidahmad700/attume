import { accordSwatch } from '@/lib/scentColours';
import type { Product } from '@/types';

function AccordBars({ accords }: { accords: Product['accords'] }) {
  if (accords.length === 0) return null;
  const strongest = Math.max(...accords.map((accord) => accord.strength));

  return (
    <section>
      <h2 className="eyebrow mb-6 text-bronze">Main accords</h2>
      <ul className="flex flex-col gap-1.5">
        {[...accords]
          .sort((a, b) => b.strength - a.strength)
          .map((accord) => {
            const swatch = accordSwatch(accord.name);
            // Relative to the strongest accord, floored so the last bar still
            // has room for its label.
            const width = Math.max(32, Math.round((accord.strength / strongest) * 100));

            return (
              <li key={accord.name}>
                <div
                  className="flex items-center justify-center rounded-sm px-4 py-2.5"
                  style={{ width: `${width}%`, backgroundColor: swatch.bg, color: swatch.text }}
                >
                  <span className="text-[13px] font-medium lowercase">{accord.name}</span>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

/** Accord bars, when it suits, and what it sits closest to. */
export function ScentProfile({ product }: { product: Product }) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
      <AccordBars accords={product.accords} />

      <div className="flex flex-col gap-10">
        {(product.wear.seasons.length > 0 || product.wear.times.length > 0) && (
          <div className="flex flex-col gap-4">
            <h2 className="eyebrow text-bronze">Wear it</h2>
            <div className="flex flex-wrap gap-2">
              {[...product.wear.seasons, ...product.wear.times].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-4 py-2 text-xs text-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-6 border-t border-line pt-8 text-sm">
          <div>
            <dt className="eyebrow text-ink-muted">Longevity</dt>
            <dd className="mt-1 text-ink">{product.performance.longevity}</dd>
          </div>
          <div>
            <dt className="eyebrow text-ink-muted">Sillage</dt>
            <dd className="mt-1 text-ink">{product.performance.sillage}</dd>
          </div>
        </dl>

        {product.inspiredBy?.name && (
          <div className="rounded-xl border border-line bg-ivory-soft p-6">
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
    </div>
  );
}
