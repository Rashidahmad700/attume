import { env } from '../config/env.js';

export interface InstagramPost {
  id: string;
  caption: string;
  permalink: string;
  /** Instagram's public embed URL — renders the real image without a token. */
  embedUrl?: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'TEXT';
  timestamp?: string;
}

/**
 * https://www.instagram.com/p/<shortcode>/ -> .../embed/
 * The uncaptioned variant: Instagram renders the image and its own attribution,
 * and the storefront prints the caption underneath in the house typeface.
 */
function embedUrlFor(permalink: string): string | undefined {
  const match = /instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/.exec(permalink);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : undefined;
}

interface GraphMedia {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp?: string;
}

const PROFILE_URL = `https://www.instagram.com/${env.INSTAGRAM_PROFILE}`;

/**
 * The account's six most recent posts, each with its own permalink. Captions
 * are the studio's own opening lines, taken from the posts themselves.
 *
 * Images are served from the storefront's own /public/instagram folder. The
 * account's CDN URLs are signed and expire within days, so the files are kept
 * locally instead — nothing on the page depends on Instagram at runtime.
 */
const curatedPosts: InstagramPost[] = [
  {
    id: 'Db_CaO5k0DG',
    caption:
      'What does India smell like? It depends on where you stand. In Kannauj, it smells of centuries-old attar.',
    permalink: 'https://www.instagram.com/p/Db_CaO5k0DG/',
    mediaUrl: '/instagram/Db_CaO5k0DG.jpg',
    mediaType: 'IMAGE',
  },
  {
    id: 'DbgUgsEEzod',
    caption: 'Fresh doesn\u2019t have to fade. Soft doesn\u2019t have to be boring.',
    permalink: 'https://www.instagram.com/p/DbgUgsEEzod/',
    mediaUrl: '/instagram/DbgUgsEEzod.jpg',
    mediaType: 'IMAGE',
  },
  {
    id: 'DbbUWeZE9HF',
    caption: 'Most people wear perfume. Very few know how to layer it.',
    permalink: 'https://www.instagram.com/p/DbbUWeZE9HF/',
    mediaUrl: '/instagram/DbbUWeZE9HF.jpg',
    mediaType: 'IMAGE',
  },
  {
    id: 'DbWEIdSEy2_',
    caption: 'Fresh for the first impression. Woody for the lasting one.',
    permalink: 'https://www.instagram.com/p/DbWEIdSEy2_/',
    mediaUrl: '/instagram/DbWEIdSEy2_.jpg',
    mediaType: 'IMAGE',
  },
  {
    id: 'DbLP1vHAZdI',
    caption:
      'Not every fragrance tells the same story. Some feel like a fresh morning.',
    permalink: 'https://www.instagram.com/p/DbLP1vHAZdI/',
    mediaUrl: '/instagram/DbLP1vHAZdI.jpg',
    mediaType: 'IMAGE',
  },
  {
    id: 'Da8ULZFgVQJ',
    caption: 'Some places leave you with a memory. Others leave you with a fragrance.',
    permalink: 'https://www.instagram.com/p/Da8ULZFgVQJ/',
    mediaUrl: '/instagram/Da8ULZFgVQJ.jpg',
    mediaType: 'IMAGE',
  },
];

let cache: { posts: InstagramPost[]; source: 'api' | 'curated'; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Fetches the latest posts. With INSTAGRAM_ACCESS_TOKEN set it calls the
 * Instagram Graph API; otherwise it serves the curated set. Results are cached
 * for half an hour so the storefront never waits on Instagram, and an API
 * failure quietly falls back rather than emptying the section.
 */
export async function getInstagramFeed(limit = 6): Promise<{
  posts: InstagramPost[];
  source: 'api' | 'curated';
  profileUrl: string;
}> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return { posts: cache.posts.slice(0, limit), source: cache.source, profileUrl: PROFILE_URL };
  }

  if (env.INSTAGRAM_ACCESS_TOKEN) {
    try {
      const url = new URL('https://graph.instagram.com/me/media');
      url.searchParams.set(
        'fields',
        'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
      );
      url.searchParams.set('limit', String(Math.min(limit, 12)));
      url.searchParams.set('access_token', env.INSTAGRAM_ACCESS_TOKEN);

      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error(`Instagram responded ${response.status}`);

      const payload = (await response.json()) as { data: GraphMedia[] };
      const posts: InstagramPost[] = payload.data.map((media) => ({
        id: media.id,
        caption: media.caption ?? '',
        permalink: media.permalink,
        // Videos expose a still under thumbnail_url.
        mediaUrl: media.media_type === 'VIDEO' ? media.thumbnail_url : media.media_url,
        mediaType: media.media_type,
        embedUrl: embedUrlFor(media.permalink),
        timestamp: media.timestamp,
      }));

      cache = { posts, source: 'api', fetchedAt: Date.now() };
      return { posts: posts.slice(0, limit), source: 'api', profileUrl: PROFILE_URL };
    } catch (error) {
      console.warn('[instagram] falling back to curated posts:', (error as Error).message);
    }
  }

  const withEmbeds = curatedPosts.map((post) => ({
    ...post,
    embedUrl: post.embedUrl ?? embedUrlFor(post.permalink),
  }));
  cache = { posts: withEmbeds, source: 'curated', fetchedAt: Date.now() };
  return { posts: withEmbeds.slice(0, limit), source: 'curated', profileUrl: PROFILE_URL };
}
