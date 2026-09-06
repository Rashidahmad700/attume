import Link from 'next/link';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/products';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-soft">
          {/* Placeholder frame until product photography is uploaded. */}
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]">
            <div className="flex h-[62%] w-[42%] flex-col items-center justify-center gap-3 border border-line bg-ivory/70">
              <span className="eyebrow text-ink-muted">attume</span>
              <span className="font-serif text-2xl lowercase text-olive">{product.name}</span>
              <span className="eyebrow text-ink-muted">{product.size}</span>
            </div>
          </div>

          {product.badge && (
            <span className="absolute top-4 left-4 bg-ink px-3 py-1.5 text-[10px] tracking-[0.16em] text-ivory uppercase">
              {product.badge}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-3.5 text-center opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="eyebrow text-ivory">View fragrance</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col gap-2 pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-light text-ink">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-sm text-ink">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-ink-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm leading-relaxed text-ink-muted">{product.tagline}</p>
        <p className="eyebrow pt-1 text-bronze">{product.notes.join(' · ')}</p>
      </div>
    </article>
  );
}
