import { Container } from '@/components/ui/Container';
import { ProductCard } from '@/components/home/ProductCard';
import type { Product } from '@/types';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-ivory-soft py-20">
      <Container>
        <h2 className="text-center font-serif text-3xl font-light text-ink lg:text-4xl">
          You may also like
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
