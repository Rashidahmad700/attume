import { env } from '../config/env.js';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends through Resend when an API key is configured, and otherwise prints the
 * message to the terminal. Printing is deliberate: during development the sign-in
 * link has to be reachable, and a silent no-op would look like a broken feature.
 */
export async function sendMail(mail: Mail): Promise<void> {
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
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
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
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    // Never surface the provider's error to the caller — that would tell an
    // attacker whether the address exists.
    console.error('[mail] send failed', response.status, await response.text());
  }
}
