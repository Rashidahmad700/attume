import Image from 'next/image';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full min-h-[calc(100vh-120px)] lg:grid-cols-[0.95fr_1.05fr]">
      {/*
        Product photography rather than a flat dark field. The panel used to be
        ink with an olive wash, which read as the same slab as the footer — two
        dark blocks stacked with the form floating between them.
      */}
      <aside className="relative hidden overflow-hidden bg-ivory-deep lg:block">
        <Image
          src="/products/santalyn/bottle.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 0px"
          className="object-cover"
        />
        {/* An even scrim carries the text, and a second wash weights the
            bottom — the bottle is pale, so a gradient alone left the quote
            sitting on near-white glass. */}
        <div aria-hidden="true" className="absolute inset-0 bg-ink/55" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(23,22,19,0.85)_0%,rgba(23,22,19,0.35)_45%,rgba(23,22,19,0)_80%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-14">
          <span className="font-serif text-2xl lowercase tracking-[0.06em] text-ivory drop-shadow-sm">
            attume
          </span>
          <div className="max-w-sm">
            <p className="font-serif text-3xl leading-snug font-medium text-ivory">
              &ldquo;Years later, nobody remembers what you were wearing. Sometimes, they remember
              how you smelled.&rdquo;
            </p>
            <p className="eyebrow mt-6 text-bronze">Experience the art of scent</p>
          </div>
          <p className="text-xs text-ivory/70">Extrait de Parfum · Made in India</p>
        </div>
      </aside>

      {/* Ivory-soft, a shade off the page, so the form column is distinct from
          both the panel and the footer below it. */}
      <div className="flex items-center justify-center bg-ivory-soft px-5 py-16 sm:px-10 lg:py-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
