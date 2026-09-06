import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function BrandStatement() {
  return (
    <section className="bg-ink py-20 text-ivory lg:py-32">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="flex flex-col gap-7">
          <span className="eyebrow text-bronze">The House</span>
          <h2 className="font-serif text-3xl leading-tight font-light sm:text-4xl lg:text-5xl">
            Composed slowly, worn for hours, remembered for years.
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-ivory/65">
            Every attume extrait is macerated for weeks before it is bottled, so the notes arrive
            together rather than in sequence. No shortcuts, no filler — a high fragrance load, a
            clean base, and a character that keeps unfolding on skin and fabric.
          </p>
          <div className="pt-2">
            <ButtonLink href="/about" variant="ivory" size="lg">
              Read our story
            </ButtonLink>
          </div>
        </div>

        <ul className="grid gap-px bg-ivory/12 sm:grid-cols-2">
          {[
            ['Small batch', 'Bottled in limited runs, never mass produced.'],
            ['Rare naturals', 'Sourced ingredients paired with modern captives.'],
            ['Long maceration', 'Weeks of rest before a single bottle ships.'],
            ['Made in India', 'Composed and filled in New Delhi.'],
          ].map(([title, copy]) => (
            <li key={title} className="bg-ink p-7">
              <h3 className="font-serif text-xl font-light text-ivory">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ivory/60">{copy}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
