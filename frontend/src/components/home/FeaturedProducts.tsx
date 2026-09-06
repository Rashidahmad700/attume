import { featuredProducts } from '@/lib/products';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductCard } from './ProductCard';

export function FeaturedProducts() {
  return (
    <section className="bg-ivory py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="The Collection"
          title="Signatures worth returning to"
          description="Four compositions, each built around a single idea and matured until the notes settle into one another."
        />

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <ButtonLink href="/shop" variant="outline" size="lg">
            View all fragrances
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
