'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/products';
import { useValidateCartQuery } from '@/store/api/catalogueApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, setQuantity } from '@/store/slices/cartSlice';
import { closeCart } from '@/store/slices/uiSlice';

/** Long enough to read as a slide, short enough not to feel like a wait. */
const EXIT_MS = 260;

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isCartOpen);
  const { items, isHydrated } = useAppSelector((state) => state.cart);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /**
   * Kept mounted through the exit so the panel can slide out. Unmounting on
   * `isOpen` alone would make it vanish, which reads as a bug rather than a
   * dismissal.
   */
  const [isMounted, setIsMounted] = useState(false);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Paint once at the off-screen position, then transition in. Setting
      // both in the same frame would skip the animation entirely.
      const frame = requestAnimationFrame(() => setIsShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setIsShown(false);
    const timer = window.setTimeout(() => setIsMounted(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // The API re-prices every line and clamps to live stock, so the browser's
  // copy of the bag can never drive the totals. Only asked while open.
  const { data, isFetching, isLoading } = useValidateCartQuery(items, {
    skip: !isHydrated || !isMounted || items.length === 0,
  });
  const cart = data?.data;

  // Server clamped a quantity (stock dropped) — mirror it back into the store
  // so the badge and the drawer agree.
  useEffect(() => {
    cart?.lines.forEach((line) => {
      if (line.adjusted && line.available && line.quantity !== line.requestedQuantity) {
        dispatch(setQuantity({ slug: line.slug, quantity: line.quantity }));
      }
    });
  }, [cart, dispatch]);

  // Escape closes, and the page behind must not scroll under the panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(closeCart());
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, dispatch]);

  // Focus moves into the panel, so a keyboard user is not left behind on the
  // page they cannot see.
  useEffect(() => {
    if (isShown) closeRef.current?.focus();
  }, [isShown]);

  if (!isMounted) return null;

  const lines = cart?.lines ?? [];
  const amounts = cart?.amounts;
  const unavailable = lines.filter((line) => !line.available);
  const threshold = cart?.freeShippingThreshold ?? 999;
  const toFree = cart?.amountToFreeShipping ?? threshold;
  const progress = Math.min(100, ((amounts?.subtotal ?? 0) / threshold) * 100);
  const itemCount = cart?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const isEmpty = items.length === 0;
  // Checkout is never gated on order value: under the free-shipping threshold
  // the bag simply carries the shipping fee.
  const canCheckout = !isFetching && unavailable.length === 0 && itemCount > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your bag"
      className="fixed inset-0 z-[96] flex justify-end"
    >
      <button
        type="button"
        aria-label="Close bag"
        onClick={() => dispatch(closeCart())}
        className={`absolute inset-0 bg-ink/55 transition-opacity duration-[260ms] ${
          isShown ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        className={[
          'relative z-10 flex h-full w-full flex-col bg-ivory shadow-2xl',
          // Full width at 360, a panel from `sm` up.
          'sm:max-w-[26rem]',
          'transition-transform duration-[260ms] ease-out motion-reduce:transition-none',
          isShown ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
          <h2 className="font-serif text-xl font-medium text-ink">
            Your bag{itemCount > 0 && <span className="text-ink-muted"> ({itemCount})</span>}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={() => dispatch(closeCart())}
            aria-label="Close bag"
            className="-mr-1 p-2 text-ink-muted transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m5 5 10 10M15 5 5 15" />
            </svg>
          </button>
        </header>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="font-serif text-2xl font-medium text-ink">Nothing in the bag yet</p>
            <p className="text-sm leading-relaxed text-ink-muted">
              Two extraits, each matured for weeks before bottling.
            </p>
            <Link
              href="/shop"
              onClick={() => dispatch(closeCart())}
              className="mt-2 rounded-xl border border-olive bg-olive px-8 py-3.5 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive"
            >
              Shop the collection
            </Link>
          </div>
        ) : (
          <>
            {/* Free shipping progress. Shown above the lines because it is the
                reason someone might add one more. */}
            <div className="border-b border-line px-5 py-4 sm:px-6">
              {toFree > 0 ? (
                <p className="text-xs text-ink-muted">
                  Add <span className="text-ink">{formatPrice(toFree)}</span> more for
                  complimentary shipping
                </p>
              ) : (
                <p className="text-xs text-olive">Complimentary shipping applied</p>
              )}
              <span className="mt-2.5 block h-1 w-full overflow-hidden rounded-full bg-line/60">
                <span
                  className="block h-full rounded-full bg-olive transition-[width] duration-500 ease-out motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </span>
            </div>

            <ul className="flex-1 overflow-y-auto px-5 sm:px-6">
              {isLoading
                ? Array.from({ length: Math.min(items.length, 3) }).map((_, index) => (
                    <li key={index} className="flex gap-4 border-b border-line py-5">
                      <Skeleton className="h-24 w-20 shrink-0" />
                      <div className="flex flex-1 flex-col gap-2.5">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="mt-2 h-9 w-28" />
                      </div>
                    </li>
                  ))
                : lines.map((line) => (
                    <li key={line.slug} className="flex gap-4 border-b border-line py-5">
                      <Link
                        href={`/products/${line.slug}`}
                        onClick={() => dispatch(closeCart())}
                        className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)] rounded-2xl"
                      >
                        {line.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={line.image}
                            alt={line.name ?? line.slug}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="px-1 text-center font-serif text-sm lowercase text-olive">
                            {line.name ?? line.slug}
                          </span>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            href={`/products/${line.slug}`}
                            onClick={() => dispatch(closeCart())}
                            className="font-serif text-base leading-tight text-ink hover:text-olive"
                          >
                            {line.name ?? line.slug}
                          </Link>
                          <span className="shrink-0 text-sm text-ink">
                            {formatPrice(line.subtotal ?? 0)}
                          </span>
                        </div>

                        {line.sizeMl && (
                          <p className="text-xs text-ink-muted">{line.sizeMl} ML</p>
                        )}

                        {line.reason && (
                          <p className={`text-xs ${line.available ? 'text-bronze' : 'text-espresso'}`}>
                            {line.reason}
                          </p>
                        )}

                        <div className="mt-1.5 flex items-center justify-between gap-3">
                          {line.available ? (
                            <div className="flex items-center rounded-lg border border-line">
                              <button
                                type="button"
                                aria-label={`Decrease quantity of ${line.name ?? line.slug}`}
                                onClick={() =>
                                  dispatch(
                                    setQuantity({ slug: line.slug, quantity: line.quantity - 1 }),
                                  )
                                }
                                className="px-3 py-1.5 text-ink transition-colors hover:text-olive"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-sm tabular-nums">
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                aria-label={`Increase quantity of ${line.name ?? line.slug}`}
                                disabled={
                                  line.quantity >=
                                  Math.min(line.stock ?? 0, cart?.maxQuantityPerLine ?? 5)
                                }
                                onClick={() =>
                                  dispatch(
                                    setQuantity({ slug: line.slug, quantity: line.quantity + 1 }),
                                  )
                                }
                                className="px-3 py-1.5 text-ink transition-colors hover:text-olive disabled:opacity-30"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="rounded border border-espresso/40 px-2.5 py-1.5 text-[10px] tracking-[0.14em] text-espresso uppercase">
                              Unavailable
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => dispatch(removeItem(line.slug))}
                            className="link-underline text-xs text-espresso"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
            </ul>

            <footer className="border-t border-line px-5 py-5 sm:px-6">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Subtotal</dt>
                  <dd className="text-ink tabular-nums">{formatPrice(amounts?.subtotal ?? 0)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Shipping</dt>
                  <dd className="text-ink tabular-nums">
                    {amounts?.shipping === 0
                      ? 'Complimentary'
                      : formatPrice(amounts?.shipping ?? 0)}
                  </dd>
                </div>
                <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
                  <dt className="text-ink">Total</dt>
                  <dd className="price text-2xl font-bold text-ink">
                    {formatPrice(amounts?.total ?? 0)}
                  </dd>
                </div>
              </dl>

              {unavailable.length > 0 && (
                <p className="mt-4 border-l-2 border-espresso bg-espresso/5 px-3 py-2.5 text-xs text-espresso">
                  Remove the unavailable {unavailable.length === 1 ? 'item' : 'items'} to continue.
                </p>
              )}

              {canCheckout ? (
                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCart())}
                  className="mt-4 block rounded-xl border border-olive bg-olive px-8 py-4 text-center text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive"
                >
                  Checkout
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-4 block cursor-not-allowed rounded-xl bg-ink px-8 py-4 text-center text-xs tracking-[0.16em] text-ivory uppercase opacity-40"
                >
                  Checkout
                </span>
              )}

              <p className="mt-3 text-center text-[11px] text-ink-muted">
                Inclusive of all taxes. Cash on delivery available.
              </p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
