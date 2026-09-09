import { ButtonLink } from '@/components/ui/Button';

/**
 * Full-bleed editorial opener. The dark ground stands in for campaign
 * photography — drop an <img> behind the overlay when shots are ready.
 */
export function Hero() {
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

      <div className="mx-auto flex min-h-[82vh] max-w-[1400px] flex-col justify-center px-5 py-24 sm:px-8 lg:min-h-[88vh] lg:px-12">
        <div className="max-w-2xl">
          <span className="eyebrow text-bronze">Extrait de Parfum · 50 ML</span>

          <h1 className="mt-7 font-serif text-[2.9rem] leading-[1.03] font-light text-ivory sm:text-6xl lg:text-7xl">
            <span className="block">Nobody remembers</span>
            <span className="block">what you wore.</span>
            <span className="block text-bronze italic">They remember how you smelled.</span>
          </h1>

          <p className="mt-8 max-w-lg text-sm leading-relaxed text-ivory/70 sm:text-base">
            Two compositions, built on a 30%+ fragrance load and matured for weeks before bottling.
            Made in small batches in New Delhi.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/shop" variant="ivory" size="lg">
              Shop the collection
            </ButtonLink>
            <ButtonLink
              href="/products/atolis"
              size="lg"
              className="border border-ivory/30 text-ivory hover:border-ivory hover:bg-ivory hover:text-ink"
              variant="ghost"
            >
              Meet atolis
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
