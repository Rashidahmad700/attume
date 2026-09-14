'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Shown when a signed-out visitor tries to save or buy. Both actions belong to
 * an account, so the prompt offers the two ways in rather than failing quietly.
 */
export function AuthPrompt({
  action,
  onClose,
}: {
  action: 'wishlist' | 'cart';
  onClose: () => void;
}) {
  const pathname = usePathname();
  const redirect = encodeURIComponent(pathname || '/');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const copy =
    action === 'wishlist'
      ? {
          title: 'Save it to your wishlist',
          body: 'Your wishlist lives on your account, so it is waiting on every device you sign in from.',
        }
      : {
          title: 'Sign in to add to your bag',
          body: 'We keep your bag and addresses on your account, so checkout is a single step next time.',
        };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div onClick={onClose} aria-hidden="true" className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.title}
        className="relative w-full max-w-md rounded-2xl bg-ivory-soft p-8 shadow-[0_30px_80px_-20px_rgba(23,22,19,0.55)]"
      >
        <span className="eyebrow text-bronze">attume</span>
        <h2 className="mt-3 font-serif text-2xl font-medium text-ink">{copy.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{copy.body}</p>

        <div className="mt-7 flex flex-col gap-3">
          <Link
            href={`/login?redirect=${redirect}`}
            className="rounded-xl bg-ink px-6 py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
          >
            Sign in
          </Link>
          <Link
            href={`/signup?redirect=${redirect}`}
            className="rounded-xl border border-line px-6 py-3.5 text-center text-[11px] font-semibold tracking-[0.16em] text-ink uppercase transition-colors hover:border-olive hover:bg-olive hover:text-ivory"
          >
            Create an account
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase transition-colors hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
