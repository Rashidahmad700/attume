'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { PrebookForm } from '@/components/PrebookForm';
import { useGetMyPrebookingsQuery } from '@/store/api/prebookingApi';
import { useAppSelector } from '@/store/hooks';
import type { Product } from '@/types';
import { Stars } from './Stars';
import { WishlistButton } from './WishlistButton';

/**
 * The buy box while the shop is pre-booking. Price and scent detail are shown
 * exactly as they will be on sale — what changes is that the button opens a
 * pre-booking form instead of adding to a bag.
 */
export function PrebookBox({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  // Only asked for when there is a session to ask about.
  const { data, isLoading: isCheckingPrebookings } = useGetMyPrebookingsQuery(undefined, {
    skip: !user,
  });
  const existing = data?.data.prebookings.find((entry) => entry.slug === product.slug);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <span className="text-[0.78rem] font-semibold tracking-[0.16em] text-olive uppercase">
          attume
        </span>
        <h1 className="font-serif text-4xl leading-tight font-bold text-ink lg:text-5xl">
          {product.name}
        </h1>
        <span className="eyebrow text-ink-muted">
          {product.concentration} · {product.sizeMl} ML
        </span>
        <p className="text-base leading-relaxed font-medium text-ink-soft">{product.tagline}</p>

        <div className="flex items-center gap-3 pt-1">
          <Stars value={product.rating.average} />
          <span className="text-sm text-ink-muted">
            {product.rating.count > 0
              ? `${product.rating.average.toFixed(2)} · ${product.rating.count} review${product.rating.count === 1 ? '' : 's'}`
              : 'No reviews yet'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3 border-t border-line pt-6">
        <span className="eyebrow mr-1 text-ink-muted">MRP</span>
        <span className="price text-3xl text-cherry">{formatPrice(product.price)}</span>
        {product.compareAtPrice && product.discountPercent > 0 && (
          <span className="price text-sm font-normal text-ink-muted line-through">
            {formatPrice(product.compareAtPrice)}
          </span>
        )}
        <span className="w-full text-sm text-ink-muted">Inclusive of all taxes</span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="eyebrow text-ink-muted">
          Size: <span className="text-ink">{product.sizeMl} ml</span>
        </span>
        <span
          aria-current="true"
          className="w-fit rounded-xl border border-olive bg-olive/5 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-olive uppercase"
        >
          {product.sizeMl} ml
        </span>
      </div>

      <div className="flex flex-col gap-5 border border-line bg-ivory-soft p-6 rounded-2xl">
        <div className="flex flex-col gap-2">
          <span className="eyebrow text-olive">Pre-booking open</span>
          <p className="text-base leading-relaxed text-ink-soft">
            This batch is not on sale yet. Reserve your bottle now and you will be written to first,
            with the price held at {formatPrice(product.price)}. No payment is taken today.
          </p>
        </div>

        {existing && !open ? (
          // Already on the list: say so rather than offering the same form
          // again, and leave a way to change the request.
          <div className="flex flex-col gap-3">
            <p className="rounded-xl border border-olive/40 bg-olive/5 px-4 py-3 text-sm font-medium text-olive">
              You are on the list for {product.name}
              {existing.quantity > 1 ? ` — ${existing.quantity} bottles` : ''}. We will write to you
              before it ships.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="link-underline eyebrow self-start font-bold text-olive"
            >
              Change my pre-booking
            </button>
          </div>
        ) : open ? (
          <PrebookForm
            slug={product.slug}
            productName={product.name}
            source="product"
            compact
          />
        ) : (
          <div className="flex items-stretch gap-3">
            <WishlistButton
              slug={product.slug}
              className="rounded-xl border border-line px-4 py-3.5 hover:border-olive"
            />
            <button
              type="button"
              onClick={() => setOpen(true)}
              disabled={isCheckingPrebookings}
              className="flex-1 rounded-xl border border-olive bg-olive px-8 py-4 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive disabled:opacity-60"
            >
              {isCheckingPrebookings ? 'Checking…' : 'Pre-book this bottle'}
            </button>
          </div>
        )}
      </div>

      <ol className="flex flex-col gap-3 text-base text-ink-soft">
        {[
          'Leave your details — nothing is charged.',
          'We write to you the moment the batch is ready.',
          'You confirm, pay and we dispatch.',
        ].map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="eyebrow text-olive">{String(index + 1).padStart(2, '0')}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
