'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductCard } from '@/components/home/ProductCard';
import { Container } from '@/components/ui/Container';
import { useGetWishlistQuery } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isInitialised } = useAppSelector((state) => state.auth);
  const { data, isLoading } = useGetWishlistQuery(undefined, { skip: !user });

  useEffect(() => {
    if (isInitialised && !user) router.replace('/login?redirect=/account/wishlist');
  }, [isInitialised, user, router]);

  const products = data?.data.products ?? [];

  return (
    <Container className="py-16 lg:py-24">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Your account</span>
          <h1 className="mt-3 font-serif text-4xl font-light text-ink lg:text-5xl">Wishlist</h1>
        </div>
        <Link href="/account" className="link-underline eyebrow text-ink">
          Account details
        </Link>
      </header>

      {isLoading && <p className="eyebrow mt-10 text-ink-muted">Loading your wishlist…</p>}

      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-start gap-5 py-16">
          <p className="text-sm text-ink-muted">
            Nothing saved yet. Tap the heart on a fragrance to keep it here.
          </p>
          <Link
            href="/shop"
            className="rounded-xl bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
          >
            Shop the collection
          </Link>
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </Container>
  );
}
