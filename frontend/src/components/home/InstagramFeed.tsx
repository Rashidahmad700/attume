import { site } from '@/lib/site';
import { Container } from '@/components/ui/Container';
import { InstagramIcon } from '@/components/ui/icons';
import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Static placeholder grid. Phase 2 swaps `posts` for the Instagram Basic
 * Display / Graph API response — the markup stays as is.
 */
const posts = [
  { id: 1, caption: 'Layering tip #01 — fresh + woody', tone: 'from-[#f4efdc] to-[#e6dfc6]' },
  { id: 2, caption: 'The scent of cool confidence', tone: 'from-[#eef0dd] to-[#d9dfbe]' },
  { id: 3, caption: 'Inside the maceration room', tone: 'from-[#f7f3e3] to-[#e2d9c0]' },
  { id: 4, caption: 'atolis · extrait de parfum', tone: 'from-[#eae7d3] to-[#cfd3ae]' },
  { id: 5, caption: 'Notes that stay till evening', tone: 'from-[#f3ecdb] to-[#ddd2b4]' },
  { id: 6, caption: 'Proudly made in India', tone: 'from-[#f0ebd8] to-[#d6cfb2]' },
];

export function InstagramFeed() {
  return (
    <section className="bg-ivory-soft py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Follow the house"
          title={`@${site.instagramHandle}`}
          description="Scent notes, layering guides and behind-the-bench moments from the studio."
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href={site.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden"
              aria-label={post.caption}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.tone} transition-transform duration-700 group-hover:scale-105`}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-500 group-hover:bg-ink/45">
                <InstagramIcon className="h-6 w-6 text-ivory opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <span className="sr-only">{post.caption}</span>
            </a>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="link-underline eyebrow flex items-center gap-2 text-ink transition-colors hover:text-olive"
          >
            <InstagramIcon className="h-4 w-4" />
            Follow @{site.instagramHandle}
          </a>
        </div>
      </Container>
    </section>
  );
}
