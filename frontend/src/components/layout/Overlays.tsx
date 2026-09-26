'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';

/*
 * The panels that sit over every page — menu, search, bag, sign-in. Each is
 * closed on arrival, so none of them belongs in the JavaScript a page needs to
 * become interactive. They load in their own chunks once the browser is idle,
 * or straight away if one is asked for before that.
 */
const MobileNav = dynamic(() => import('./MobileNav').then((m) => m.MobileNav), { ssr: false });
const SearchOverlay = dynamic(
  () => import('@/components/search/SearchOverlay').then((m) => m.SearchOverlay),
  { ssr: false },
);
const CartDrawer = dynamic(() => import('@/components/cart/CartDrawer').then((m) => m.CartDrawer), {
  ssr: false,
});
const AuthDialog = dynamic(() => import('@/components/auth/AuthDialog').then((m) => m.AuthDialog), {
  ssr: false,
});

/**
 * True from the first quiet moment after load, or from the first time `now`
 * holds — and true from then on, so a panel closed early can still animate out.
 */
function useWhenIdle(now: boolean) {
  const [isIdle, setIsIdle] = useState(false);

  if (now && !isIdle) setIsIdle(true);

  useEffect(() => {
    if (isIdle) return;
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setIsIdle(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(handle);
    }
    // Safari has no requestIdleCallback.
    const timer = window.setTimeout(() => setIsIdle(true), 1500);
    return () => window.clearTimeout(timer);
  }, [isIdle]);

  return isIdle;
}

export function Overlays() {
  const isMenuOpen = useAppSelector((state) => state.ui.isMobileNavOpen);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const isCartOpen = useAppSelector((state) => state.ui.isCartOpen);
  const isAuthOpen = useAppSelector((state) => state.ui.authReason !== null);

  const isReady = useWhenIdle(isMenuOpen || isSearchOpen || isCartOpen || isAuthOpen);
  if (!isReady) return null;

  return (
    <>
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <AuthDialog />
    </>
  );
}
