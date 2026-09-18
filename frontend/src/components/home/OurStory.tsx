import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Styled photography, not a social crop — the frame is a print on a card, so a
 * square or portrait shot sits in it without cropping.
 */
const storyImage = '/story/terrace.jpg';

const paragraphs = [
  'Some fragrances remind you of a place. Others bring someone back. attume was born from that feeling — the warmth of evening light, fresh air through an open window, wood warmed by the sun, a trace of fragrance left behind after someone has gone.',
  'We wanted to bottle those moments, not simply create something that smells good. So we began slowly. Two compositions, crafted at 30%+ concentration and matured for weeks until every note found its place. Made in small batches in New Delhi, with patience at every step.',
  'Two, because two was what we could get right. atolis is morning — citrus, sea air, the first hour of a day that has not gone wrong yet. Santalyn is the evening that follows — sandalwood, tea and benzoin, warm and unhurried. Wear one, then the other, and you have the whole day.',
  'Extrait means it stays. Most of what you buy is eau de parfum — fifteen, maybe twenty percent. Ours sits above thirty, so it lasts the day and leaves something behind on a scarf a week later.',
];

export function OurStory() {
  return (
    <section className="bg-ivory-soft py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:px-12">
        {/*
          A print rather than a bleed: the photograph sits on a white card,
          tilted slightly, the way a picture ends up on a desk. It reads as
          something kept rather than something art-directed.
        */}
        <figure className="mx-auto w-full -rotate-2 bg-ivory p-4 shadow-[0_18px_50px_-20px_rgba(23,22,19,0.45)] sm:p-5 lg:max-w-none">
          {/* The photograph's own ratio, so the handwritten note at its left
              edge is not cropped away. */}
          <div className="relative aspect-1349/1166 w-full overflow-hidden">
            <Image
              src={storyImage}
              alt="A bottle of atolis on a travertine slab in evening light, beside orange blossom and a handwritten note"
              fill
              sizes="(min-width: 1024px) 56vw, 92vw"
              className="object-cover"
            />
          </div>
        </figure>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <span className="font-script text-3xl leading-none text-cherry sm:text-4xl">
              our story
            </span>
            <h2 className="mt-1 font-serif text-4xl leading-[1.05] font-medium text-ink sm:text-5xl lg:text-6xl">
              the soul behind the scent
            </h2>
          </div>

          <div className="flex max-w-xl flex-col gap-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>

          <p className="max-w-xl font-serif text-xl leading-snug text-ink">
            Because the best fragrances don&rsquo;t announce themselves. They become memories.
          </p>

          <p className="text-sm text-ink-muted">— the attume house, New Delhi</p>

          <div className="pt-2">
            <ButtonLink href="/shop" size="lg">
              Shop the collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
