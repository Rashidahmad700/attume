import { cn } from '@/lib/cn';

/**
 * A placeholder shaped like the thing that is coming.
 *
 * The point is that the page does not move when content lands: a skeleton
 * must occupy the same box its real content will. A spinner in the middle of
 * an empty page tells the reader nothing about what to expect and guarantees
 * a jump when it resolves.
 *
 * `animate-pulse` is skipped for anyone who has asked for reduced motion —
 * the shapes still communicate the layout without the breathing.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-ink/8 motion-safe:animate-pulse',
        // Never let a bare skeleton collapse to nothing.
        'min-h-[1em]',
        className,
      )}
    />
  );
}

/**
 * Text placeholder of a given number of lines. The last line is short, the way
 * a real paragraph ends, so a block of them does not read as a grey brick.
 */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3.5', index === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  );
}

/**
 * Announces to a screen reader that something is loading. Skeletons are
 * `aria-hidden`, so without this the wait is silent for anyone not looking at
 * the shapes.
 */
export function LoadingAnnouncement({ children = 'Loading' }: { children?: string }) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {children}
    </p>
  );
}
