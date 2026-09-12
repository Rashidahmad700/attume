'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import { useAppDispatch } from '@/store/hooks';
import { addItem } from '@/store/slices/cartSlice';
import type { Product } from '@/types';
import { ProductImage } from '@/components/product/ProductImage';
import { Stars } from '@/components/product/Stars';
import { WishlistButton } from '@/components/product/WishlistButton';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);

  const topAccords = product.accords.slice(0, 3).map((accord) => accord.name);

  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-soft">
          <ProductImage
            product={product}
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />

          {product.badge && product.inStock && (
            <span className="absolute top-4 left-4 bg-ink px-3 py-1.5 text-[10px] tracking-[0.16em] text-ivory uppercase">
              {product.badge}
            </span>
          )}
          {!product.inStock && (
            <span className="absolute top-4 left-4 border border-espresso bg-ivory px-3 py-1.5 text-[10px] tracking-[0.16em] text-espresso uppercase">
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
        {topAccords.length > 0 && (
          <p className="text-xs text-ink-muted">{topAccords.join(' · ')}</p>
        )}

        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-light text-ink">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-sm text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.discountPercent > 0 && (
              <span className="text-xs text-ink-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-ink-muted">{product.tagline}</p>

        {product.rating.count > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Stars value={product.rating.average} size="sm" />
            <span className="text-xs text-ink-muted">{product.rating.count}</span>
          </div>
        )}

        <div className="mt-4 pt-1">
          {product.inStock ? (
            <button
              type="button"
              onClick={() => {
                dispatch(addItem({ slug: product.slug }));
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
              }}
              className="w-full rounded-xl border border-ink py-3 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
            >
              {added ? 'Added to bag' : 'Quick add'}
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
