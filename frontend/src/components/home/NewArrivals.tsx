import Link from 'next/link';
import { fetchProducts } from '@/lib/products';
import { Container } from '@/components/ui/Container';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

/**
 * The whole catalogue today — two fragrances, so they get a wider grid than a
 * four-up would give them.
 */
export async function NewArrivals() {
  const products = (await fetchProducts()) as Product[];
  if (products.length === 0) return null;

  return (
    <section className="bg-ivory py-10 lg:py-12">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="eyebrow text-bronze">The Collection</span>
          <h2 className="font-serif text-3xl leading-tight font-medium text-ink sm:text-4xl lg:text-5xl">
            Two scents. Two worlds.
          </h2>
          {/* Wide enough to hold the sentence on one line once there is room
              for it; narrower screens still wrap rather than overflow. */}
          <p className="max-w-4xl text-sm leading-relaxed text-ink-muted lg:whitespace-nowrap">
            One carries the brightness of citrus, open air and sunlit mornings. The other settles
            into warm woods, quiet rooms and lingering evenings.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-x-10 gap-y-14 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/shop"
            className="rounded-xl border border-ink px-9 py-4 text-xs tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
          >
            View the collection
          </Link>
        </div>
      </Container>
    </section>
  );
}
