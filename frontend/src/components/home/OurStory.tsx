import Image from 'next/image';

/**
 * The house, at work.
 *
 * Full-bleed rather than a framed print: the photograph runs to the edge of
 * the screen and the text sits on a panel beside it, so the section reads as
 * one spread instead of a picture with a caption. On a phone the two stack,
 * because a half-width photograph of two people at a bench shows neither.
 */
const storyImage = '/story/atelier.jpg';

const paragraphs = [
  'Some fragrances remind you of a place. Others bring someone back. attume was born from that feeling — the warmth of evening light, fresh air through an open window, wood warmed by the sun, a trace of fragrance left behind after someone has gone.',
  'We wanted to bottle those moments, not simply create something that smells good. So we began slowly — blending, testing and refining in small batches, with patience at every step, until every note found its place.',
  'Two, because two was what we could get right. atolis is morning — citrus, sea air, the first hour of a day that has not gone wrong yet. Santalyn is the evening that follows — sandalwood, tea and benzoin, warm and unhurried. Wear one, then the other, and you have the whole day.',
  'Extrait means it stays. Most of what you buy is eau de parfum — fifteen, maybe twenty percent. Ours sits above thirty, so it lasts the day and leaves something behind on a scarf a week later.',
];

export function OurStory() {
  return (
    <section className="bg-ivory">
      <div className="grid lg:grid-cols-[1.08fr_1fr] lg:items-stretch">
        {/*
          The photograph's own height on large screens, so the panel beside it
          sets the height and the picture fills whatever that comes to. Below
          lg it keeps a fixed ratio instead — left to itself it would grow to
          the full height of the text.
        */}
        <div className="relative aspect-square w-full sm:aspect-16/10 lg:aspect-auto lg:min-h-[640px]">
          <Image
            src={storyImage}
            alt="Two perfumers at a workbench in evening light — one drawing oil with a pipette, the other reading a blotter, among bottles, citrus and orange blossom"
            fill
            sizes="(min-width: 1024px) 52vw, 100vw"
            /* Pulled up below lg, where the frame is wider than the source is
               tall: centred, the crop takes the tabletop and cuts the faces.
               Beside the text the frame is tall enough not to need it. */
            className="object-cover object-[50%_28%] lg:object-center"
            priority={false}
          />
          {/*
            A wash of the panel's own colour over the meeting edge, so the two
            halves blend rather than butt together. Large screens only — on a
            phone the panel is below, not beside, and a gradient running the
            wrong way would just dim the picture.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 bg-gradient-to-r from-transparent to-ivory lg:block xl:w-56"
          />
        </div>

        <div className="flex flex-col justify-center gap-7 px-5 py-14 sm:px-8 lg:py-20 lg:pr-12 lg:pl-4 xl:pr-20">
          <div className="flex flex-col">
            <span className="font-script text-3xl leading-none text-cherry sm:text-4xl">
              our story
            </span>
            <h2 className="mt-1 font-serif text-4xl leading-[1.05] font-medium text-ink sm:text-5xl lg:text-[3.25rem]">
              the soul behind
              <br className="hidden sm:block" /> the scent
            </h2>
          </div>

          <div className="flex max-w-xl flex-col gap-5">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-ink-soft">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Short rule, not a full divider — it separates the closing line
              without cutting the panel in two. */}
          <hr className="w-24 border-t border-ink/25" />

          <p className="max-w-xl font-serif text-xl leading-snug text-ink sm:text-2xl">
            Because the best fragrances don&rsquo;t announce themselves. They become memories.
          </p>
        </div>
      </div>
    </section>
  );
}
