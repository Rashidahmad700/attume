import Link from 'next/link';
import { cn } from '@/lib/cn';

/**
 * Wordmark set in the display serif, letter-spaced like the bottle label.
 * Weight 700 is a real Cormorant cut, so this is a drawn bold rather than a
 * synthesised one.
 */
export function Logo({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-[30px] sm:text-[34px]',
    lg: 'text-4xl sm:text-5xl',
  } as const;

  return (
    <Link
      href="/"
      aria-label="attume — home"
      className={cn(
        'group font-serif leading-none font-bold lowercase transition-colors hover:text-olive',
        sizes[size],
        className,
      )}
    >
      <span className="tracking-[0.05em]">attume</span>
    </Link>
  );
}
