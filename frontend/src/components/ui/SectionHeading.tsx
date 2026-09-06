import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'dark',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
      )}
    >
      {eyebrow && (
        <span className={cn('eyebrow', tone === 'dark' ? 'text-bronze' : 'text-ivory/70')}>
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'font-serif text-3xl leading-tight font-light sm:text-4xl lg:text-5xl',
          tone === 'dark' ? 'text-ink' : 'text-ivory',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'max-w-xl text-sm leading-relaxed',
            tone === 'dark' ? 'text-ink-muted' : 'text-ivory/70',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
