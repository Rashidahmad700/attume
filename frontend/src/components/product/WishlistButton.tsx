'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  useAddToWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';

/**
 * Saving requires an account — the list lives on the user, so a guest is sent
 * to sign in and returned to whatever they were looking at.
 */
export function WishlistButton({
  slug,
  className,
  showLabel = false,
}: {
  slug: string;
  className?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const { data } = useGetWishlistQuery(undefined, { skip: !user });
  const [add, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [remove, { isLoading: isRemoving }] = useRemoveFromWishlistMutation();

  const saved = Boolean(data?.data.products.some((product) => product.slug === slug));
  const busy = isAdding || isRemoving;

  const toggle = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (saved) await remove(slug).unwrap().catch(() => undefined);
    else await add(slug).unwrap().catch(() => undefined);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={cn(
        'inline-flex items-center gap-2 transition-colors disabled:opacity-50',
        saved ? 'text-espresso' : 'text-ink-muted hover:text-olive',
        className,
      )}
    >
      <svg
        viewBox="0 0 20 18"
        className="h-5 w-5"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.4"
        aria-hidden="true"
      >
        <path d="M10 16.5 8.7 15.3C4.5 11.5 1.7 9 1.7 5.9 1.7 3.4 3.6 1.5 6.1 1.5c1.4 0 2.8.7 3.9 1.8 1.1-1.1 2.5-1.8 3.9-1.8 2.5 0 4.4 1.9 4.4 4.4 0 3.1-2.8 5.6-7 9.4L10 16.5Z" />
      </svg>
      {showLabel && (
        <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
          {saved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
