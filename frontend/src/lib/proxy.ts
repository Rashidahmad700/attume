/**
 * Server only — reads a secret. Never import this from a client component.
 *
 * Every API call made from the storefront's servers arrives at the API from the
 * same few addresses, so the API would count all shoppers as one visitor and
 * rate-limit them together. These headers tell it who the shopper really is;
 * the API believes the IP only when the secret matches.
 */
export const PROXY_SECRET_HEADER = 'x-attume-proxy-secret';
export const CLIENT_IP_HEADER = 'x-attume-client-ip';

/** The shopper's IP as the host saw it. Vercel sets x-real-ip and overwrites any value a browser sends. */
export function shopperIp(incoming: Headers): string | null {
  const ip = incoming.get('x-real-ip') ?? incoming.get('x-forwarded-for')?.split(',')[0];
  return ip?.trim() || null;
}

/** Headers to add to an API request made on a shopper's behalf. Empty when no secret is configured. */
export function proxyHeaders(incoming: Headers): Record<string, string> {
  const secret = process.env.API_PROXY_SECRET?.trim();
  const ip = shopperIp(incoming);
  if (!secret || !ip) return {};
  return { [PROXY_SECRET_HEADER]: secret, [CLIENT_IP_HEADER]: ip };
}
