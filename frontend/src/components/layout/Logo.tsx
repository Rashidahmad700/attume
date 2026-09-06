import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Wordmark set in the display serif, letter-spaced like the bottle label. */
export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl sm:text-[26px]',
    lg: 'text-3xl sm:text-4xl',
  } as const;

  return (
    <Link
      href="/"
      aria-label="attume — home"
      className={cn('font-serif lowercase', sizes[size], className)}
    >
      <span className="tracking-[0.06em]">attume</span>
    </Link>
  );
}
