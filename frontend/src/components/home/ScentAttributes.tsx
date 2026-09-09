import { Container } from '@/components/ui/Container';

const attributes = [
  {
    label: 'Fragrance',
    detail: '30%+ concentration, so the composition reads clearly from the first spray.',
  },
  {
    label: 'Longevity',
    detail: '8–10 hours on fabric, 6–8 on skin, depending on climate and how much you apply.',
  },
  {
    label: 'Projection',
    detail: 'Room-filling for the first hour, then settling into a close, personal trail.',
  },
  {
    label: 'Quality',
    detail: 'Rare naturals paired with modern captives, matured for weeks before bottling.',
  },
] as const;

/** What we actually promise about how the fragrance performs. */
export function ScentAttributes() {
  return (
    <section className="bg-ink py-16 text-ivory lg:py-20">
      <Container>
        <div className="flex flex-col gap-4 text-center">
          <span className="eyebrow text-bronze">What to expect</span>
          <h2 className="font-serif text-3xl leading-tight font-light sm:text-4xl">
            Built for the whole day, not the first ten minutes
          </h2>
        </div>

        <ul className="mt-12 grid gap-px bg-ivory/12 sm:grid-cols-2 lg:grid-cols-4">
          {attributes.map((attribute) => (
            <li key={attribute.label} className="bg-ink p-7">
              <h3 className="font-serif text-xl font-light text-ivory">{attribute.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">{attribute.detail}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
