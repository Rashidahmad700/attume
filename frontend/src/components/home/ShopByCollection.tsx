import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { collections } from '@/lib/site';

/**
 * Circular collection tiles. Entries marked unavailable render as non-clickable
 * "coming soon" cards rather than links to pages that do not exist yet.
 */
export function ShopByCollection() {
  return (
    <section className="bg-ivory py-16 lg:py-20">
      <Container>
        <h2 className="text-center font-serif text-3xl font-light text-ink lg:text-4xl">
          Shop by collection
        </h2>

        <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap items-start justify-center gap-x-12 gap-y-10">
          {collections.map((collection) => {
            const tile = (
              <>
                <span className="relative flex h-32 w-32 items-center justify-center rounded-full border border-line bg-[radial-gradient(110%_110%_at_30%_25%,#fcfaf2_0%,#efe9d4_55%,#e2dbc2_100%)] transition-colors group-hover:border-olive sm:h-36 sm:w-36">
                  <span className="font-serif text-2xl lowercase text-olive">attume</span>
                  {!collection.available && (
                    <span className="absolute -bottom-2 bg-ink px-2.5 py-1 text-[9px] tracking-[0.14em] text-ivory uppercase">
                      Soon
                    </span>
                  )}
                </span>
                <span className="mt-5 block text-sm text-ink">{collection.label}</span>
                <span className="mt-1 block text-xs text-ink-muted">{collection.caption}</span>
              </>
            );

            return (
              <li key={collection.label} className="w-40 text-center">
                {collection.available ? (
                  <Link href={collection.href} className="group block">
                    {tile}
                  </Link>
                ) : (
                  <div className="group block cursor-default opacity-70">{tile}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
