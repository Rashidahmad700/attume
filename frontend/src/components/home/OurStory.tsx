import { ButtonLink } from '@/components/ui/Button';

/**
 * Image beside text, the image running to the section edge on desktop.
 * Swap `storyImage` for real studio photography when it exists — the frame
 * is portrait, so a 4:5 or taller shot fits without cropping the subject.
 */
const storyImage = '/instagram/Da8ULZFgVQJ.jpg';

const paragraphs = [
  'attume began with a simple frustration — that a fragrance either smelled considered or lasted the day, rarely both, and almost never at a price that made sense.',
  'So we build ours the slow way. Each composition carries a 30%+ fragrance load, pairs rare naturals with modern captives, and is left to macerate for weeks before a single bottle is filled. That waiting is the part most houses skip; it is also the part that makes the notes arrive together instead of one after another.',
  'Everything is made in small batches in New Delhi, bottled by hand, and sold without the markup that usually pays for a name rather than what is inside it.',
  'Two fragrances today. Both built to be worn from a morning meeting into an evening, and to be remembered after you have left the room.',
];

export function OurStory() {
  return (
    <section className="bg-ivory-soft">
      {/* Full-bleed: the image runs to the viewport edge rather than stopping
          at the container gutter, and the copy keeps a comfortable measure. */}
      <div className="grid w-full items-stretch lg:grid-cols-2">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/11] lg:aspect-auto lg:min-h-[40rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storyImage}
            alt="attume fragrance styled on a sunlit terrace"
            loading="lazy"
            // Placeholder is a social graphic with type down its left edge;
            // the crop favours the photographic side until real studio
            // photography replaces it.
            className="absolute inset-0 h-full w-full object-cover [object-position:78%_50%]"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 px-5 py-16 sm:px-10 lg:py-24 lg:pr-8 lg:pl-14 xl:pl-20">
          <div className="flex max-w-xl flex-col gap-6">
            <span className="eyebrow text-bronze">The house</span>
            <h2 className="font-serif text-3xl leading-tight font-light text-ink sm:text-4xl lg:text-5xl">
              The story behind attume
            </h2>

            <div className="flex flex-col gap-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="font-serif text-xl leading-snug font-light text-ink">
              Considered composition. Honest pricing. Made to last the day.
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
