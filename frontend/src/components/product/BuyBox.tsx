'use client';

import { useState } from 'react';
import { PrebookForm } from '@/components/PrebookForm';
import { formatPrice } from '@/lib/products';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuth, openCart } from '@/store/slices/uiSlice';
import { addItem } from '@/store/slices/cartSlice';
import type { Product } from '@/types';
import { Stars } from './Stars';
import { WishlistButton } from './WishlistButton';

const MAX_PER_LINE = 5;

/**
 * Price, size, quantity and the add-to-bag action — plus the out-of-stock
 * variant, where the primary button is replaced by a notify-me capture.
 */
export function BuyBox({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const inCart = useAppSelector(
    (state) => state.cart.items.find((item) => item.slug === product.slug)?.quantity ?? 0,
  );

  const [quantity, setQuantity] = useState(1);

  const remaining = Math.max(0, Math.min(product.stock, MAX_PER_LINE) - inCart);
  const canAdd = product.inStock && remaining > 0;

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
        <div className="flex flex-wrap gap-3">
          {/* One size today; rendered as a variant option so adding 15 ml or a
              discovery size later is a data change, not a layout change. */}
          <span
            aria-current="true"
            className="rounded-xl border border-olive bg-olive/5 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-olive uppercase"
          >
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

            <WishlistButton
              slug={product.slug}
              className="rounded-xl border border-line px-4 py-3.5 hover:border-olive"
            />

            <button
              type="button"
              disabled={!canAdd}
              onClick={() => {
                // The bag belongs to an account, so a guest is asked to sign in
                // rather than losing what they picked at checkout.
                if (!user) {
                  dispatch(openAuth('cart'));
                  return;
                }
                dispatch(addItem({ slug: product.slug, quantity, max: MAX_PER_LINE }));
                setQuantity(1);
                // The bag slides in showing what was just added, which is the
                // confirmation — no need to offer a link to go and look.
                dispatch(openCart());
              }}
              className="flex-1 rounded-xl px-8 py-4 text-xs tracking-[0.16em] uppercase disabled:cursor-not-allowed disabled:opacity-40 border border-olive bg-olive text-ivory transition-colors hover:bg-ivory hover:text-olive"
            >
              {canAdd ? 'Add to bag' : 'Maximum in bag'}
            </button>
          </div>

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

          {/* Persisted, not remembered in this tab: a restock list is only
              worth asking for if it survives the page. */}
          <PrebookForm
            slug={product.slug}
            source="restock"
            heading="Email me when it is back"
            blurb="Restocked in small batches — the list is notified first."
            compact
          />
        </div>
      )}


    </div>
  );
}
