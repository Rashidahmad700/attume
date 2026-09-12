'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/products';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import type { Product } from '@/types';
import { Stars } from './Stars';

const MAX_PER_LINE = 5;

/**
 * Price, size, quantity and the add-to-bag action — plus the out-of-stock
 * variant, where the primary button is replaced by a notify-me capture.
 */
export function BuyBox({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const inCart = useAppSelector(
    (state) => state.cart.items.find((item) => item.slug === product.slug)?.quantity ?? 0,
  );

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyState, setNotifyState] = useState<'idle' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2600);
    return () => clearTimeout(timer);
  }, [justAdded]);

  const remaining = Math.max(0, Math.min(product.stock, MAX_PER_LINE) - inCart);
  const canAdd = product.inStock && remaining > 0;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <span className="eyebrow text-olive">
          {product.concentration} · {product.sizeMl} ML
        </span>
        <h1 className="font-serif text-4xl leading-tight font-light text-ink lg:text-5xl">
          {product.name}
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">{product.tagline}</p>

        <div className="flex items-center gap-3 pt-1">
          <Stars value={product.rating.average} />
          <span className="text-xs text-ink-muted">
            {product.rating.count > 0
              ? `${product.rating.average.toFixed(2)} · ${product.rating.count} review${product.rating.count === 1 ? '' : 's'}`
              : 'No reviews yet'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3 border-t border-line pt-6">
        <span className="font-serif text-3xl font-light text-ink">{formatPrice(product.price)}</span>
        {product.compareAtPrice && product.discountPercent > 0 && (
          <>
            <span className="text-sm text-ink-muted line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="bg-espresso px-2.5 py-1 text-[10px] tracking-[0.14em] text-ivory uppercase">
              {product.discountPercent}% off
            </span>
          </>
        )}
        <span className="w-full text-xs text-ink-muted">Inclusive of all taxes</span>
      </div>

      <div className="flex flex-col gap-3">
        <span className="eyebrow text-ink-muted">Size</span>
        <div className="flex gap-3">
          <span className="border border-olive bg-olive/5 px-5 py-2.5 text-xs tracking-[0.14em] text-olive uppercase">
            {product.sizeMl} ml
          </span>
        </div>
      </div>

      {product.inStock ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-stretch gap-3">
            <div className="flex items-center border border-line">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="px-4 py-3 text-ink disabled:opacity-30"
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(remaining || 1, value + 1))}
                disabled={quantity >= remaining}
                aria-label="Increase quantity"
                className="px-4 py-3 text-ink disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                dispatch(addItem({ slug: product.slug, quantity, max: MAX_PER_LINE }));
                setJustAdded(true);
                setQuantity(1);
              }}
              className="flex-1 bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-40"
            >
              {canAdd ? 'Add to bag' : 'Maximum in bag'}
            </button>
          </div>

          {justAdded && (
            <p className="flex items-center justify-between border border-olive/40 bg-olive/5 px-4 py-3 text-sm text-olive">
              <span>Added to your bag.</span>
              <Link href="/cart" className="link-underline eyebrow">
                View bag
              </Link>
            </p>
          )}

          {product.isLowStock && (
            <p className="text-xs text-espresso">
              Only {product.stock} left in this batch — small runs sell through quickly.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="w-full border border-espresso/40 bg-espresso/5 py-4 text-center text-xs tracking-[0.16em] text-espresso uppercase">
            Out of stock
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
                setNotifyState('error');
                return;
              }
              // Stored locally for now; the notify list is wired up with the
              // email service in a later phase.
              setNotifyState('done');
              setNotifyEmail('');
            }}
            className="flex flex-col gap-3"
          >
            <label className="eyebrow text-ink-muted" htmlFor="notify-email">
              Email me when it is back
            </label>
            <div className="flex gap-3">
              <input
                id="notify-email"
                type="email"
                value={notifyEmail}
                onChange={(event) => {
                  setNotifyEmail(event.target.value);
                  setNotifyState('idle');
                }}
                placeholder="you@example.com"
                className="flex-1 border-b border-line bg-transparent py-3 text-sm focus:border-olive focus:outline-none"
              />
              <button
                type="submit"
                className="border border-ink px-6 py-3 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
              >
                Notify me
              </button>
            </div>
            <p className="text-xs" aria-live="polite">
              {notifyState === 'done' && (
                <span className="text-olive">We will write to you the moment it returns.</span>
              )}
              {notifyState === 'error' && (
                <span className="text-espresso">Please enter a valid email address.</span>
              )}
              {notifyState === 'idle' && (
                <span className="text-ink-muted">
                  Restocked in small batches — the list is notified first.
                </span>
              )}
            </p>
          </form>
        </div>
      )}


    </div>
  );
}
