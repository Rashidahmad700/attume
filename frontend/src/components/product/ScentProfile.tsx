import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { accordSwatch, noteSlug, noteSwatch } from '@/lib/scentColours';
import type { Product } from '@/types';

/** Uses /public/notes/<slug>.(jpg|png|webp) when the file exists. */
function noteImage(note: string): string | undefined {
  const slug = noteSlug(note);
  for (const extension of ['jpg', 'png', 'webp']) {
    const relative = `notes/${slug}.${extension}`;
    if (fs.existsSync(path.join(process.cwd(), 'public', relative))) return `/${relative}`;
  }
  return undefined;
}

function AccordBars({ accords }: { accords: Product['accords'] }) {
  if (accords.length === 0) return null;
  const strongest = Math.max(...accords.map((accord) => accord.strength));

  return (
    <section>
      <h2 className="eyebrow mb-6 text-bronze">Main accords</h2>
      <ul className="flex flex-col gap-1.5">
        {[...accords]
          .sort((a, b) => b.strength - a.strength)
          .map((accord) => {
            const swatch = accordSwatch(accord.name);
            // Relative to the strongest accord, floored so the last bar still
            // has room for its label.
            const width = Math.max(32, Math.round((accord.strength / strongest) * 100));

            return (
              <li key={accord.name}>
                <div
                  className="flex items-center justify-center rounded-sm px-4 py-2.5 transition-[width] duration-500"
                  style={{ width: `${width}%`, backgroundColor: swatch.bg, color: swatch.text }}
                >
                  <span className="text-[13px] font-medium lowercase">{accord.name}</span>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}

function NoteRow({ label, notes }: { label: string; notes: string[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <h3 className="eyebrow whitespace-nowrap text-ink-muted">{label}</h3>
        <span className="h-px flex-1 bg-line" />
      </div>

      <ul className="flex flex-wrap items-start justify-center gap-x-8 gap-y-6">
        {notes.map((note) => {
          const image = noteImage(note);
          return (
            <li key={note} className="flex w-24 flex-col items-center gap-2.5 text-center">
              <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-line bg-ivory-soft">
                {image ? (
                  <Image src={image} alt={note} fill sizes="80px" className="object-cover" />
                ) : (
                  // Drawn stand-in: a tinted disc in the note's family colour.
                  <span
                    className="h-11 w-11 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 32% 28%, #ffffffaa 0%, ${noteSwatch(
                        note,
                      )} 70%)`,
                    }}
                  />
                )}
              </span>
              <span className="text-xs leading-snug text-ink">{note}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Accord bars, the note pyramid, and when the fragrance suits best. */
export function ScentProfile({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <AccordBars accords={product.accords} />

        <div className="flex flex-col gap-8">
          <h2 className="eyebrow text-bronze">The pyramid</h2>
          <div className="flex flex-col gap-9">
            <NoteRow label="Top notes" notes={product.notes.top} />
            <NoteRow label="Heart notes" notes={product.notes.middle} />
            <NoteRow label="Base notes" notes={product.notes.base} />
          </div>
        </div>
      </section>

      <section className="grid gap-10 border-t border-line pt-12 lg:grid-cols-2 lg:gap-16">
        {(product.wear.seasons.length > 0 || product.wear.times.length > 0) && (
          <div className="flex flex-col gap-4">
            <h2 className="eyebrow text-bronze">Wear it</h2>
            <div className="flex flex-wrap gap-2">
              {[...product.wear.seasons, ...product.wear.times].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-4 py-2 text-xs text-ink-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.inspiredBy?.name && (
          <div className="rounded-xl border border-line bg-ivory-soft p-6">
            <h3 className="eyebrow text-bronze">If you know it by</h3>
            <p className="mt-3 font-serif text-2xl font-light text-ink">
              {product.inspiredBy.name}
              <span className="text-ink-muted"> — {product.inspiredBy.house}</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {product.inspiredBy.closeness ? `${product.inspiredBy.closeness}. ` : ''}
              attume is an independent house; this is a comparison of character, not a copy or an
              affiliation.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
