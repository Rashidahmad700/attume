import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'The house',
  description:
    'attume is an independent Indian fragrance house making extrait de parfum in small batches.',
};

const chapters = [
  {
    heading: 'Why we started',
    body: [
      'attume began with a simple frustration — that a fragrance either smelled considered or lasted the day, rarely both, and almost never at a price that made sense.',
      'Most of what fills that gap is either a designer bottle priced for its name, or a cheap impression that evaporates by lunch. We wanted the thing in between: composed properly, built to last, priced honestly.',
    ],
  },
  {
    heading: 'How we make it',
    body: [
      'Every composition carries a 30%+ fragrance load and pairs rare naturals with modern captives.',
      'Each batch is then left to macerate for weeks before a single bottle is filled. That waiting is the part most houses skip, and it is the part that makes the notes arrive together instead of one after another.',
    ],
  },
  {
    heading: 'Where it is made',
    body: [
      'Everything is composed, filled and packed in small batches in New Delhi, by hand.',
      'Small runs mean a fragrance occasionally sells out before the next batch has finished resting. We would rather that than ship something before it is ready.',
    ],
  },
  {
    heading: 'What we will not do',
    body: [
      'We will not claim a fragrance is something it is not. Where we mention another house, it is to describe a family of scent — attume is independent and unaffiliated.',
      'We will not pad the price to pay for a name.',
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink py-20 text-ivory lg:py-28">
        <Container>
          <span className="eyebrow text-bronze">The house</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight font-light lg:text-6xl">
            Composed slowly, worn for hours, remembered for years.
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base">
            An independent fragrance house in New Delhi, making extrait de parfum in batches small
            enough to sell out.
          </p>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <div className="grid max-w-4xl gap-12 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <section key={chapter.heading} className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl font-light text-ink">{chapter.heading}</h2>
              {chapter.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-4">
          <ButtonLink href="/shop" size="lg">
            Shop the collection
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Talk to us
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
