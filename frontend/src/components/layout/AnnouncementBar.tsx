import { site } from '@/lib/site';

/**
 * The strip above the header.
 *
 * Olive ground with ivory type — the only place in the application where the
 * brand colour fills a full-bleed band, which is what makes it read as a
 * notice rather than another section.
 *
 * Pure CSS: the track holds the list twice and slides exactly half its width,
 * so the loop closes with no seam and no JavaScript ticking every frame. It
 * stops on hover, and prefers-reduced-motion halts it globally.
 */
export function AnnouncementBar() {
  const items = [...site.announcements];

  return (
    <div className="group overflow-hidden bg-olive text-ivory">
      <div className="flex w-max animate-[announce_34s_linear_infinite] gap-10 py-2.5 pr-10 group-hover:[animation-play-state:paused] sm:gap-16 sm:pr-16">
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            // aria-hidden on the duplicate half, so a screen reader is not
            // read the same four notices twice.
            aria-hidden={index >= items.length}
            className="flex items-center gap-10 text-[10px] font-semibold tracking-[0.22em] whitespace-nowrap text-ivory/90 uppercase sm:gap-16 sm:text-[11px]"
          >
            {item}
            <span aria-hidden="true" className="text-ivory/35">
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
