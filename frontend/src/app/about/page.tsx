import type { Metadata } from 'next';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

/** The same photograph the homepage opens its story with — one house, one
 *  picture of it, rather than a different room on every page. */
const houseImage = '/story/atelier.jpg';

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: 'The house',
  description:
    'attume is an independent Indian fragrance house making extrait de parfum in small batches.',
};

const chapters = [
  {
    heading: 'Where it began',
    body: [
      'Some fragrances remind you of a place. Others bring someone back.',
      'attume was born from that feeling — the warmth of evening light, fresh air through an open window, wood warmed by the sun, a trace of fragrance left behind after someone has gone.',
    ],
  },
  {
    heading: 'What we wanted',
    body: [
      'We wanted to bottle those moments, not simply create something that smells good.',
      'So we began slowly. Two compositions, crafted at 30%+ concentration and matured for weeks until every note found its place.',
    ],
  },
  {
    heading: 'How it is made',
    body: [
      'Made in small batches in New Delhi, with patience at every step, and crafted with one of India\u2019s top perfumers.',
      'Small runs mean a fragrance occasionally sells out before the next batch has finished resting. We would rather that than ship something before it is ready.',
    ],
  },
  {
    heading: 'Why it matters',
    body: [
      'Because the best fragrances don\u2019t announce themselves. They become memories.',
      'Where we mention another house, it is to describe a family of scent — attume is independent and unaffiliated.',
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      {/*
        The photograph is the opening, and the words sit on it.

        Anchored to the bottom rather than the side: both perfumers are in the
        upper two thirds, and text running down one edge would cover one of
        them. A scrim rising from the floor of the frame darkens only what the
        type needs, so the faces stay in daylight.
      */}
      <section className="relative isolate flex min-h-[520px] items-end overflow-hidden sm:min-h-[560px] lg:min-h-[660px]">
        <Image
          src={houseImage}
          alt="Two perfumers at a workbench in evening light — one drawing oil with a pipette, the other reading a blotter, among bottles, citrus and orange blossom"
          fill
          sizes="100vw"
          /* 42%, found by eye: high enough that neither head is clipped,
             low enough that the type lands on an arm and the bench rather
             than across someone's face. */
          className="-z-10 object-cover object-[50%_42%]"
          priority
        />

        {/*
          Two passes, not one. The upward wash carries the type; the flat tint
          over everything keeps a bright highlight in the photograph from
          leaving a word stranded on it.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/15" />

        <Container className="pt-24 pb-12 lg:pb-16">
          <span className="eyebrow text-bronze drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
            The House of attume
          </span>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-medium text-ivory drop-shadow-[0_2px_18px_rgba(0,0,0,0.55)] lg:text-6xl">
            The Story Behind attume
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ivory/85 drop-shadow-[0_1px_12px_rgba(0,0,0,0.6)] sm:text-base">
            Some fragrances remind you of a place. Others bring someone back. attume was born from
            that feeling.
          </p>
        </Container>
      </section>

      <Container className="py-16 lg:py-24">
        <div className="grid max-w-4xl gap-12 sm:grid-cols-2">
          {chapters.map((chapter) => (
            <section key={chapter.heading} className="flex flex-col gap-4">
              <h2 className="font-serif text-2xl font-medium text-ink">{chapter.heading}</h2>
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
