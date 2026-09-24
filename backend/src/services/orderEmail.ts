import { env } from '../config/env.js';
import type { IOrder, IOrderAddress } from '../models/order.model.js';

/**
 * The order confirmation, as HTML.
 *
 * Written the way email has to be written rather than the way the site is:
 * tables for layout, every style inline, no web fonts, nothing external but
 * the product images. Outlook still renders with Word's engine, which ignores
 * flexbox, grid, and most of a stylesheet.
 *
 * Colours are the attume palette by hand, because a `<style>` block is the
 * first thing Gmail strips when it clips a long message.
 */

const INK = '#171613';
const INK_SOFT = '#2b2925';
const INK_MUTED = '#6f6a5f';
const IVORY = '#f7f3e3';
const IVORY_SOFT = '#fcfaf2';
const LINE = '#ddd5bd';
const OLIVE = '#4f5a20';
/**
 * No web fonts: Gmail strips @font-face and Outlook never had it. The serif is
 * used only for the wordmark and the greeting; everything else is the system
 * UI stack, which is what the reference design reads as.
 */
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

/** Indian grouping, so ₹1,49,900 reads the way the shop prints it. */
const rupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

/**
 * Anything interpolated into the markup goes through this. A product renamed
 * to include an ampersand, or an address line holding a quote, would otherwise
 * break the surrounding tag.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Product images are stored as site-relative paths; email needs absolute ones.
 * Resolved against the asset host rather than the link host, so a development
 * inbox can still show real pictures while its buttons point at localhost.
 */
function absoluteUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = env.EMAIL_ASSET_BASE_URL || env.STOREFRONT_URL;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function addressBlock(address: IOrderAddress): string {
  const lines = [
    address.name,
    address.line1,
    address.line2,
    `${address.postalCode} ${address.city} ${address.state}`,
    address.country,
    address.phone,
  ].filter((line): line is string => Boolean(line && line.trim()));

  return lines
    .map(
      (line) =>
        `<div style="margin:0 0 2px;font-family:${SANS};color:${INK_MUTED};font-size:14px;line-height:22px;">${escapeHtml(line)}</div>`,
    )
    .join('');
}

function itemRow(item: IOrder['items'][number]): string {
  const image = absoluteUrl(item.image);
  const thumb = image
    ? `<img src="${escapeHtml(image)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:cover;border:1px solid ${LINE};border-radius:6px;background:${IVORY_SOFT};" />`
    : `<div style="width:64px;height:64px;border:1px solid ${LINE};border-radius:6px;background:${IVORY_SOFT};"></div>`;

  return `
  <tr>
    <td style="padding:18px 0;border-bottom:1px solid ${LINE};vertical-align:top;width:64px;">${thumb}</td>
    <td style="padding:18px 0 18px 16px;border-bottom:1px solid ${LINE};vertical-align:top;font-family:${SANS};">
      <div style="margin:0 0 4px;color:${INK};font-size:15px;font-weight:700;line-height:21px;">
        ${escapeHtml(item.name)} &times; ${item.quantity}
      </div>
      <div style="color:${INK_MUTED};font-size:13px;line-height:19px;">${escapeHtml(item.sku)}</div>
    </td>
    <td style="padding:18px 0;border-bottom:1px solid ${LINE};vertical-align:top;text-align:right;white-space:nowrap;font-family:${SANS};">
      <div style="color:${INK};font-size:15px;font-weight:700;line-height:21px;">${rupees(item.subtotal)}</div>
      ${
        item.quantity > 1
          ? `<div style="color:${INK_MUTED};font-size:12px;line-height:18px;">${rupees(item.price)} each</div>`
          : ''
      }
    </td>
  </tr>`;
}

function totalRow(label: string, value: string, strong = false): string {
  return `
  <tr>
    <td style="padding:5px 0;font-family:${SANS};color:${strong ? INK : INK_MUTED};font-size:${strong ? '16px' : '14px'};line-height:22px;">${escapeHtml(label)}</td>
    <td style="padding:5px 0;text-align:right;font-family:${SANS};color:${INK};font-size:${strong ? '20px' : '14px'};font-weight:700;line-height:26px;white-space:nowrap;">${escapeHtml(value)}</td>
  </tr>`;
}

