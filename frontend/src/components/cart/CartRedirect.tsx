'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton } from '@/components/ui/Skeleton';
import { useAppDispatch } from '@/store/hooks';
import { openCart } from '@/store/slices/uiSlice';

/**
 * Sends /cart to the shop with the bag already open.
 *
 * `replace` rather than `push`, so pressing back from the shop does not land
 * on this route and bounce forward again.
 */
export function CartRedirect() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(openCart());
    router.replace('/shop');
  }, [dispatch, router]);

  // Shown for the instant before the replace lands. Shaped like the shop grid
  // it is about to become, so the handoff does not flash a different layout.
  return (
    <Container className="pt-6 pb-16 lg:pt-8 lg:pb-24">
      <LoadingAnnouncement>Opening your bag</LoadingAnnouncement>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-64 lg:h-12" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        ))}
      </div>
    </Container>
  );
}
