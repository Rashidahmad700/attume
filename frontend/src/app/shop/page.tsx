import type { Metadata } from 'next';
import { ProductCard } from '@/components/home/ProductCard';
import { Container } from '@/components/ui/Container';
import { fetchProducts } from '@/lib/products';
import type { Product } from '@/types';

export const metadata: Metadata = {
  title: 'Shop all fragrances',
  description: 'Every attume extrait de parfum, composed and bottled in small batches.',
};

export default async function ShopPage() {
  const products = (await fetchProducts()) as Product[];

  return (
    <Container className="py-16 lg:py-24">
      <header className="flex flex-col gap-4 border-b border-line pb-10">
        <span className="eyebrow text-bronze">The Collection</span>
        <h1 className="font-serif text-4xl font-light text-ink lg:text-5xl">All fragrances</h1>
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
          Extrait de parfum at a 30%+ fragrance load, matured for weeks before bottling. Every
          fragrance ships in the 50 ml carton.
        </p>
        <p className="text-xs text-ink-muted">{products.length} fragrances</p>
      </header>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink-muted">
          The catalogue is being restocked. Please check back shortly.
        </p>
      ) : (
        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
