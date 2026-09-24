import { API_URL } from './products';

export interface CommerceConfig {
  mode: 'prebook' | 'live';
  isPrebook: boolean;
  currency: string;
  cod: { enabled: boolean; minOrderValue: number };
}

/** Falls back to pre-booking: if the API cannot be reached, the safe state is
 *  the one that cannot take an order nobody can fulfil. */
const FALLBACK: CommerceConfig = {
  mode: 'prebook',
  isPrebook: true,
  currency: 'INR',
  cod: { enabled: false, minOrderValue: 999 },
};

/**
 * What the shop may do right now, read from the API on every render. The mode
 * lives on the server so the switch from pre-booking to selling is one
 * environment variable, with no redeploy of the storefront.
 */
export async function fetchCommerceConfig(): Promise<CommerceConfig> {
  try {
    const response = await fetch(`${API_URL}/config`, { cache: 'no-store' });
    if (!response.ok) return FALLBACK;
    const payload = await response.json();
    return payload.data.commerce as CommerceConfig;
  } catch {
    return FALLBACK;
  }
}
