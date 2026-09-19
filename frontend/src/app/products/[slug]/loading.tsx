import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/**
 * Matches the product page's two-column split: gallery on the left, the buy
 * column on the right, stacking below `lg` exactly as the real page does.
 *
 * The gallery placeholder is square because the product frames are square —
 * getting this wrong is worse than no skeleton, since the page would settle
 * into a different shape than the one it promised.
 */
export default function ProductLoading() {
  return (
    <Container className="py-8 lg:py-12">
      <LoadingAnnouncement>Loading the fragrance</LoadingAnnouncement>

      <Skeleton className="h-3 w-40" />

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-20 shrink-0" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-2/3 lg:h-14" />
          <Skeleton className="h-4 w-48" />
          <SkeletonText lines={3} />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-14 w-full max-w-sm" />
          <div className="flex flex-col gap-3 pt-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
          </div>
        </div>
      </div>
    </Container>
  );
}
