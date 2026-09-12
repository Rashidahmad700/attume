import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * Same-origin proxy to the API, so the admin session cookie is first-party.
   * Browsers that block third-party cookies would otherwise sign the admin out
   * on every request.
   */
  async rewrites() {
    // Trimmed because a value pasted into a host's dashboard often carries a
    // leading tab or newline, which fails the build with "Invalid rewrite".
    const origin = (process.env.API_ORIGIN ?? 'http://localhost:5000').trim().replace(/\/+$/, '');
    return [{ source: '/api/v1/:path*', destination: `${origin}/api/v1/:path*` }];
  },
  // The admin panel must never be indexed, even if the host is guessed.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // The console must never be framed by another site.
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
