import { cn } from '@/lib/cn';

/** Half-star aware rating display. */
export function Stars({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const dimension = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - star + 1));
        return (
          <svg key={star} viewBox="0 0 20 20" className={cn(dimension, 'shrink-0')} aria-hidden="true">
            <defs>
              <linearGradient id={`star-${star}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#a98b5d" />
                <stop offset={`${fill * 100}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.47 5.3 5.53.7-4.08 3.9 1.06 5.9L10 14.6l-4.98 2.8 1.06-5.9L2 7.6l5.53-.7z"
              fill={`url(#star-${star}-${Math.round(fill * 100)})`}
              stroke="#a98b5d"
              strokeWidth="1"
            />
          </svg>
        );
      })}
    </span>
  );
}
