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
    const origin = process.env.API_ORIGIN ?? 'http://localhost:5000';
    return [{ source: '/api/v1/:path*', destination: `${origin}/api/v1/:path*` }];
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
