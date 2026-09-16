/**
 * The password rules, in one place.
 *
 * Signup and the reset step used to carry their own copies and had drifted —
 * reset accepted 8 characters while the API required 10, so a short password
 * passed the form and came back rejected. Both now read from here, and these
 * mirror `resetPasswordSchema` / `signupSchema` on the API.
 */
export interface PasswordRule {
  label: string;
  ok: boolean;
}

export function passwordRules(password: string): PasswordRule[] {
  return [
    { label: '10 to 50 characters', ok: password.length >= 10 && password.length <= 50 },
    { label: 'A letter', ok: /[a-zA-Z]/.test(password) },
    { label: 'A number', ok: /[0-9]/.test(password) },
  ];
}
