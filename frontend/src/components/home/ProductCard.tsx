'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { useIsPrebook } from '@/store/api/configApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import { openAuth } from '@/store/slices/uiSlice';
import type { Product } from '@/types';
import { BagIcon, CheckIcon } from '@/components/ui/icons';
import { ProductImage } from '@/components/product/ProductImage';
import { Stars } from '@/components/product/Stars';
import { WishlistButton } from '@/components/product/WishlistButton';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const isPrebook = useIsPrebook();

  // Client's card format: accords above the name, the note pyramid condensed
  // into one line beneath it.
  const accordLine = product.accords
    .slice(0, 3)
    .map((accord) => accord.name)
    .join(' | ');

  const noteLine = [product.notes.top, product.notes.middle, product.notes.base]
    .filter((layer) => layer.length > 0)
    .map((layer) =>
      layer.length > 1
        ? `${layer.slice(0, -1).join(', ')} & ${layer[layer.length - 1]}`
        : layer[0],
    )
    .join(' | ');

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-ivory-soft">
          <ProductImage
            product={product}
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {/* Both compositions are built to wear on anyone — worth saying on
              the card, where people decide whether it is "for them". */}
          {product.audience && (
            <span className="absolute top-4 left-4 rounded-full border border-ink/15 bg-ivory/90 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-ink uppercase backdrop-blur-sm">
              {product.audience}
            </span>
          )}

          {!product.inStock && (
            <span className="absolute top-4 right-4 border border-espresso bg-ivory px-3 py-1.5 text-[10px] tracking-[0.16em] text-espresso uppercase">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="relative">
        <div className="absolute right-3 -top-12 z-10">
          <WishlistButton slug={product.slug} className="rounded-full bg-ivory/90 p-2" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 pt-5">
        {accordLine && (
          <p className="text-[11px] font-semibold tracking-[0.12em] text-bronze-deep uppercase">
            {accordLine}
          </p>
        )}

        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-bold tracking-wide text-ink uppercase">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="price text-sm text-cherry">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.discountPercent > 0 && (
              <span className="price text-xs font-normal text-ink-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {noteLine && <p className="text-xs leading-relaxed font-medium text-espresso">{noteLine}</p>}

        {product.rating.count > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Stars value={product.rating.average} size="sm" />
            <span className="text-xs text-ink-muted">{product.rating.count}</span>
          </div>
        )}

        {/* mt-auto keeps the button on the card's baseline however many lines
            the note list wraps to, so a row of cards stays aligned. */}
        <div className="mt-auto pt-5">
          {isPrebook ? (
            // Pre-booking asks for details, so it belongs on the product page
            // rather than behind a one-tap button in a grid.
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-xl py-3 text-center text-[11px] font-semibold tracking-[0.16em] uppercase border border-olive bg-olive text-ivory transition-colors hover:bg-ivory hover:text-olive"
            >
              Pre-book
            </Link>
          ) : product.inStock ? (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  dispatch(openAuth('cart'));
                  return;
                }
                dispatch(addItem({ slug: product.slug }));
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
                // No drawer from the grid: adding a second fragrance is the
                // likeliest next action, and a panel over the row you are
                // reading interrupts it. The burst confirms it instead.
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-olive bg-olive py-3.5 text-[11px] font-bold tracking-[0.16em] text-ivory uppercase transition-all duration-300 hover:bg-ivory hover:text-olive active:scale-[0.98]"
            >
              {added ? (
                <>
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  In your bag
                </>
              ) : (
                <>
                  <BagIcon className="h-4 w-4" aria-hidden="true" />
                  Add to bag
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="block w-full rounded-xl border border-line py-3 text-center text-[11px] tracking-[0.16em] text-ink-muted uppercase hover:border-ink hover:text-ink"
            >
              Notify me
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
