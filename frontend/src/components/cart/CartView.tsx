'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Container } from '@/components/ui/Container';
import { formatPrice } from '@/lib/products';
import { useValidateCartQuery } from '@/store/api/catalogueApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeItem, setQuantity } from '@/store/slices/cartSlice';

export function CartView() {
  const dispatch = useAppDispatch();
  const { items, isHydrated } = useAppSelector((state) => state.cart);

  // The API re-prices every line and clamps quantities to live stock, so the
  // browser's copy of the cart can never drive the totals.
  const { data, isFetching } = useValidateCartQuery(items, { skip: !isHydrated });
  const cart = data?.data;

  // Server clamped a quantity (stock dropped) — mirror it back into the store.
  useEffect(() => {
    cart?.lines.forEach((line) => {
      if (line.adjusted && line.available && line.quantity !== line.requestedQuantity) {
        dispatch(setQuantity({ slug: line.slug, quantity: line.quantity }));
      }
    });
  }, [cart, dispatch]);

  if (!isHydrated) {
    return (
      <Container className="py-24">
        <p className="eyebrow text-ink-muted">Loading your bag…</p>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-6 py-28 text-center">
        <span className="eyebrow text-bronze">Your bag</span>
        <h1 className="font-serif text-4xl font-light text-ink">Nothing in the bag yet</h1>
        <p className="max-w-md text-sm leading-relaxed text-ink-muted">
          Four extraits, each matured for weeks before bottling. Start with the collection.
        </p>
        <Link
          href="/shop"
          className="mt-2 bg-ink px-9 py-4 text-xs tracking-[0.16em] text-ivory uppercase hover:bg-olive"
        >
          Shop the collection
        </Link>
      </Container>
    );
  }

  const lines = cart?.lines ?? [];
  const amounts = cart?.amounts;
  const unavailable = lines.filter((line) => !line.available);
  const progress = cart
    ? Math.min(100, ((amounts?.subtotal ?? 0) / cart.freeShippingThreshold) * 100)
    : 0;

  return (
    <Container className="py-14 lg:py-20">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Your bag</span>
          <h1 className="mt-3 font-serif text-4xl font-light text-ink lg:text-5xl">
            {cart?.itemCount ?? 0} {(cart?.itemCount ?? 0) === 1 ? 'item' : 'items'}
          </h1>
        </div>
        <Link href="/shop" className="link-underline eyebrow text-ink">
          Continue shopping
        </Link>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <ul className="flex flex-col">
          {lines.map((line) => (
            <li
              key={line.slug}
              className="flex flex-col gap-5 border-b border-line py-7 first:pt-0 sm:flex-row sm:gap-7"
            >
              <Link
                href={`/products/${line.slug}`}
                className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]"
              >
                {line.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={line.image}
                    alt={line.name ?? line.slug}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-lg lowercase text-olive">
                    {line.name ?? line.slug}
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-light text-ink">
                      <Link href={`/products/${line.slug}`}>{line.name ?? line.slug}</Link>
                    </h2>
                    {line.concentration && (
                      <p className="mt-1 text-xs text-ink-muted">
                        {line.concentration} · {line.sizeMl} ML
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ink">{formatPrice(line.subtotal ?? 0)}</p>
                    {line.price && line.quantity > 1 && (
                      <p className="text-xs text-ink-muted">{formatPrice(line.price)} each</p>
                    )}
                  </div>
                </div>

                {line.reason && (
                  <p
                    className={
                      line.available ? 'text-xs text-bronze' : 'text-xs text-espresso'
                    }
                  >
                    {line.reason}
                  </p>
                )}

                <div className="mt-1 flex flex-wrap items-center gap-5">
                  {line.available ? (
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.name ?? line.slug}`}
                        onClick={() =>
                          dispatch(setQuantity({ slug: line.slug, quantity: line.quantity - 1 }))
                        }
                        className="px-4 py-2.5 text-ink"
                      >
                        −
                      </button>
                      <span className="w-9 text-center text-sm">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.name ?? line.slug}`}
                        disabled={
                          line.quantity >=
                          Math.min(line.stock ?? 0, cart?.maxQuantityPerLine ?? 5)
                        }
                        onClick={() =>
                          dispatch(setQuantity({ slug: line.slug, quantity: line.quantity + 1 }))
                        }
                        className="px-4 py-2.5 text-ink disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="border border-espresso/40 px-3 py-2 text-[10px] tracking-[0.14em] text-espresso uppercase">
                      Unavailable
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => dispatch(removeItem(line.slug))}
                    className="link-underline eyebrow text-espresso"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="flex h-fit flex-col gap-6 border border-line bg-ivory-soft p-7 lg:sticky lg:top-28">
          <h2 className="eyebrow text-ink">Order summary</h2>

          {cart && cart.amountToFreeShipping > 0 ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-ink-muted">
                Add {formatPrice(cart.amountToFreeShipping)} more for complimentary shipping.
              </p>
              <span className="h-1 w-full bg-line/60">
                <span className="block h-full bg-olive" style={{ width: `${progress}%` }} />
              </span>
            </div>
          ) : (
            cart && (
              <p className="text-xs text-olive">Complimentary shipping applied.</p>
            )
          )}

          <dl className="flex flex-col gap-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(amounts?.subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-ink">
                {amounts?.shipping === 0 ? 'Complimentary' : formatPrice(amounts?.shipping ?? 0)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="text-ink">Total</dt>
              <dd className="font-serif text-2xl font-light text-ink">
                {formatPrice(amounts?.total ?? 0)}
              </dd>
            </div>
          </dl>

          <p className="text-xs text-ink-muted">Inclusive of all taxes.</p>

          {unavailable.length > 0 && (
            <p className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-xs text-espresso">
              Remove the unavailable {unavailable.length === 1 ? 'item' : 'items'} to continue.
            </p>
          )}

          {isFetching || unavailable.length > 0 || (cart?.itemCount ?? 0) === 0 ? (
            <span className="cursor-not-allowed bg-ink px-8 py-4 text-center text-xs tracking-[0.16em] text-ivory uppercase opacity-40">
              Proceed to checkout
            </span>
          ) : (
            <Link
              href="/checkout"
              className="bg-ink px-8 py-4 text-center text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
            >
              Proceed to checkout
            </Link>
          )}
          <p className="text-center text-[11px] text-ink-muted">
            Cash on delivery available. Online payment is coming soon.
          </p>
        </aside>
      </div>
    </Container>
  );
}
