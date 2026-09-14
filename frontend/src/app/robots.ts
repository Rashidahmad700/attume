import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

/**
 * Pages that belong to one shopper are kept out of the index — they are
 * useless in search results and leak nothing anyone should stumble into.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/cart', '/checkout', '/orders/', '/login', '/signup', '/reset-password', '/auth/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
