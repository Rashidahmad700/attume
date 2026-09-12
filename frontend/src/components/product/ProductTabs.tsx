'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

const tabs = ['Description', 'Ingredients', 'Instructions', 'Other details'] as const;
type Tab = (typeof tabs)[number];

export function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<Tab>('Description');

  return (
    <section className="flex flex-col gap-8">
      <div role="tablist" aria-label="Product information" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={cn(
              'border px-5 py-2.5 text-[11px] tracking-[0.14em] uppercase transition-colors',
              active === tab
                ? 'border-ink bg-ink text-ivory'
                : 'border-line text-ink-muted hover:border-ink hover:text-ink',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="max-w-3xl">
        {active === 'Description' && (
          <div className="flex flex-col gap-5">
            {product.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
            {/* The notes live here now, read as sentences rather than a chart. */}
            <dl className="mt-2 flex flex-col gap-3 border-t border-line pt-5">
              {(
                [
                  ['Top notes', product.notes.top],
                  ['Heart notes', product.notes.middle],
                  ['Base notes', product.notes.base],
                ] as const
              )
                .filter(([, notes]) => notes.length > 0)
                .map(([label, notes]) => (
                  <div key={label} className="grid gap-1 sm:grid-cols-[140px_1fr]">
                    <dt className="eyebrow text-ink-muted">{label}</dt>
                    <dd className="text-sm text-ink">{notes.join(' · ')}</dd>
                  </div>
                ))}
            </dl>

            {product.highlights.length > 0 && (
              <ul className="mt-2 flex flex-col gap-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3 text-sm text-ink">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-bronze" />
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {active === 'Ingredients' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-ink-muted">{product.details.ingredients}</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Net volume {product.sizeMl} ml · {product.concentration}
            </p>
          </div>
        )}

        {active === 'Instructions' && (
          <ol className="flex flex-col gap-4">
            {product.details.howToUse.map((step, index) => (
              <li key={step} className="flex gap-4 text-sm text-ink">
                <span className="font-serif text-xl text-bronze">{index + 1}</span>
                <span className="text-ink-muted">{step}</span>
              </li>
            ))}
          </ol>
        )}

        {active === 'Other details' && (
          <dl className="flex flex-col">
            {[
              ['Best before', product.details.bestBefore],
              ['Manufactured & marketed by', product.details.manufacturedBy],
              ['Country of origin', product.details.countryOfOrigin],
              ['SKU', product.sku],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[220px_1fr]">
                <dt className="eyebrow text-ink-muted">{label}</dt>
                <dd className="text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
