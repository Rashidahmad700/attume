'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface HeroSlide {
  src: string;
  /** Intrinsic size, so the frame can take the shape of each artwork. */
  width: number;
  height: number;
  /** Describes the artwork for anyone who cannot see it — the copy is baked
   *  into the image, so it exists nowhere else. */
  alt: string;
  href: string;
  /** Names the destination for screen readers and the arrow controls. */
  label: string;
}

const INTERVAL = 6500;

/**
 * The home banner. Artwork carries its own headline and call to action, so the
 * whole slide is one link rather than text layered over a photograph.
 *
 * Advancing stops whenever someone is looking deliberately — pointer over the
 * banner, keyboard focus inside it, the tab hidden, or a system preference for
 * reduced motion — so it never moves a target out from under a click.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  // A background tab should not race through the whole set unseen.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  if (slides.length === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="attume fragrances"
      className="relative overflow-hidden bg-ivory-deep"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') go(index + 1);
        if (event.key === 'ArrowLeft') go(index - 1);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        // Long enough to be a swipe rather than a tap that wandered.
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {/*
        Every banner is drawn at 2:1, so the frame takes its shape from
        whichever is showing and simply never changes. It still reads the
        slide's own dimensions rather than hard-coding the ratio, so artwork
        of another shape would be shown whole rather than cropped.
      */}
      <div
        className="relative min-h-[260px] w-full transition-[aspect-ratio] duration-500 ease-out sm:min-h-0"
        style={{ aspectRatio: `${slides[index].width} / ${slides[index].height}` }}
      >
        {slides.map((slide, position) => (
          <Link
            key={slide.src}
            href={slide.href}
            aria-label={slide.label}
            aria-hidden={position !== index}
            tabIndex={position === index ? 0 : -1}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              position === index ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              // The first slide is the largest thing above the fold; the rest
              // can wait until the browser is idle.
              priority={position === 0}
              loading={position === 0 ? undefined : 'lazy'}
              sizes="100vw"
              // Left-anchored: on a narrow screen the crop has to keep the
              // headline and button, which sit on the left of every banner.
              className="object-cover object-left sm:object-center"
            />
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full bg-ivory/80 p-3 text-ink backdrop-blur-sm transition-colors hover:bg-ivory sm:block"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m15 5-7 7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full bg-ivory/80 p-3 text-ink backdrop-blur-sm transition-colors hover:bg-ivory sm:block"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5">
            {slides.map((slide, position) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(position)}
                aria-label={`Show ${slide.label}`}
                aria-current={position === index}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  position === index ? 'w-7 bg-ink' : 'w-2 bg-ink/35 hover:bg-ink/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
