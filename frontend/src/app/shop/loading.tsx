import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton } from '@/components/ui/Skeleton';

/**
 * Mirrors the real grid in shop/page.tsx — same container padding, same gaps,
 * same square frames — so the catalogue lands without the page shifting.
 *
 * Four cards because that is the widest row; on narrower screens the grid
 * reflows them exactly as it reflows the real ones.
 */
export default function ShopLoading() {
  return (
    <Container className="pt-6 pb-16 lg:pt-8 lg:pb-24">
      <LoadingAnnouncement>Loading the collection</LoadingAnnouncement>

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
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
