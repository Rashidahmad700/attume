import type { MetadataRoute } from 'next';
import { policies } from '@/lib/policies';
import { fetchProducts } from '@/lib/products';
import { siteUrl } from '@/lib/site';
import type { Product } from '@/types';

/** Rebuilt hourly, so a new fragrance appears without a deploy. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
      { url: `${siteUrl}/shop`, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    ] as const
  ).map((entry) => ({ ...entry, lastModified: now }));

  // A failed API call must not fail the build — an incomplete sitemap is far
  // better than a page that will not render.
  let products: Product[] = [];
  try {
    products = (await fetchProducts()) as Product[];
  } catch {
    products = [];
  }

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...policies.map((policy) => ({
      url: `${siteUrl}/policies/${policy.slug}`,
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ];
}
