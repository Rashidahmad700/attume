import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Baseline headers. A strict Content-Security-Policy is deliberately not set
   * yet — Next's inline bootstrap needs a nonce, and shipping a broken policy
   * is worse than shipping none.
   */
  /**
   * Keeps the API on the storefront's own origin. Without this the browser
   * would call the API host directly and its session cookie would be
   * third-party — which Safari and Brave discard, breaking sign-in.
   */
  async rewrites() {
    // Trimmed because a value pasted into a host's dashboard often carries a
    // leading tab or newline, which fails the build with "Invalid rewrite".
    const origin = (process.env.API_ORIGIN ?? 'http://localhost:5000').trim().replace(/\/+$/, '');
    return [{ source: '/api/v1/:path*', destination: `${origin}/api/v1/:path*` }];
  },
  /**
   * www → the main address, for pages only. A form submitted from a page
   * already open on www must not be redirected: browsers refuse to follow a
   * redirect to another host for a request like that, and the shopper sees
   * "couldn't connect". The API accepts both hosts, so /api stays put.
   * Host domain redirects in the Vercel dashboard would redirect /api too, so
   * both domains stay attached there without a redirect.
   */
  async redirects() {
    const site = new URL((process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofattume.com').trim());
    if (site.hostname.startsWith('www.')) return [];
    return [
      {
        source: '/:path((?!api/).*)',
        has: [{ type: 'host', value: `www.${site.hostname}` }],
        destination: `${site.origin}/:path`,
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
};

export default nextConfig;