export function renderOrderEmailHtml(order: IOrder): string {
  const { orderNumber, customer, amounts, shippingAddress } = order;
  const payment = order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Paid online';
  const orderUrl = `${env.STOREFRONT_URL}/orders/${encodeURIComponent(orderNumber)}`;
  const shopUrl = `${env.STOREFRONT_URL}/shop`;
  const firstName = escapeHtml(customer.name.trim().split(/\s+/)[0]);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Your attume order ${escapeHtml(orderNumber)}</title>
</head>
<body style="margin:0;padding:0;background:${IVORY};font-family:${SANS};">
  <!-- Shown in the inbox list under the subject, so it is not a stray line of markup. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Order ${escapeHtml(orderNumber)} is confirmed — ${escapeHtml(rupees(amounts.total))}, ${escapeHtml(payment.toLowerCase())}.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${IVORY};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:10px;">

          <tr>
            <td style="padding:32px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${SERIF};font-size:26px;letter-spacing:1px;color:${INK};">attume</td>
                  <td style="text-align:right;font-family:${SANS};color:${INK_MUTED};font-size:12px;letter-spacing:1.4px;text-transform:uppercase;">Order ${escapeHtml(orderNumber)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 0;">
              <h1 style="margin:0 0 10px;font-family:${SERIF};font-size:30px;line-height:38px;font-weight:400;color:${INK};">
                Thank you, ${firstName}.
              </h1>
              <p style="margin:0;color:${INK_SOFT};font-size:15px;line-height:24px;">
                Your order is confirmed. We are preparing it now and will write again the moment it ships.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${OLIVE};border-radius:8px;">
                    <a href="${escapeHtml(orderUrl)}" style="display:inline-block;padding:14px 30px;color:${IVORY};font-size:12px;letter-spacing:1.6px;text-transform:uppercase;text-decoration:none;font-weight:700;">View your order</a>
                  </td>
                  <td style="padding-left:18px;color:${INK_MUTED};font-size:14px;">
                    or <a href="${escapeHtml(shopUrl)}" style="color:${OLIVE};text-decoration:underline;">visit the shop</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 0;">
              <div style="color:${INK_MUTED};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;">Order summary</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                ${order.items.map(itemRow).join('')}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td></td><td width="260">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${totalRow('Subtotal', rupees(amounts.subtotal))}
                    <tr><td colspan="2" style="padding-top:8px;border-top:1px solid ${LINE};"></td></tr>
                    ${totalRow(order.paymentMethod === 'cod' ? 'Due on delivery' : 'Total', rupees(amounts.total), true)}
                  </table>
                </td></tr>
              </table>
              <p style="margin:10px 0 0;text-align:right;color:${INK_MUTED};font-size:12px;">Inclusive of all taxes.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 0;">
              <div style="border-top:1px solid ${LINE};padding-top:24px;">
                <div style="color:${INK_MUTED};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;font-weight:700;margin-bottom:14px;">Customer information</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="vertical-align:top;padding-right:12px;">
                      <div style="margin:0 0 6px;color:${INK};font-size:14px;font-weight:700;">Shipping address</div>
                      ${addressBlock(shippingAddress)}
                    </td>
                    <td width="50%" style="vertical-align:top;padding-left:12px;">
                      <div style="margin:0 0 6px;color:${INK};font-size:14px;font-weight:700;">Billing address</div>
                      ${addressBlock(shippingAddress)}
                    </td>
                  </tr>
                  <tr>
                    <td style="vertical-align:top;padding-top:22px;padding-right:12px;">
                      <div style="margin:0 0 6px;color:${INK};font-size:14px;font-weight:700;">Payment</div>
                      <div style="color:${INK_MUTED};font-size:14px;line-height:22px;">${escapeHtml(payment)}</div>
                    </td>
                    <td style="vertical-align:top;padding-top:22px;padding-left:12px;">
                      <div style="margin:0 0 6px;color:${INK};font-size:14px;font-weight:700;">Delivery</div>
                      <div style="color:${INK_MUTED};font-size:14px;line-height:22px;">Free shipping</div>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px;">
              <div style="border-top:1px solid ${LINE};padding-top:20px;color:${INK_MUTED};font-size:12px;line-height:20px;">
                Questions about this order? Write to
                <a href="mailto:${escapeHtml(env.ADMIN_NOTIFY_EMAIL)}" style="color:${OLIVE};text-decoration:underline;">${escapeHtml(env.ADMIN_NOTIFY_EMAIL)}</a>
                quoting ${escapeHtml(orderNumber)}.
                <div style="margin-top:12px;">attume — small-batch extraits, New Delhi.</div>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
