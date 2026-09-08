import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BuyBox } from '@/components/product/BuyBox';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductTabs } from '@/components/product/ProductTabs';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Reviews } from '@/components/product/Reviews';
import { ScentProfile } from '@/components/product/ScentProfile';
import { Container } from '@/components/ui/Container';
import { fetchProduct, fetchRelated } from '@/lib/products';
import type { Product } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await fetchProduct(slug)) as Product | null;
  if (!product) return { title: 'Fragrance not found' };

  return {
    title: `${product.name} — ${product.concentration}`,
    description: product.tagline,
    openGraph: { title: product.name, description: product.tagline },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, related] = await Promise.all([fetchProduct(slug), fetchRelated(slug)]);

  if (!product) notFound();

  return (
    <>
      <Container className="py-8 lg:py-12">
        <nav aria-label="Breadcrumb" className="eyebrow flex items-center gap-2 text-ink-muted">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery product={product} />
          <BuyBox product={product} />
        </div>
      </Container>

      <div className="bg-ivory-soft py-16 lg:py-20">
        <Container>
          <ScentProfile product={product} />
        </Container>
      </div>

      <Container className="py-16 lg:py-20">
        <ProductTabs product={product} />
      </Container>

      <Container className="pb-20">
        <Reviews slug={product.slug} />
      </Container>

      <RelatedProducts products={related} />
    </>
  );
}
