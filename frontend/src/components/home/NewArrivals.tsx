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
    <section className="bg-ivory py-20 lg:py-24">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="eyebrow text-bronze">The Collection</span>
          <h2 className="font-serif text-3xl leading-tight font-light text-ink sm:text-4xl lg:text-5xl">
            Two signatures, made to be worn daily
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            One fresh, one warm. Both extrait de parfum at a 30%+ load, matured until the notes
            settle into one another.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-x-10 gap-y-14 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/shop"
            className="border border-ink px-9 py-4 text-xs tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
          >
            View the collection
          </Link>
        </div>
      </Container>
    </section>
  );
}
