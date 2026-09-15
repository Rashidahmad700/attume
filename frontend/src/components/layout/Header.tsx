'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { mainNav } from '@/lib/site';
import { useIsPrebook } from '@/store/api/configApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuth, setSearchOpen, toggleMobileNav } from '@/store/slices/uiSlice';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/icons';
import { useGetWishlistQuery } from '@/store/api/userApi';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';

export function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !user });
  const isPrebook = useIsPrebook();
  const wishlistCount = wishlist?.data.count ?? 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          isScrolled ? 'bg-ivory/95 backdrop-blur-sm' : 'bg-ivory',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12 lg:py-5">
          {/* Left: mobile trigger / desktop nav */}
          <div className="flex flex-1 items-center gap-8">
            <button
              type="button"
              onClick={() => dispatch(toggleMobileNav())}
              aria-label="Open menu"
              className="p-1 text-ink lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>

            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-9">
                {mainNav.map((item) =>
                  item.soon ? (
                    <li key={item.label}>
                      <span className="flex cursor-default items-center gap-2">
                        <span className="text-[0.85rem] font-semibold tracking-[0.11em] text-ink/55 uppercase">
                          {item.label}
                        </span>
                        <span className="border border-line px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-ink-muted uppercase">
                          Soon
                        </span>
                      </span>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          'link-underline text-[0.85rem] font-semibold tracking-[0.11em] uppercase transition-colors hover:text-olive',
                          pathname === item.href ? 'text-olive' : 'text-ink',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          </div>

          <Logo />

          {/* Right: utility actions */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-5">
            <button
              type="button"
              onClick={() => dispatch(setSearchOpen(true))}
              aria-label="Search"
              className="p-1 text-ink transition-colors hover:text-olive"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <Link
              href="/account/wishlist"
              onClick={(event) => {
                if (user) return;
                event.preventDefault();
                dispatch(openAuth('wishlist'));
              }}
              aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} saved` : 'Wishlist'}
              className="relative p-1 text-ink transition-colors hover:text-cherry"
            >
              <HeartIcon className="h-5 w-5" />
              {/* An empty wishlist shows no badge at all — a "0" reads as clutter. */}
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cherry px-1 text-[10px] leading-none text-ivory">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/*
              Named actions rather than an avatar: a person icon says nothing
              about what happens when it is pressed, and someone with no
              account has no reason to read it as a way in. Signed in, the
              name is the label and it leads to the account.
            */}
            {user ? (
              <Link
                href="/account"
                aria-label="Account"
                className="flex items-center gap-2 p-1 text-ink transition-colors hover:text-olive"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden text-[0.85rem] font-semibold tracking-[0.11em] uppercase xl:inline">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-[0.85rem] font-semibold tracking-[0.11em] uppercase">
                <button
                  type="button"
                  onClick={() => dispatch(openAuth('signin'))}
                  className="p-1 text-ink transition-colors hover:text-olive"
                >
                  Login
                </button>
                <span aria-hidden="true" className="text-line">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => dispatch(openAuth('signup'))}
                  className="p-1 text-ink transition-colors hover:text-olive"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* No bag while the shop is pre-booking — there is nothing to
                check out, and an empty bag icon only invites a dead end. */}
            {!isPrebook && (
            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart, empty'}
              className="relative p-1 text-ink transition-colors hover:text-olive"
            >
              <BagIcon className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] leading-none text-ivory">
                  {cartCount}
                </span>
              )}
            </Link>
            )}
          </div>
        </div>
        <div className="hairline" />
      </header>

      <MobileNav />
    </>
  );
}
