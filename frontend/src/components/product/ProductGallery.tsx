'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { Product } from '@/types';

/**
 * Thumbnail rail plus a large frame. Real photography drops straight in via
 * product.images; until then each slide is a typeset label panel.
 */
export function ProductGallery({ product }: { product: Product }) {
  const slides =
    product.images.length > 0
      ? product.images.map((image, index) => ({ kind: 'image' as const, image, key: `i${index}` }))
      : [
          { kind: 'label' as const, key: 'label' },
          { kind: 'notes' as const, key: 'notes' },
          { kind: 'story' as const, key: 'story' },
        ];

  const [active, setActive] = useState(0);
  const current = slides[Math.min(active, slides.length - 1)];

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      <div className="flex gap-3 lg:flex-col">
        {slides.map((slide, index) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`View image ${index + 1}`}
            className={cn(
              'h-20 w-16 shrink-0 border bg-ivory-soft transition-colors',
              index === active ? 'border-olive' : 'border-line hover:border-ink/40',
            )}
          >
            <span className="flex h-full items-center justify-center font-serif text-xs lowercase text-ink-muted">
              {product.name.slice(0, 3)}
            </span>
          </button>
        ))}
      </div>

      <div className="relative aspect-[4/5] flex-1 overflow-hidden border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]">
        {product.badge && (
          <span className="absolute top-5 left-5 z-10 bg-ink px-3 py-1.5 text-[10px] tracking-[0.16em] text-ivory uppercase">
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute top-5 right-5 z-10 border border-espresso bg-ivory px-3 py-1.5 text-[10px] tracking-[0.16em] text-espresso uppercase">
            Sold out
          </span>
        )}

        {current.kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.image.url}
            alt={current.image.alt ?? product.name}
            className="h-full w-full object-cover"
          />
        ) : current.kind === 'notes' ? (
          <div className="flex h-full flex-col justify-center gap-6 px-10">
            <span className="eyebrow text-bronze">The composition</span>
            {(['top', 'middle', 'base'] as const).map((layer) => (
              <div key={layer} className="border-t border-line pt-3">
                <span className="eyebrow text-ink-muted">{layer} notes</span>
                <p className="mt-1 font-serif text-xl font-light text-ink">
                  {product.notes[layer].join(' · ')}
                </p>
              </div>
            ))}
          </div>
        ) : current.kind === 'story' ? (
          <div className="flex h-full items-center justify-center px-12 text-center">
            <p className="font-serif text-2xl leading-snug font-light text-ink">
              “{product.tagline}”
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-[62%] w-[46%] flex-col items-center justify-center gap-4 border border-line bg-ivory/70">
              <span className="eyebrow text-ink-muted">attume</span>
              <span className="font-serif text-4xl lowercase text-olive">{product.name}</span>
              <span className="eyebrow text-ink-muted">{product.concentration}</span>
              <span className="eyebrow text-ink-muted">{product.sizeMl} ML</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
