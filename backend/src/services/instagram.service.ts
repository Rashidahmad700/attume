import { env } from '../config/env.js';

export interface InstagramPost {
  id: string;
  caption: string;
  permalink: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'TEXT';
  timestamp?: string;
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
 * Real posts from @attume.official — caption plus the post's own permalink, so
 * each card opens that exact post rather than the profile. Images cannot be
 * used here: Instagram's CDN links are signed, expire and block hotlinking, so
 * the cards stay typographic until an API token is configured.
 */
const curatedPosts: InstagramPost[] = [
  {
    id: 'curated-1',
    caption: 'Years later, nobody remembers what you were wearing. Sometimes, they remember how you smelled.',
    permalink: 'https://www.instagram.com/p/Db_CaO5k0DG/',
    mediaType: 'TEXT',
  },
  {
    id: 'curated-2',
    caption: 'The scent of cool confidence — apple, plum, cardamom, orange blossom over musk, amber and driftwood.',
    permalink: 'https://www.instagram.com/p/DbgUgsEEzod/',
    mediaType: 'TEXT',
  },
  {
    id: 'curated-3',
    caption: 'A fragrance map of India: attar traditions from Uttar Pradesh, Karnataka, Kerala, Tamil Nadu, Assam and Rajasthan.',
    permalink: 'https://www.instagram.com/p/DbbUWeZE9HF/',
    mediaType: 'TEXT',
  },
  {
    id: 'curated-4',
    caption: 'Layering tip #01 — fresh citrus for the first impression, woody notes for the lasting one.',
    permalink: 'https://www.instagram.com/p/DbWEIdSEy2_/',
    mediaType: 'TEXT',
  },
  {
    id: 'curated-5',
    caption: 'Your sense of smell is wired directly to the part of the brain that stores emotion and memory.',
    permalink: 'https://www.instagram.com/p/DbLP1vHAZdI/',
    mediaType: 'TEXT',
  },
  {
    id: 'curated-6',
    caption: 'Find your fragrance personality — floral, fresh, woody or oriental.',
    permalink: 'https://www.instagram.com/p/Da8ULZFgVQJ/',
    mediaType: 'TEXT',
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
        timestamp: media.timestamp,
      }));

      cache = { posts, source: 'api', fetchedAt: Date.now() };
      return { posts: posts.slice(0, limit), source: 'api', profileUrl: PROFILE_URL };
    } catch (error) {
      console.warn('[instagram] falling back to curated posts:', (error as Error).message);
    }
  }

  cache = { posts: curatedPosts, source: 'curated', fetchedAt: Date.now() };
  return { posts: curatedPosts.slice(0, limit), source: 'curated', profileUrl: PROFILE_URL };
}
