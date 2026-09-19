import { env } from '../config/env.js';

export interface Mail {
  to: string;
  subject: string;
  /** Always required: the plain-text part is what a client that refuses HTML
   *  shows, and what a spam filter reads when it distrusts the markup. */
  text: string;
  html?: string;
}

/**
 * Sends through Resend when an API key is configured, and otherwise prints the
 * message to the terminal. Printing is deliberate: during development the sign-in
 * link has to be reachable, and a silent no-op would look like a broken feature.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.log(
      [
        '',
        '─────────── email (no provider configured) ───────────',
        `to:      ${mail.to}`,
        `subject: ${mail.subject}`,
        '',
        mail.text,
        '──────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    );
    // Printed, not delivered — the caller must not report this as sent.
    return false;
  }

  let response: Response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.MAIL_FROM,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
        ...(mail.html ? { html: mail.html } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    // A network failure or timeout must not become a 500 for the caller.
    console.error('[mail] send failed', error);
    return false;
  }

  if (!response.ok) {
    // Never surface the provider's error to the caller — that would tell an
    // attacker whether the address exists.
    console.error('[mail] send failed', response.status, await response.text());
    return false;
  }

  return true;
}
