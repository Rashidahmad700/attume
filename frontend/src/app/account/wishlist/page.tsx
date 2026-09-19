'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductCard } from '@/components/home/ProductCard';
import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton } from '@/components/ui/Skeleton';
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
          <h1 className="mt-3 font-serif text-4xl font-medium text-ink lg:text-5xl">Wishlist</h1>
        </div>
        <Link href="/account" className="link-underline eyebrow text-ink">
          Account details
        </Link>
      </header>

      {isLoading && (
        <>
          <LoadingAnnouncement>Loading your wishlist</LoadingAnnouncement>
          {/* Same grid and gaps as the cards below, so nothing reflows. */}
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-4">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </>
      )}

      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-start gap-5 py-16">
          <p className="text-sm text-ink-muted">
            Nothing saved yet. Tap the heart on a fragrance to keep it here.
          </p>
          <Link
            href="/shop"
            className="rounded-xl px-8 py-4 text-xs tracking-[0.16em] uppercase border border-olive bg-olive text-ivory transition-colors hover:bg-ivory hover:text-olive"
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
