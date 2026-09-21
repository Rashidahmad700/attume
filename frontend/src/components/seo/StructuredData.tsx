import { site, siteUrl } from '@/lib/site';
import type { Product } from '@/types';

/**
 * JSON-LD for search engines.
 *
 * Rendered as a plain script tag rather than through next/script: this has to
 * be in the HTML a crawler receives, and a deferred script is not guaranteed
 * to be. `<` escaping closes the one hole that matters — a product name
 * containing "</script>" would otherwise end the block early.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/** Who the shop is. Feeds the knowledge panel and brand queries. */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.name,
        // The domain is how people search for the brand, so it is worth
        // being an alternate name in its own right.
        alternateName: ['House of attume', 'houseofattume'],
        url: siteUrl,
        description: site.description,
        email: site.email,
        telephone: site.phone,
        sameAs: [site.instagramUrl],
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address,
          addressCountry: 'IN',
        },
      }}
    />
  );
}

/** Lets Google offer the site's own search box in results. */
export function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: site.name,
        url: siteUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/shop?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

/** A fragrance, with its price and whether it can be bought right now. */
export function ProductSchema({ product }: { product: Product }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.tagline || product.description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: site.name },
        image: product.images?.map((image) => `${siteUrl}${image.url}`) ?? [],
        offers: {
          '@type': 'Offer',
          url: `${siteUrl}/products/${product.slug}`,
          priceCurrency: 'INR',
          price: product.price,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
        ...(product.rating.count > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating.average,
                reviewCount: product.rating.count,
              },
            }
          : {}),
      }}
    />
  );
}
