import { Container } from '@/components/ui/Container';
import { InstagramIcon } from '@/components/ui/icons';
import { fetchInstagramFeed } from '@/lib/products';
import { site } from '@/lib/site';

/** Tints so consecutive text cards do not read as one flat block. */
const tones = [
  'from-[#f4efdc] to-[#e6dfc6]',
  'from-[#eef0dd] to-[#d9dfbe]',
  'from-[#f7f3e3] to-[#e2d9c0]',
  'from-[#eae7d3] to-[#cfd3ae]',
  'from-[#f3ecdb] to-[#ddd2b4]',
  'from-[#f0ebd8] to-[#d6cfb2]',
];

export async function InstagramFeed() {
  const { posts, source, profileUrl } = await fetchInstagramFeed(6);
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

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden border border-line"
              aria-label={post.caption.slice(0, 80) || 'View on Instagram'}
            >
              {post.mediaUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.mediaUrl}
                    alt={post.caption.slice(0, 120) || 'attume on Instagram'}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/45">
                    <InstagramIcon className="h-6 w-6 text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                </>
              ) : (
                <div
                  className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${
                    tones[index % tones.length]
                  } p-4 transition-transform duration-700 group-hover:scale-[1.02]`}
                >
                  <InstagramIcon className="h-4 w-4 text-olive/70" />
                  <p className="line-clamp-5 font-serif text-[13px] leading-snug text-ink">
                    {post.caption}
                  </p>
                  <span className="eyebrow text-[9px] text-ink-muted">attume.official</span>
                </div>
              )}
            </a>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline eyebrow flex items-center gap-2 text-ink transition-colors hover:text-olive"
          >
            <InstagramIcon className="h-4 w-4" />
            Follow @{site.instagramHandle}
          </a>
          {source === 'curated' && (
            <p className="text-[11px] text-ink-muted">
              Live post images appear here once the Instagram connection is authorised.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
