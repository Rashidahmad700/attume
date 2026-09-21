'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/ui/icons';
import { useAppSelector } from '@/store/hooks';

/** How long the badge stays before it fades. */
const VISIBLE_MS = 1700;
const FADE_MS = 260;

/**
 * Sparks fly from behind the badge along fixed angles. Fixed rather than
 * random so the burst looks composed each time instead of different on every
 * add — and so the server and the client agree on what to render.
 */
const SPARKS = [
  { x: '-34px', y: '-26px', colour: 'bg-cherry', size: 'h-2 w-2', delay: '0ms' },
  { x: '30px', y: '-30px', colour: 'bg-bronze', size: 'h-1.5 w-1.5', delay: '40ms' },
  { x: '-44px', y: '10px', colour: 'bg-olive-soft', size: 'h-1.5 w-1.5', delay: '80ms' },
  { x: '42px', y: '14px', colour: 'bg-cherry', size: 'h-1 w-1', delay: '20ms' },
  { x: '-12px', y: '-38px', colour: 'bg-bronze-deep', size: 'h-1 w-1', delay: '100ms' },
  { x: '16px', y: '32px', colour: 'bg-olive', size: 'h-1.5 w-1.5', delay: '60ms' },
];

/**
 * The confirmation that something reached the bag.
 *
 * Sits under the header's bag icon rather than in a corner, because that is
 * where the count it refers to lives — a toast on the far side of the screen
 * makes someone look twice to connect the two.
 */
export function AddedToBagBurst() {
  const addedTick = useAppSelector((state) => state.cart.addedTick);
  const lastAdded = useAppSelector((state) => state.cart.lastAddedSlug);
  const isCartOpen = useAppSelector((state) => state.ui.isCartOpen);

  const [phase, setPhase] = useState<'hidden' | 'in' | 'out'>('hidden');

  useEffect(() => {
    if (addedTick === 0) return;
    setPhase('in');
    const fade = window.setTimeout(() => setPhase('out'), VISIBLE_MS);
    const hide = window.setTimeout(() => setPhase('hidden'), VISIBLE_MS + FADE_MS);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, [addedTick]);

  // The drawer says the same thing in more detail; two confirmations at once
  // is noise.
  if (phase === 'hidden' || isCartOpen) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-16 right-4 z-[94] sm:top-20 sm:right-8"
    >
      <div className="relative">
        {SPARKS.map((spark, index) => (
          <span
            key={index}
            style={
              {
                '--spark-x': spark.x,
                '--spark-y': spark.y,
                animationDelay: spark.delay,
              } as React.CSSProperties
            }
            className={`absolute top-1/2 left-1/2 rounded-full motion-safe:[animation:bag-spark_900ms_ease-out_forwards] ${spark.colour} ${spark.size}`}
          />
        ))}

        <div
          className={`relative flex items-center gap-2.5 rounded-full border border-olive/30 bg-ivory py-2.5 pr-5 pl-2.5 shadow-[0_10px_30px_-10px_rgba(23,22,19,0.5)] ${
            phase === 'out'
              ? 'motion-safe:[animation:bag-pop-out_260ms_ease-in_forwards]'
              : 'motion-safe:[animation:bag-pop-in_420ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]'
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-olive text-ivory">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-[11px] font-bold tracking-[0.14em] text-ink uppercase">
            Added to bag
          </span>
        </div>
      </div>

      {/* Announced once, for anyone who cannot see the badge. */}
      <p role="status" aria-live="polite" className="sr-only">
        {lastAdded ? `${lastAdded} added to your bag` : 'Added to your bag'}
      </p>
    </div>
  );
}
