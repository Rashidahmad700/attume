import { Container } from '@/components/ui/Container';
import { fetchInstagramFeed } from '@/lib/products';

/**
 * Full-bleed marquee of post images. The list is rendered twice and the track
 * is translated by half its width, so the loop meets itself with no visible
 * seam. Pure CSS — no JS, no third-party embed.
 */
export async function InstagramFeed() {
  const { posts, profileUrl } = await fetchInstagramFeed(6);
  const withImages = posts.filter((post) => post.mediaUrl);
  if (withImages.length === 0) return null;

  const track = [...withImages, ...withImages];

  return (
    <section className="overflow-hidden bg-ivory py-16 lg:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-serif text-3xl font-light text-ink lg:text-4xl">
            Follow us on Instagram
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            Join us for scent notes, layering guides and a closer look at what we make.
          </p>
        </div>
      </Container>

      <div className="group relative mt-12 overflow-hidden">
        {/* Soft edges so images fade out rather than being cut off. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ivory to-transparent sm:w-28"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ivory to-transparent sm:w-28"
        />

        <ul className="flex w-max animate-[insta-scroll_46s_linear_infinite] gap-4 group-hover:[animation-play-state:paused] sm:gap-6">
          {track.map((post, index) => (
            <li key={`${post.id}-${index}`} className="w-44 shrink-0 sm:w-56 lg:w-64">
              <a
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-2xl"
                // The duplicated half is decorative; keep it out of the a11y tree.
                aria-hidden={index >= withImages.length}
                tabIndex={index >= withImages.length ? -1 : undefined}
                aria-label={post.caption.slice(0, 90) || 'View post on Instagram'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.mediaUrl}
                  alt={index >= withImages.length ? '' : post.caption.slice(0, 120)}
                  loading="lazy"
                  className="aspect-square w-full rounded-2xl object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-ink px-10 py-4 text-[11px] tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
        >
          Visit Instagram
        </a>
      </div>

      <style>{`
        @keyframes insta-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
