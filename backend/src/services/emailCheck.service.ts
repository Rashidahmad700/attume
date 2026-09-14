import { promises as dns } from 'node:dns';

/**
 * Domains that accept anything and drop it. Someone using one is not going to
 * read the confirmation, and the address is worthless on a launch list.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'yopmail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
]);

/** Typos common enough to be worth catching before the address is stored. */
const COMMON_TYPOS: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gnail.com': 'gmail.com',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'rediffmail.co': 'rediffmail.com',
};

export interface EmailCheck {
  ok: boolean;
  /** Shown to the person who typed it, so it has to be useful. */
  reason?: string;
  suggestion?: string;
}

// A domain's mail servers rarely change, and a launch brings many sign-ups from
// the same few providers. Cached for an hour so one lookup serves all of them.
const mxCache = new Map<string, { hasMx: boolean; checkedAt: number }>();
const MX_CACHE_TTL = 60 * 60 * 1000;

async function hasMailExchanger(domain: string): Promise<boolean> {
  const cached = mxCache.get(domain);
  if (cached && Date.now() - cached.checkedAt < MX_CACHE_TTL) return cached.hasMx;

  let hasMx = false;
  try {
    const records = await dns.resolveMx(domain);
    hasMx = records.length > 0 && records.some((record) => record.exchange);
  } catch {
    // NXDOMAIN or no MX record. Some domains take mail on their A record, so
    // fall back to that before calling an address undeliverable.
    try {
      const addresses = await dns.resolve4(domain);
      hasMx = addresses.length > 0;
    } catch {
      hasMx = false;
    }
  }

  mxCache.set(domain, { hasMx, checkedAt: Date.now() });
  return hasMx;
}

/**
 * Checks an address is one that could actually receive mail: shaped correctly,
 * not disposable, and on a domain that publishes somewhere to deliver.
 *
 * Deliberately stops short of probing the mailbox itself — SMTP callouts are
 * unreliable, get the sender blocked, and most providers accept anything at
 * that stage anyway. This catches typos and junk, which is what it is for.
 */
export async function checkEmail(email: string): Promise<EmailCheck> {
  const address = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) {
    return { ok: false, reason: 'That does not look like a complete email address' };
  }

  const domain = address.split('@')[1];

  if (COMMON_TYPOS[domain]) {
    const suggestion = `${address.split('@')[0]}@${COMMON_TYPOS[domain]}`;
    return {
      ok: false,
      reason: `Did you mean ${suggestion}?`,
      suggestion,
    };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: 'Please use an address you actually read — we write to you before anything ships',
    };
  }

  if (!(await hasMailExchanger(domain))) {
    return { ok: false, reason: `We cannot deliver mail to ${domain} — please check the spelling` };
  }

  return { ok: true };
}
