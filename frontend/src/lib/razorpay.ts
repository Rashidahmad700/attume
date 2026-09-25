/**
 * Loading and opening Razorpay Checkout.
 *
 * Checkout is an overlay served by Razorpay: card and UPI details are typed
 * into their frame, on their origin, and never touch this application. That is
 * deliberate and is what keeps card data out of our hands entirely.
 *
 * The script is fetched on demand rather than in the layout, so a shopper
 * browsing fragrances is not made to download a payment SDK.
 */
import type { Order, PaymentInit } from '@/types';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** What Checkout hands back on success. */
export interface CheckoutSuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

/** Resolves once the SDK is on the page. Concurrent calls share one load. */
export function loadRazorpay(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in a browser'));
  if (window.Razorpay) return Promise.resolve();

  loading ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement('script');

    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      // Cleared so a shopper who lost their connection for a moment can retry
      // rather than being stuck with a permanently rejected promise.
      loading = null;
      reject(new Error('Could not load the payment window'));
    });

    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return loading;
}

export interface OpenCheckoutArgs {
  payment: PaymentInit;
  order: Order;
  customer: { name: string; email: string; phone?: string };
  onSuccess: (response: CheckoutSuccess) => void;
  /** The customer closed the overlay, or the attempt failed. */
  onDismiss: (reason?: string) => void;
}

/**
 * Opens the overlay for an order that already exists on the server.
 *
 * The amount is not passed from here — it is fixed on Razorpay's side when the
 * gateway order was created, so nothing the browser does can change what is
 * charged. It is sent only because Checkout displays it.
 */
export async function openCheckout(args: OpenCheckoutArgs): Promise<void> {
  await loadRazorpay();

  if (!window.Razorpay) throw new Error('Could not load the payment window');
  if (!args.payment.keyId) throw new Error('Online payment is unavailable');

  const checkout = new window.Razorpay({
    key: args.payment.keyId,
    order_id: args.payment.gatewayOrderId,
    amount: args.payment.amount,
    currency: args.payment.currency,
    name: 'attume',
    description: `Order ${args.order.orderNumber}`,
    image: '/icon.png',
    prefill: {
      name: args.customer.name,
      email: args.customer.email,
      contact: args.customer.phone ?? '',
    },
    notes: { orderNumber: args.order.orderNumber },
    theme: { color: '#5a6250' },
    handler: (response: CheckoutSuccess) => args.onSuccess(response),
    modal: {
      // The order stays pending on the server and can be paid again from the
      // order page. Nothing is cancelled because someone closed a window.
      ondismiss: () => args.onDismiss(),
      escape: true,
    },
  });

  checkout.on('payment.failed', (response: unknown) => {
    const described = response as { error?: { description?: string } };
    args.onDismiss(described.error?.description ?? 'The payment did not go through');
  });

  checkout.open();
}
