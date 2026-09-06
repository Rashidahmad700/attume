import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid w-full min-h-[calc(100vh-120px)] lg:grid-cols-2">
      {/* Editorial panel — hidden on small screens to keep forms above the fold. */}
      <aside className="relative hidden overflow-hidden bg-ink lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(100%_80%_at_30%_20%,rgba(79,90,32,0.35)_0%,rgba(23,22,19,1)_70%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-14">
          <span className="font-serif text-2xl lowercase tracking-[0.06em] text-ivory">attume</span>
          <div className="max-w-sm">
            <p className="font-serif text-3xl leading-snug font-light text-ivory">
              “Years later, nobody remembers what you were wearing. Sometimes, they remember how you
              smelled.”
            </p>
            <p className="eyebrow mt-6 text-bronze">Experience the art of scent</p>
          </div>
          <p className="text-xs text-ivory/40">Extrait de Parfum · Made in India</p>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-16 sm:px-10 lg:py-24">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
