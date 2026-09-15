/** Ten digits beginning 6-9 — the Indian mobile range. */
const INDIAN_MOBILE = /^[6-9]\d{9}$/;

/** Strips everything the API would ignore, so what is typed matches what is checked. */
export const digitsOnly = (value: string): string =>
  value.replace(/\D/g, '').replace(/^(?:0091|91|0)/, '').slice(0, 10);

/**
 * Returns an error message, or null when the number could be answered.
 * Mirrors the API: the shop delivers in India, so a ten digit mobile is the
 * only thing worth collecting.
 */
export function checkPhone(value: string): string | null {
  const digits = digitsOnly(value);
  if (!digits) return 'Contact number is required';
  if (digits.length < 10) return 'A mobile number is 10 digits';
  if (!INDIAN_MOBILE.test(digits)) return 'Enter a valid 10-digit mobile number';
  return null;
}

/** Letters and the punctuation names carry, but no digits. */
export function checkName(value: string): string | null {
  const name = value.trim();
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (/\d/.test(name)) return 'Name cannot contain numbers';
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(name)) return 'Enter your name as it is written';
  return null;
}
