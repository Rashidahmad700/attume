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
      <section className="bg-ink py-20 text-ivory lg:py-28">
        <Container>
          <span className="eyebrow text-bronze">The House of attume</span>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight font-medium lg:text-6xl">
            The Story Behind attume
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base">
            Some fragrances remind you of a place. Others bring someone back. attume was born from
            that feeling.
          </p>
        </Container>
      </section>

      {/*
        Sits directly under the dark opening, so the page moves from a
        statement to the people who make it before any prose begins. Its own
        ratio rather than a fixed height: cropping two people at a bench to a
        letterbox loses the thing worth showing.
      */}
      <figure className="relative aspect-4/3 w-full sm:aspect-3/2 lg:aspect-16/9">
        <Image
          src={houseImage}
          alt="Two perfumers at a workbench in evening light — one drawing oil with a pipette, the other reading a blotter, among bottles, citrus and orange blossom"
          fill
          sizes="100vw"
          // The source is taller than any band it sits in, so the crop is
          // pulled up: centred, it takes the tabletop and cuts the faces.
          className="object-cover object-[50%_28%]"
          priority
        />
      </figure>

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
