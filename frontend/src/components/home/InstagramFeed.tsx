import { Container } from '@/components/ui/Container';
import { InstagramIcon } from '@/components/ui/icons';
import { fetchInstagramFeed } from '@/lib/products';
import { site } from '@/lib/site';

export async function InstagramFeed() {
  const { posts, profileUrl } = await fetchInstagramFeed(6);
  if (posts.length === 0) return null;

  return (
    <section className="bg-ivory py-16 lg:py-20">
      <Container>
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="eyebrow text-bronze">Follow the house</span>
          <h2 className="font-serif text-3xl font-light text-ink lg:text-4xl">
            @{site.instagramHandle}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-ink-muted">
            Presence is the highest form of luxury — scent notes, layering guides and the studio,
            posted as we work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <figure key={post.id} className="flex flex-col border border-line bg-ivory-soft">
              {post.embedUrl ? (
                // Instagram's own embed: the sanctioned way to show a post, and
                // the only one whose image URL does not expire. Lazy so six of
                // them never block the rest of the page.
                <iframe
                  src={post.embedUrl}
                  title={post.caption.slice(0, 80) || 'attume on Instagram'}
                  loading="lazy"
                  scrolling="no"
                  // Instagram's embed renders its own card; a fixed frame keeps
                  // the six tiles aligned regardless of caption length.
                  className="h-[560px] w-full border-0"
                />
              ) : (
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex aspect-square flex-col justify-between p-5"
                >
                  <InstagramIcon className="h-4 w-4 text-olive/70" />
                  <p className="font-serif text-base leading-snug text-ink">{post.caption}</p>
                  <span className="eyebrow text-[9px] text-ink-muted">attume.official</span>
                </a>
              )}

              <figcaption className="border-t border-line px-5 py-4">
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline text-sm leading-relaxed text-ink-muted hover:text-ink"
                >
                  {post.caption}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border border-ink px-8 py-4 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-ink hover:text-ivory"
          >
            <InstagramIcon className="h-4 w-4" />
            Follow @{site.instagramHandle}
          </a>
        </div>
      </Container>
    </section>
  );
}
