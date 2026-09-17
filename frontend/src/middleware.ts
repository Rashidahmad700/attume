import { NextResponse, type NextRequest } from 'next/server';
import { CLIENT_IP_HEADER, PROXY_SECRET_HEADER, proxyHeaders } from '@/lib/proxy';

/**
 * Runs before the /api/v1 rewrite in next.config, so the API learns which
 * shopper each proxied request belongs to — see lib/proxy.ts.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  // A browser must never be able to supply these itself.
  headers.delete(PROXY_SECRET_HEADER);
  headers.delete(CLIENT_IP_HEADER);
  for (const [name, value] of Object.entries(proxyHeaders(request.headers))) {
    headers.set(name, value);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: '/api/v1/:path*',
};
