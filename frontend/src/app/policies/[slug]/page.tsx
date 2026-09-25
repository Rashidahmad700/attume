import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { findPolicy, policies } from '@/lib/policies';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return policies.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = findPolicy(slug);
  if (!policy) return { title: 'Not found' };
  return { title: policy.title, description: policy.summary };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = findPolicy(slug);
  if (!policy) notFound();

  return (
    <Container className="py-14 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
        <nav aria-label="Policies" className="flex h-fit flex-col gap-3 lg:sticky lg:top-28">
          <span className="eyebrow text-bronze">Policies</span>
          {policies.map((entry) => (
            <Link
              key={entry.slug}
              href={`/policies/${entry.slug}`}
              className={
                entry.slug === policy.slug
                  ? 'text-sm font-semibold text-olive'
                  : 'text-sm text-ink-muted transition-colors hover:text-olive'
              }
            >
              {entry.title}
            </Link>
          ))}
        </nav>

        <article className="max-w-2xl">
          <h1 className="font-serif text-4xl font-medium text-ink lg:text-5xl">{policy.title}</h1>
          <p className="mt-4 text-sm text-ink-muted">{policy.summary}</p>

          <div className="mt-10 flex flex-col gap-9">
            {policy.sections.map((section) => (
              <section key={section.heading} className="flex flex-col gap-3">
                <h2 className="font-serif text-2xl font-medium text-ink">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-ink-muted">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {/* Who the customer is actually contracting with. A policy that never
              names the entity behind it is the discrepancy payment providers
              flag, and it is the fair thing to state on these pages anyway. */}
          <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted">
            <p>
              Questions? Write to{' '}
              <a href={`mailto:${site.email}`} className="link-underline text-olive">
                {site.email}
              </a>
              .
            </p>
            <p>
              These policies are issued by {site.legalName}
              {site.llpin && ` (LLPIN ${site.llpin})`}, {site.address}.
            </p>
          </div>
        </article>
      </div>
    </Container>
  );
}
