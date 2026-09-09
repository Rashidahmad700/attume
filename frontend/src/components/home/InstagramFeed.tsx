import { Container } from '@/components/ui/Container';
import { fetchInstagramFeed } from '@/lib/products';
import { site } from '@/lib/site';

/**
 * A plain row of post images. No embeds, so no Instagram chrome, no follower
 * count and no third-party weight — the files are served from /public.
 */
export async function InstagramFeed() {
  const { posts, profileUrl } = await fetchInstagramFeed(6);
  const withImages = posts.filter((post) => post.mediaUrl);
  if (withImages.length === 0) return null;

  return (
    <section className="bg-ivory py-16 lg:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="font-serif text-3xl font-light text-ink lg:text-4xl">
            Follow us on Instagram
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            Join us for scent notes, layering guides and a closer look at what we make.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {withImages.map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden"
                aria-label={post.caption.slice(0, 90) || 'View post on Instagram'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.mediaUrl}
                  alt={post.caption.slice(0, 120) || 'attume on Instagram'}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-ink px-10 py-4 text-[11px] tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
          >
            Visit Instagram
          </a>
        </div>
      </Container>
    </section>
  );
}
