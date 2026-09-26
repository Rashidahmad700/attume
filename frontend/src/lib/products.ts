import { cache } from 'react';

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Server components talk to the API directly. The browser goes through the
 * rewrite in next.config instead, so its cookies stay first-party — Safari and
 * Brave drop third-party cookies, which would silently break sign-in.
 */
export const API_URL = `${(process.env.API_ORIGIN ?? 'http://localhost:5000')
  .trim()
  .replace(/\/+$/, '')}/api/v1`;

/** Server-side catalogue reads. Never cached, so admin stock edits show at once. */
export async function fetchProducts(featuredOnly = false) {
  const response = await fetch(`${API_URL}/products${featuredOnly ? '?featured=true' : ''}`, {
    cache: 'no-store',
  });
  if (!response.ok) return [];
  const payload = await response.json();
  return payload.data.products;
}

/**
 * Server-side search, used by /shop?q=. Search is rate limited, so the page
 * passes proxyHeaders() to have the limit count the shopper, not this server.
 */
export async function searchProducts(query: string, headers: Record<string, string> = {}) {
  const response = await fetch(
    `${API_URL}/products/search?q=${encodeURIComponent(query)}&limit=24`,
    { cache: 'no-store', headers },
  );
  if (!response.ok) return { products: [], total: 0 };
  const payload = await response.json();
  return payload.data;
}

/**
 * Wrapped in cache() because a product page asks twice in one request — once
 * for its metadata, once to render — and an uncached fetch would hit the API
 * both times. Scoped to the request, so nothing goes stale.
 */
export const fetchProduct = cache(async (slug: string) => {
  const response = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' });
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.data.product;
});

export async function fetchRelated(slug: string) {
  const response = await fetch(`${API_URL}/products/${slug}/related`, { cache: 'no-store' });
  if (!response.ok) return [];
  const payload = await response.json();
  return payload.data.products;
}

export interface InstagramPost {
  id: string;
  caption: string;
  permalink: string;
  embedUrl?: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'TEXT';
  timestamp?: string;
}

/** Instagram posts, served by the API with a curated fallback. */
export async function fetchInstagramFeed(limit = 6): Promise<{
  posts: InstagramPost[];
  source: 'api' | 'curated';
  profileUrl: string;
}> {
  try {
    const response = await fetch(`${API_URL}/instagram/feed?limit=${limit}`, {
      // Short enough that new posts appear soon after the API deploys. The
      // cache outlives storefront deploys, and the two apps deploy separately,
      // so an hour here once kept a new set of posts off the home page.
      next: { revalidate: 600 },
    });
    if (!response.ok) throw new Error('feed unavailable');
    const payload = await response.json();
    return payload.data;
  } catch {
    return { posts: [], source: 'curated', profileUrl: 'https://www.instagram.com/attume.official' };
  }
}
