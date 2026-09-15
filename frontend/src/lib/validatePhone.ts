import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Returns an error message, or null when the number is one that could be
 * answered. Checked against the country's numbering plan rather than a shape
 * regex, so 0000000000 is refused here as well as at the API.
 */
export function checkPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Contact number is required';

  const parsed = parsePhoneNumberFromString(trimmed, 'IN');
  if (!parsed || !parsed.isValid()) return 'Enter a valid phone number';

  return null;
}
