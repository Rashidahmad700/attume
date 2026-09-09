import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { NotifyForm } from '@/components/NotifyForm';

/** Shared shell for products that are announced but not yet on sale. */
export function ComingSoon({
  eyebrow,
  title,
  description,
  points,
}: {
  eyebrow: string;
  title: string;
  description: string;
  points: { heading: string; body: string }[];
}) {
  return (
    <Container className="py-16 lg:py-24">
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="eyebrow text-bronze">{eyebrow}</span>
            <span className="rounded-full border border-line px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
              Coming soon
            </span>
          </div>

          <h1 className="font-serif text-4xl leading-tight font-light text-ink lg:text-5xl">
            {title}
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-ink-muted">{description}</p>

          <dl className="mt-4 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point.heading}>
                <dt className="font-serif text-xl font-light text-ink">{point.heading}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{point.body}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-4">
            <ButtonLink href="/shop" size="lg">
              Shop what is available
            </ButtonLink>
            <Link
              href="/contact"
              className="rounded-xl border border-line px-8 py-4 text-[11px] font-semibold tracking-[0.14em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
            >
              Ask a question
            </Link>
          </div>
        </div>

        <NotifyForm label={`Tell me when ${eyebrow.toLowerCase()} is ready`} />
      </div>
    </Container>
  );
}
