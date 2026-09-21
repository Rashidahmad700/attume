'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { mainNav } from '@/lib/site';
import { useIsPrebook } from '@/store/api/configApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuth, openCart, setSearchOpen, toggleMobileNav } from '@/store/slices/uiSlice';
import { BagIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/icons';
import { useGetWishlistQuery } from '@/store/api/userApi';
import { CART_TARGET_ATTR } from '@/components/cart/FlyToCart';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';

export function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const addedTick = useAppSelector((state) => state.cart.addedTick);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const { data: wishlist } = useGetWishlistQuery(undefined, { skip: !user });
  const isPrebook = useIsPrebook();
  const wishlistCount = wishlist?.data.count ?? 0;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /**
   * Pops the bag on each add. Keyed on the tick rather than the count, so
   * adding a second of something already in the bag still animates — and the
   * first paint does not animate a cart restored from storage.
   */
  useEffect(() => {
    if (addedTick === 0) return;
    setIsBumping(true);
    const timer = window.setTimeout(() => setIsBumping(false), 300);
    return () => window.clearTimeout(timer);
  }, [addedTick]);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          isScrolled ? 'bg-ivory/95 backdrop-blur-sm' : 'bg-ivory',
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-5 py-4 sm:gap-6 sm:px-8 lg:px-12 lg:py-5">
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
                        <span className="border border-line px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-ink-muted uppercase rounded-2xl">
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
          {/* pr-1 leaves room for the bag badge, which is positioned -right-1
              and would otherwise push the row past a 360px viewport. */}
          <div className="flex flex-1 items-center justify-end gap-2.5 pr-1 sm:gap-5">
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
              <>
                {/* At 360px the two words plus the icons overflow the bar, so
                    the pair collapses to a single labelled icon. The drawer
                    still offers both actions by name. */}
                <button
                  type="button"
                  onClick={() => dispatch(openAuth('signin'))}
                  aria-label="Login or sign up"
                  className="p-1 text-ink transition-colors hover:text-olive sm:hidden"
                >
                  <UserIcon className="h-5 w-5" />
                </button>

                <div className="hidden items-center gap-2 text-[0.85rem] font-semibold tracking-[0.11em] uppercase sm:flex">
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
              </>
            )}

            {/* No bag while the shop is pre-booking — there is nothing to
                check out, and an empty bag icon only invites a dead end. */}
            {!isPrebook && (
            <button
              type="button"
              onClick={() => dispatch(openCart())}
              {...{ [CART_TARGET_ATTR]: true }}
              aria-label={cartCount > 0 ? `Bag, ${cartCount} items` : 'Bag, empty'}
              aria-haspopup="dialog"
              className="relative p-1 text-ink transition-colors hover:text-olive"
            >
              {/* The icon itself nudges on each add, so the change registers
                  even when the number is off-screen on a phone. */}
              <BagIcon
                className={`h-5 w-5 transition-transform duration-300 ${
                  isBumping ? 'motion-safe:-translate-y-0.5 motion-safe:scale-110' : ''
                }`}
              />
              {cartCount > 0 && (
                <span
                  className={`absolute -top-0.5 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-olive px-1 text-[10px] leading-none text-ivory tabular-nums transition-transform duration-300 ${
                    isBumping ? 'motion-safe:scale-125' : 'scale-100'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
            )}
          </div>
        </div>
        <div className="hairline" />
      </header>

      <MobileNav />
    </>
  );
}
