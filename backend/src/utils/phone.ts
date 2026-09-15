import { parsePhoneNumberFromString } from 'libphonenumber-js';

/** Ten digits beginning 6-9 — the Indian mobile range. */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/**
 * Normalises to E.164, or null when it is not a number someone could answer.
 *
 * Deliberately narrower than libphonenumber on its own: the shop delivers in
 * India, so a ten digit Indian mobile is the only thing worth storing. The
 * library still does the work of recognising the number once the country code
 * and any punctuation are stripped.
 */
export function normalisePhone(input: string | undefined | null): string | null {
  if (!input) return null;

  // Tolerate how people actually type: +91, 0091, a leading 0, spaces, dashes.
  const digits = input.replace(/\D/g, '').replace(/^(?:0091|91|0)/, '');
  if (!INDIAN_MOBILE.test(digits)) return null;

  const parsed = parsePhoneNumberFromString(digits, 'IN');
  if (!parsed || !parsed.isValid()) return null;

  return parsed.number;
}

/** True when the string is a number someone could actually answer. */
export const isValidPhone = (input: string | undefined | null): boolean =>
  normalisePhone(input) !== null;
