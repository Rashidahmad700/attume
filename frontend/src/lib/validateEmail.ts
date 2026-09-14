/** Domains typed by accident often enough to be worth catching before submit. */
const TYPOS: Record<string, string> = {
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

/**
 * Returns an error message, or null when the address looks sendable.
 *
 * The same typo list the API checks, applied while typing — an address that
 * cannot receive mail is worth catching before an account is created around it.
 */
export function checkEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address';

  const domain = email.split('@')[1];
  if (TYPOS[domain]) return `Did you mean ${email.split('@')[0]}@${TYPOS[domain]}?`;

  return null;
}
