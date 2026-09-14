import { env } from '../config/env.js';

export interface WhatsAppMessage {
  /** Any format the customer typed; normalised before sending. */
  to: string;
  text: string;
  /** Named for the log line when no provider is configured. */
  label?: string;
  /**
   * An approved template. Required for a message to someone who has not
   * written to the business in the last 24 hours — which is every customer
   * being confirmed — so free text is only reliable for the shop's own number.
   */
  template?: { name: string; language?: string; params?: string[] };
}

/**
 * Normalises an Indian number to the digits WhatsApp expects: country code,
 * no plus, no spaces or dashes. Returns null for anything that cannot be one.
 */
export function toWhatsAppNumber(input: string | undefined): string | null {
  if (!input) return null;
  const digits = input.replace(/\D/g, '');

  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  // Already carries some other country code.
  if (digits.length > 10 && digits.length <= 15) return digits;
  return null;
}

/**
 * Sends through the WhatsApp Cloud API when it is configured, and otherwise
 * prints the message. Printing rather than failing silently is deliberate: the
 * rest of the flow must not break because a channel is not set up yet, but the
 * message still has to be visible to whoever is testing.
 *
 * Business-initiated messages to a customer need an approved template. Free-form
 * text only reaches someone inside the 24-hour window after they message the
 * business — which is why the admin number, having opted in, gets plain text
 * and the customer gets a template when one is configured.
 */
export async function sendWhatsApp(message: WhatsAppMessage): Promise<boolean> {
  const to = toWhatsAppNumber(message.to);
  if (!to) {
    console.warn(`[whatsapp] skipped ${message.label ?? 'message'}: unusable number`);
    return false;
  }

  if (!env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    // One line, not the whole message: this path runs on every pre-booking
    // while automation is off, and a banner each time would bury the log.
    console.log(`[whatsapp] not configured — skipped ${message.label ?? 'message'} to +${to}`);
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          message.template
            ? {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                  name: message.template.name,
                  language: { code: message.template.language ?? 'en' },
                  components: message.template.params?.length
                    ? [
                        {
                          type: 'body',
                          parameters: message.template.params.map((text) => ({
                            type: 'text',
                            text,
                          })),
                        },
                      ]
                    : undefined,
                },
              }
            : {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { preview_url: false, body: message.text },
              },
        ),
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[whatsapp] send failed (${response.status}): ${detail.slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[whatsapp] send failed:', (error as Error).message);
    return false;
  }
}

/** A click-to-chat link, for putting a conversation in someone's hands without an API. */
export function whatsAppLink(number: string, text: string): string | null {
  const to = toWhatsAppNumber(number);
  return to ? `https://wa.me/${to}?text=${encodeURIComponent(text)}` : null;
}
