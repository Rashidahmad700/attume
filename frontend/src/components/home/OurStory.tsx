import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Image beside text, the image running to the section edge on desktop.
 * Swap `storyImage` for real studio photography when it exists — the frame
 * is portrait, so a 4:5 or taller shot fits without cropping the subject.
 */
const storyImage = '/instagram/Da8ULZFgVQJ.jpg';

const paragraphs = [
  'Some fragrances remind you of a place. Others bring someone back.',
  'attume was born from that feeling — the warmth of evening light, fresh air through an open window, wood warmed by the sun, a trace of fragrance left behind after someone has gone.',
  'We wanted to bottle those moments, not simply create something that smells good.',
  'So we began slowly. Two compositions, crafted at 30%+ concentration and matured for weeks until every note found its place. Made in small batches in New Delhi, with patience at every step.',
  'Two, because two was what we could get right. atolis is morning — citrus, sea air, the first hour of a day that has not gone wrong yet. Santalyn is the evening that follows — sandalwood, tea and benzoin, warm and unhurried. Wear one, then the other, and you have the whole day.',
  'We work with one of India\u2019s finest perfumers, and we do not rush him. A composition is finished when it stops changing, not when the calendar says so. Nothing is blended to a price, and nothing ships until it smells the way it did in the room where we approved it.',
  'Extrait means it stays. Most of what you buy is eau de parfum \u2014 fifteen, maybe twenty percent. Ours sits above thirty, so it lasts the day and leaves something behind on a scarf a week later.',
];

export function OurStory() {
  return (
    <section className="bg-ivory-soft">
      {/* Full-bleed: the image runs to the viewport edge rather than stopping
          at the container gutter, and the copy keeps a comfortable measure. */}
      <div className="grid w-full items-stretch lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:min-h-[40rem]">
          <Image
            src={storyImage}
            alt="attume fragrance styled on a sunlit terrace"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            // Placeholder is a social graphic with type down its left edge;
            // the crop favours the photographic side until real studio
            // photography replaces it.
            // Scaled into the photographed corner so none of the campaign
            // type on the source graphic is in frame.
            className="origin-[88%_58%] scale-[1.9] object-cover"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 px-5 py-16 sm:px-10 lg:py-24 lg:pr-8 lg:pl-14 xl:pl-20">
          <div className="flex max-w-xl flex-col gap-6">
            <span className="eyebrow text-bronze">The House of attume</span>
            <h2 className="font-serif text-3xl leading-tight font-medium text-ink sm:text-4xl lg:text-5xl">
              The Story Behind attume
            </h2>

            <div className="flex flex-col gap-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="font-serif text-xl leading-snug font-normal text-ink">
              Because the best fragrances don&rsquo;t announce themselves. They become memories.
            </p>

            <div className="pt-2">
              <ButtonLink href="/shop" size="lg">
                Shop the collection
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
