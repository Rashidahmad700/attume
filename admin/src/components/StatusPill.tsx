import { cn } from '@/lib/cn';

const styles: Record<string, string> = {
  pending: 'bg-bronze/15 text-bronze border-bronze/40',
  confirmed: 'bg-olive/10 text-olive border-olive/40',
  packed: 'bg-olive/10 text-olive border-olive/40',
  shipped: 'bg-ink/10 text-ink border-ink/30',
  delivered: 'bg-olive text-ivory border-olive',
  cancelled: 'bg-espresso/10 text-espresso border-espresso/40',
  returned: 'bg-espresso/10 text-espresso border-espresso/40',
  paid: 'bg-olive text-ivory border-olive',
  refunded: 'bg-espresso/10 text-espresso border-espresso/40',
  failed: 'bg-espresso text-ivory border-espresso',
  active: 'bg-olive/10 text-olive border-olive/40',
  draft: 'bg-ink/8 text-ink-muted border-line',
  archived: 'bg-ink/8 text-ink-muted border-line',
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        'inline-block border px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase',
        styles[value] ?? 'bg-ink/8 text-ink-muted border-line',
      )}
    >
      {value}
    </span>
  );
}
