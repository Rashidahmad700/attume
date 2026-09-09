'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { mainNav, site } from '@/lib/site';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileNav } from '@/store/slices/uiSlice';
import { useLogoutMutation } from '@/store/api/authApi';
import { CloseIcon, InstagramIcon } from '@/components/ui/icons';
import { Logo } from './Logo';

export function MobileNav() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isOpen = useAppSelector((state) => state.ui.isMobileNavOpen);
  const user = useAppSelector((state) => state.auth.user);
  const [logout] = useLogoutMutation();

  const close = () => dispatch(setMobileNav(false));

  // Close on route change and lock body scroll while open.
  useEffect(() => {
    dispatch(setMobileNav(false));
  }, [pathname, dispatch]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn('fixed inset-0 z-[60] lg:hidden', isOpen ? 'visible' : 'invisible')}
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          'absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-ivory transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <Logo size="sm" />
          <button type="button" onClick={close} aria-label="Close menu" className="p-1 text-ink">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <ul className="flex flex-col gap-6">
            {mainNav.map((item) =>
              item.soon ? (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="flex items-center gap-3 transition-colors hover:text-olive"
                  >
                    <span className="font-serif text-2xl font-light text-ink-muted">
                      {item.label}
                    </span>
                    <span className="border border-line px-2 py-0.5 text-[9px] tracking-[0.12em] text-ink-muted uppercase">
                      Soon
                    </span>
                  </Link>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={close}
                    className="font-serif text-2xl font-light text-ink transition-colors hover:text-olive"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="mt-10 flex flex-col gap-4 border-t border-line pt-8">
            {user ? (
              <>
                <Link href="/account" onClick={close} className="eyebrow text-ink">
                  My Account
                </Link>
                <Link href="/account/orders" onClick={close} className="eyebrow text-ink">
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout().unwrap().catch(() => undefined);
                    close();
                  }}
                  className="eyebrow text-left text-espresso"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="eyebrow text-ink">
                  Sign in
                </Link>
                <Link href="/signup" onClick={close} className="eyebrow text-ink">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="border-t border-line px-6 py-5">
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-ink transition-colors hover:text-olive"
          >
            <InstagramIcon className="h-5 w-5" />
            <span className="eyebrow">@{site.instagramHandle}</span>
          </a>
        </div>
      </aside>
    </div>
  );
}
