import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'warn' | 'danger' | 'good';
}) {
  const tones = {
    default: 'text-ink',
    good: 'text-olive',
    warn: 'text-bronze',
    danger: 'text-espresso',
  } as const;

  return (
    <div className="panel flex flex-col gap-2 p-5">
      <span className="eyebrow text-ink-muted">{label}</span>
      <span className={cn('font-serif text-3xl font-light', tones[tone])}>{value}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  );
}
