import { ButtonLink } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ivory-deep">
      {/* Placeholder editorial ground — swap for the campaign photograph. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_70%_20%,#f9f6ea_0%,#efe9d4_45%,#e2dbc2_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(105deg,transparent_38%,rgba(79,90,32,0.09)_72%,rgba(23,22,19,0.16)_100%)] lg:block"
      />

      <div className="mx-auto flex min-h-[78vh] max-w-[1400px] flex-col justify-center px-5 py-24 sm:px-8 lg:min-h-[86vh] lg:px-12 lg:py-32">
        <div className="max-w-2xl">
          <span className="eyebrow text-olive">Extrait de Parfum · 50 ML</span>

          <h1 className="mt-6 font-serif text-[2.75rem] leading-[1.05] font-light text-ink sm:text-6xl lg:text-7xl">
            <span className="block">Nobody remembers</span>
            <span className="block">what you wore.</span>
            <span className="block text-espresso italic">They remember how you smelled.</span>
          </h1>

          <p className="mt-8 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
            Small-batch extraits built on rare naturals and patient maceration. Composed in India,
            made to last from the first meeting to the last.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/shop" size="lg">
              Shop the collection
            </ButtonLink>
            <ButtonLink href="/discovery-set" variant="outline" size="lg">
              Try the discovery set
            </ButtonLink>
          </div>
        </div>

        <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
          {[
            ['30%+', 'Fragrance load'],
            ['8–10 hrs', 'On fabric'],
            ['Paraben', 'Free'],
            ['Cruelty', 'Free'],
          ].map(([value, label]) => (
            <div key={`${value}-${label}`} className="flex flex-col gap-1">
              <dt className="font-serif text-2xl font-light text-ink">{value}</dt>
              <dd className="eyebrow text-ink-muted">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
