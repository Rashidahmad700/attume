import { cn } from '@/lib/cn';
import type { Product } from '@/types';

/**
 * A product's primary image, or a typeset stand-in while photography is
 * pending. Every grid, search result and bag line renders through this, so
 * attaching real images lights them all up at once.
 */
export function ProductImage({
  product,
  className,
  labelClassName,
}: {
  product: Pick<Product, 'name' | 'sizeMl' | 'images'>;
  className?: string;
  labelClassName?: string;
}) {
  const image = product.images?.[0];

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image.url}
        alt={image.alt ?? product.name}
        loading="lazy"
        className={cn('h-full w-full object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-[62%] w-[42%] flex-col items-center justify-center gap-3 border border-line bg-ivory/70',
          labelClassName,
        )}
      >
        <span className="eyebrow text-ink-muted">attume</span>
        <span className="font-serif text-2xl lowercase text-olive">{product.name}</span>
        <span className="eyebrow text-ink-muted">{product.sizeMl} ML</span>
      </div>
    </div>
  );
}
