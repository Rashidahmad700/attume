import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { ButtonLink } from '@/components/ui/Button';

const VIDEO_PATH = 'hero/hero.mp4';
const POSTER_PATH = 'hero/hero-poster.jpg';

/**
 * Stand-in until studio photography exists. The source is a square social
 * graphic with type down its left edge, so the frame is scaled and pushed
 * right to keep only the photograph in shot. A real landscape hero image can
 * drop the transform entirely.
 */
const FALLBACK_IMAGE = '/instagram/Da8ULZFgVQJ.jpg';

/** Present only once the files are dropped into /public/hero — see its README. */
const hasFile = (relative: string) =>
  fs.existsSync(path.join(process.cwd(), 'public', relative));

/** Full-bleed image with the headline set over it. */
export function Hero() {
  const hasVideo = hasFile(VIDEO_PATH);
  const hasPoster = hasFile(POSTER_PATH);

  return (
    <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden bg-ink lg:min-h-[86vh]">
      {hasVideo ? (
        <video
          // Muted + playsInline is what lets it autoplay on iOS at all.
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={hasPoster ? `/${POSTER_PATH}` : undefined}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        >
          <source src={`/${VIDEO_PATH}`} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={FALLBACK_IMAGE}
          alt="A sunlit terrace at golden hour"
          fill
          // Above the fold on every visit, so it must not lazy-load.
          priority
          sizes="100vw"
          className="-z-20 origin-[88%_55%] scale-[1.55] object-cover"
        />
      )}

      {/* Scrim: heavy on the left where the type sits, clearing to the right so
          the photograph still reads. */}
      <div
        aria-hidden="true"
        // Narrow screens put the headline over the bright sky, so the scrim
        // stays heavy across the full width there and only clears on desktop.
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/90 via-ink/78 to-ink/60 lg:via-ink/60 lg:to-ink/20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-transparent to-ink/25"
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-[2.6rem] leading-[1.05] font-light text-ivory sm:text-5xl lg:text-6xl">
            <span className="block">Nobody remembers</span>
            <span className="block">what you wore.</span>
            <span className="block text-bronze italic">They remember how you smelled.</span>
          </h1>

          <p className="mt-8 max-w-lg text-sm leading-relaxed text-ivory/80 sm:text-base">
            Two compositions, built on a 30%+ fragrance load and matured for weeks before bottling.
            Made in small batches in New Delhi.
          </p>

          <div className="mt-10">
            <ButtonLink href="/shop" variant="ivory" size="lg">
              Shop the collection
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
