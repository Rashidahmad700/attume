import type { Metadata } from 'next';
import Link from 'next/link';
import { ProductCard } from '@/components/home/ProductCard';
import { Container } from '@/components/ui/Container';
import { fetchProducts, searchProducts } from '@/lib/products';
import type { Product } from '@/types';

export const metadata: Metadata = {
  title: 'Shop all fragrances',
  description: 'Every attume extrait de parfum, composed and bottled in small batches.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const products = query
    ? ((await searchProducts(query)).products as Product[])
    : ((await fetchProducts()) as Product[]);

  return (
    <Container className="pt-6 pb-16 lg:pt-8 lg:pb-24">
      <header className="flex flex-col gap-4 border-b border-line pb-10">
        <span className="eyebrow text-bronze">{query ? 'Search' : 'The Collection'}</span>
        <h1 className="font-serif text-4xl font-light text-ink lg:text-5xl">
          {query ? `Results for “${query}”` : 'All fragrances'}
        </h1>
        {query ? (
          <Link href="/shop" className="link-underline eyebrow self-start text-olive">
            Clear search
          </Link>
        ) : (
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            Extrait de parfum at a 30%+ fragrance load, matured for weeks before bottling. Every
            fragrance ships in the 50 ml carton.
          </p>
        )}
        <p className="text-xs text-ink-muted">
          {products.length} fragrance{products.length === 1 ? '' : 's'}
        </p>
      </header>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-ink-muted">
          {query
            ? `Nothing matches “${query}”. Try an accord such as citrus or woody.`
            : 'The catalogue is being restocked. Please check back shortly.'}
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
