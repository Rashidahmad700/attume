import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalises a number to E.164, or null when it could not be a real one.
 *
 * A regex only checks shape — it happily accepts 0000000000. This checks the
 * number against the country's actual numbering plan, so a sign-up cannot
 * carry a phone number nobody can be reached on. Indian numbers are assumed
 * when no country code is given, since that is where the shop ships.
 */
export function normalisePhone(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(trimmed, 'IN');
  if (!parsed || !parsed.isValid()) return null;

  return parsed.number;
}

/** True when the string is a number someone could actually answer. */
export const isValidPhone = (input: string | undefined | null): boolean =>
  normalisePhone(input) !== null;
