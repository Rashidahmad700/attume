import fs from 'node:fs';
import path from 'node:path';
import { ButtonLink } from '@/components/ui/Button';

const VIDEO_PATH = 'hero/hero.mp4';
const POSTER_PATH = 'hero/hero-poster.jpg';

/** Present only once the files are dropped into /public/hero — see its README. */
const hasFile = (relative: string) =>
  fs.existsSync(path.join(process.cwd(), 'public', relative));

/**
 * Copy on the left, media on the right. The media panel plays the brand film
 * when one is available and otherwise falls back to a typeset bottle card, so
 * the layout never collapses while photography is pending.
 */
export function Hero() {
  const hasVideo = hasFile(VIDEO_PATH);
  const hasPoster = hasFile(POSTER_PATH);

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_75%_25%,rgba(79,90,32,0.42)_0%,rgba(23,22,19,0.96)_62%,#0f0e0c_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:repeating-linear-gradient(115deg,#f7f3e3_0px,#f7f3e3_1px,transparent_1px,transparent_22px)]"
      />

      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 py-20 sm:px-8 lg:min-h-[86vh] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:py-24">
        <div className="max-w-xl">
          <span className="eyebrow text-bronze">Extrait de Parfum · 50 ML</span>

          <h1 className="mt-7 font-serif text-[2.6rem] leading-[1.05] font-light text-ivory sm:text-5xl lg:text-6xl">
            <span className="block">Nobody remembers</span>
            <span className="block">what you wore.</span>
            <span className="block text-bronze italic">They remember how you smelled.</span>
          </h1>

          <p className="mt-7 max-w-lg text-sm leading-relaxed text-ivory/70 sm:text-base">
            Two compositions, built on a 30%+ fragrance load and matured for weeks before bottling.
            Made in small batches in New Delhi.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/shop" variant="ivory" size="lg">
              Shop the collection
            </ButtonLink>
            <ButtonLink
              href="/products/atolis"
              size="lg"
              variant="ghost"
              className="border border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory hover:text-ink"
            >
              Meet atolis
            </ButtonLink>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-ivory/10 sm:aspect-[16/10] lg:aspect-[4/5] lg:h-full lg:max-h-[38rem]">
          {hasVideo ? (
            <video
              // Muted + playsInline is what lets it autoplay on iOS at all.
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={hasPoster ? `/${POSTER_PATH}` : undefined}
              className="h-full w-full object-cover"
            >
              <source src={`/${VIDEO_PATH}`} type="video/mp4" />
            </video>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgba(247,243,227,0.10)_0%,rgba(23,22,19,0.9)_70%)]">
              <div className="flex h-[68%] w-[52%] flex-col items-center justify-center gap-4 border border-ivory/15">
                <span className="eyebrow text-ivory/50">attume</span>
                <span className="font-serif text-4xl lowercase text-bronze">atolis</span>
                <span className="eyebrow text-ivory/50">Extrait de Parfum</span>
                <span className="eyebrow text-ivory/40">50 ML</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
