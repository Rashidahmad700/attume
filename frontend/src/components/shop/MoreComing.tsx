/**
 * Two fragrances is a short shelf. This says why that is deliberate and what
 * is being worked on, so a visitor leaves knowing the house has a direction
 * rather than assuming the catalogue is thin.
 */
const inTheWorks = [
  {
    name: 'An oud, kept honest',
    body: 'Real oud, cut with rose and saffron rather than buried under it. The hardest thing we have attempted, and the one we will not rush.',
  },
  {
    name: 'A monsoon accord',
    body: 'Petrichor, wet earth and vetiver — the smell of the first rain hitting dry ground in July. Closer than you would think.',
  },
  {
    name: 'Attar, the old way',
    body: 'Traditional deg-bhapka distillation, in sandalwood oil rather than alcohol. Small quantities, aged properly, sold when ready.',
  },
  {
    name: 'A discovery set',
    body: 'Both current scents in travel sizes, so the choice can be made on skin over a week rather than from a description.',
  },
];

export function MoreComing() {
  return (
    <section className="mt-24 border-t border-line pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow text-bronze">Still in the lab</span>
        <h2 className="mt-4 font-serif text-3xl font-medium text-ink lg:text-4xl">
          Two today. More when they are right.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-ink-muted">
          We release a fragrance when it stops changing in the bottle, not when a calendar says
          so. Each one is matured for weeks and made in batches small enough to throw away if it
          is not what we promised. Here is what is on the bench.
        </p>
      </div>

      <dl className="mx-auto mt-14 grid max-w-4xl gap-10 sm:grid-cols-2">
        {inTheWorks.map((item) => (
          <div key={item.name} className="flex flex-col gap-2">
            <dt className="font-serif text-xl font-medium text-ink">{item.name}</dt>
            <dd className="text-sm leading-relaxed text-ink-muted">{item.body}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-14 text-center text-sm text-ink-muted">
        Want to hear first? Pre-book either fragrance — we write to that list before a batch goes
        live, not after it sells out.
      </p>
    </section>
  );
}
