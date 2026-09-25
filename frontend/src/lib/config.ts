import { API_URL } from './products';

export interface CommerceConfig {
  mode: 'prebook' | 'live';
  isPrebook: boolean;
  currency: string;
  /**
   * Read from the API rather than from a build-time variable, so the day the
   * gateway's test keys are swapped for live ones the storefront needs no
   * rebuild. `keyId` is public — it is what opens Checkout in the browser.
   */
  online: { enabled: boolean; provider: 'razorpay' | null; keyId: string | null };
}

/** Falls back to pre-booking: if the API cannot be reached, the safe state is
 *  the one that cannot take an order nobody can fulfil. */
const FALLBACK: CommerceConfig = {
  mode: 'prebook',
  isPrebook: true,
  currency: 'INR',
  // Off in the fallback: an unreachable API must not lead to a Checkout it
  // would then refuse to settle.
  online: { enabled: false, provider: null, keyId: null },
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
