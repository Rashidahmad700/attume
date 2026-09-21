'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { endFlyToCart } from '@/store/slices/uiSlice';

/** Long enough to read as travel, short enough not to delay the drawer. */
const FLIGHT_MS = 750;

/** The header bag carries this, so the flight has something to aim at. */
export const CART_TARGET_ATTR = 'data-cart-target';

/**
 * Sends a copy of the product image into the bag icon.
 *
 * A clone is animated rather than the card's own image: the card must not
 * move, and the flight has to cross the page above everything else. Positions
 * are measured at launch rather than guessed, so it works wherever the card
 * sits and at any scroll offset.
 */
export function FlyToCart() {
  const flight = useAppSelector((state) => state.ui.flyToCart);
  const dispatch = useAppDispatch();
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!flight) return;

    const bag = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
    if (!bag) {
      // Nothing to fly to — the bag is hidden in pre-book mode.
      dispatch(endFlyToCart());
      return;
    }

    const box = bag.getBoundingClientRect();
    setTarget({ x: box.left + box.width / 2, y: box.top + box.height / 2 });

    const done = window.setTimeout(() => {
      setTarget(null);
      dispatch(endFlyToCart());
    }, FLIGHT_MS);
    return () => window.clearTimeout(done);
  }, [flight, dispatch]);

  if (!flight || !target) return null;

  // Travel measured from the centre of the image that was pressed.
  const fromX = flight.x + flight.width / 2;
  const fromY = flight.y + flight.height / 2;

  return (
    <div
      aria-hidden="true"
      key={flight.tick}
      className="pointer-events-none fixed z-[93] motion-safe:[animation:fly-to-cart_750ms_cubic-bezier(0.5,-0.2,0.7,1)_forwards] motion-reduce:hidden"
      style={
        {
          left: flight.x,
          top: flight.y,
          width: flight.width,
          height: flight.height,
          '--fly-x': `${target.x - fromX}px`,
          '--fly-y': `${target.y - fromY}px`,
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={flight.image}
        alt=""
        className="h-full w-full rounded-2xl object-cover shadow-[0_18px_40px_-12px_rgba(23,22,19,0.55)]"
      />
    </div>
  );
}
