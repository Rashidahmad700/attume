'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { parseApiError } from '@/lib/apiError';
import { formatPrice } from '@/lib/products';
import { openCheckout, type CheckoutSuccess } from '@/lib/razorpay';
import { useValidateCartQuery } from '@/store/api/catalogueApi';
import { useGetCommerceConfigQuery } from '@/store/api/configApi';
import { usePlaceOrderMutation, useVerifyPaymentMutation } from '@/store/api/orderApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { openCart } from '@/store/slices/uiSlice';
import type { Order, OrderAddress, PaymentInit } from '@/types';
import { AddressPicker } from './AddressPicker';

const blankAddress: OrderAddress = {
  name: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export function CheckoutView() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { items, isHydrated } = useAppSelector((state) => state.cart);
  const { user, isInitialised } = useAppSelector((state) => state.auth);

  const { data, isFetching } = useValidateCartQuery(items, { skip: !isHydrated });
  const { data: config } = useGetCommerceConfigQuery();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<OrderAddress>(blankAddress);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Set the moment an order is created, so emptying the cart afterwards does
  // not trip the "bag is empty" redirect and steal the navigation.
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);
  /**
   * An online order that exists on the server but has not been paid for.
   *
   * Kept so closing the payment window is recoverable: the order and its
   * gateway order both still stand, so retrying reopens the same payment
   * rather than creating a second order for the same bag. The server releases
   * it after twenty minutes if nobody comes back.
   */
  const [awaitingPayment, setAwaitingPayment] = useState<{
    order: Order;
    payment: PaymentInit;
  } | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  // One key per checkout attempt: a double submit returns the first order
  // rather than creating a second one.
  const idempotencyKey = useMemo(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
    [],
  );

  const cart = data?.data;
  // Decided by the server on every render, so the day live keys replace test
  // ones — or the gateway is switched off — the storefront follows without a
  // rebuild. Defaults to off: never offer a payment the API would refuse.
  const onlineAvailable = config?.online.enabled ?? false;

  useEffect(() => {
    if (isInitialised && !user) router.replace('/login?redirect=/checkout');
  }, [isInitialised, user, router]);

  useEffect(() => {
    if (hasPlacedOrder) return;
    if (isHydrated && items.length === 0) router.replace('/shop');
  }, [isHydrated, items.length, hasPlacedOrder, router]);

  useEffect(() => {
    if (!user) return;
    const preferred = user.addresses.find((entry) => entry.isDefault) ?? user.addresses[0];
    if (preferred?._id) setAddressId(preferred._id);
    else setUseNewAddress(true);
  }, [user]);

  if (hasPlacedOrder || !isInitialised || !isHydrated || !user) {
    return (
      <Container className="py-14 lg:py-20">
        <LoadingAnnouncement>
          {hasPlacedOrder ? 'Confirming your order' : 'Preparing checkout'}
        </LoadingAnnouncement>
        {/* Shaped like the checkout itself, so arriving does not flash a
            different layout before the form appears. */}
        <div className="flex flex-col gap-3 border-b border-line pb-8">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-80 lg:h-12" />
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <div className="flex flex-col gap-4 border border-line bg-ivory-soft p-7 rounded-2xl">
            <Skeleton className="h-3 w-28" />
            <SkeletonText lines={3} />
            <Skeleton className="mt-2 h-12 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  const unavailable = (cart?.lines ?? []).filter((line) => !line.available);

  /**
   * Whichever address the order will ship to, in one shape for the summary.
   * A saved address carries no recipient name — that lives on the account —
   * so it is filled in here rather than rendering a nameless block.
   */
  const savedAddress = user.addresses.find((entry) => entry._id === addressId);
  const chosenAddress: OrderAddress | undefined = useNewAddress
    ? newAddress
    : savedAddress && { ...savedAddress, name: user.name };

  const validateNewAddress = () => {
    const errors: Record<string, string> = {};
    if (newAddress.name.trim().length < 2) errors.name = 'Name is required';
    if (!/^[0-9+\-\s]{7,15}$/.test(newAddress.phone ?? '')) errors.phone = 'Enter a valid phone number';
    if (newAddress.line1.trim().length < 3) errors.line1 = 'Address line 1 is required';
    if (newAddress.city.trim().length < 2) errors.city = 'City is required';
    if (newAddress.state.trim().length < 2) errors.state = 'State is required';
    if (!/^[0-9]{6}$/.test(newAddress.postalCode.trim())) errors.postalCode = 'Enter a valid 6-digit PIN code';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /** Leaves checkout for the order page. `confirming` softens the arrival when
   *  the money moved but we could not confirm it in time. */
  const goToOrder = (orderNumber: string, confirming = false) => {
    setHasPlacedOrder(true);
    dispatch(clearCart());
    router.replace(`/orders/${orderNumber}?placed=1${confirming ? '&confirming=1' : ''}`);
  };

  /**
   * Opens Razorpay for an order that already exists on the server, and reports
   * the result back.
   *
   * Nothing here decides whether the order is paid — the server verifies the
   * signature and asks Razorpay what happened. If that call fails, the customer
   * still goes to their order: the money may well have left their account, and
   * the webhook settles it within moments either way. Showing an error and
   * inviting them to pay again would be the wrong thing to do with their money.
   */
  const runCheckout = async (order: Order, payment: PaymentInit) => {
    setIsPaying(true);
    setError('');

    const onSuccess = async (response: CheckoutSuccess) => {
      try {
        await verifyPayment({
          orderNumber: order.orderNumber,
          gatewayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }).unwrap();
        goToOrder(order.orderNumber);
      } catch {
        goToOrder(order.orderNumber, true);
      }
    };

    try {
      await openCheckout({
        payment,
        order,
        customer: {
          name: user.name,
          email: user.email,
          phone: chosenAddress?.phone ?? user.phone,
        },
        onSuccess: (response) => void onSuccess(response),
        onDismiss: (reason) => {
          setIsPaying(false);
          setError(
            reason ??
              'Payment was not completed. Your order is held for twenty minutes — you can try again.',
          );
        },
      });
    } catch (caught) {
      setIsPaying(false);
      setError((caught as Error).message);
    }
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (useNewAddress && !validateNewAddress()) return;
    if (!useNewAddress && !addressId) {
      setError('Choose a delivery address');
      return;
    }

    try {
      const response = await placeOrder({
        items,
        ...(useNewAddress ? { address: newAddress, saveAddress } : { addressId: addressId! }),
        paymentMethod: 'online',
        idempotencyKey,
      }).unwrap();

      const order = response.data.order;

      // The order exists and holds its stock, but nothing is paid yet and the
      // bag stays put until it is.
      const payment = response.data.payment;
      if (!payment) {
        setError('We could not start the payment. Please try again.');
        return;
      }

      setAwaitingPayment({ order, payment });
      await runCheckout(order, payment);
    } catch (caught) {
      const parsed = parseApiError(caught);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <Container className="py-14 lg:py-20">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Checkout</span>
          <h1 className="mt-3 font-serif text-4xl font-medium text-ink lg:text-5xl">
            Complete your order
          </h1>
        </div>
        <button
          type="button"
          onClick={() => dispatch(openCart())}
          className="link-underline eyebrow text-ink"
        >
          Back to bag
        </button>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {error && (
            <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-5">
            <StepHeading number={1}>Delivery address</StepHeading>
            <AddressPicker
              addresses={user.addresses}
              selectedId={addressId}
              onSelect={(id) => {
                setAddressId(id);
                setUseNewAddress(false);
              }}
              useNewAddress={useNewAddress}
              onUseNewAddress={() => setUseNewAddress(true)}
              newAddress={newAddress}
              onNewAddressChange={setNewAddress}
              saveAddress={saveAddress}
              onSaveAddressChange={setSaveAddress}
              fieldErrors={fieldErrors}
              defaultName={user.name}
              defaultPhone={user.phone}
            />
          </div>

          <section className="flex flex-col gap-4">
            <StepHeading number={2}>Payment</StepHeading>

            {/* One method, so there is nothing to choose — a radio group with
                a single option asks the customer to confirm a decision that
                was never theirs. This states what will happen instead. */}
            {onlineAvailable ? (
              <div className="flex items-start gap-4 rounded-2xl border border-olive bg-olive/5 p-5">
                <svg
                  viewBox="0 0 24 24"
                  className="mt-0.5 h-5 w-5 shrink-0 text-olive"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  aria-hidden="true"
                >
                  <rect x="3" y="6" width="18" height="13" rx="2.5" />
                  <path d="M3 10.5h18" />
                </svg>
                <span>
                  <span className="block text-sm text-ink">UPI, cards and net banking</span>
                  <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                    Pay securely through Razorpay. Your card and UPI details are entered on their
                    page and never reach us.
                  </span>
                </span>
              </div>
            ) : (
              <p
                role="alert"
                className="rounded-2xl border border-espresso/40 bg-espresso/5 p-5 text-sm leading-relaxed text-espresso"
              >
                Payments are unavailable for a moment. Nothing has been charged and your bag is
                safe — please try again shortly, or contact us and we will take the order by hand.
              </p>
            )}
          </section>

          <button
            type="button"
            // A closed payment window leaves the order standing, so retrying
            // reopens that same payment instead of placing a second order.
            onClick={
              awaitingPayment
                ? () => void runCheckout(awaitingPayment.order, awaitingPayment.payment)
                : () => void handlePlaceOrder()
            }
            disabled={
              isPlacing || isPaying || isFetching || unavailable.length > 0 || !onlineAvailable
            }
            className="group flex items-center justify-center gap-3 rounded-xl border border-olive bg-olive px-10 py-5 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPaying
              ? 'Waiting for payment…'
              : isPlacing
                ? 'Placing order…'
                : awaitingPayment
                  ? 'Retry payment'
                  : `Pay ${formatPrice(cart?.amounts.total ?? 0)}`}
            {!isPaying && !isPlacing && (
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </div>

        <aside className="flex h-fit flex-col gap-7 rounded-2xl border border-line bg-ivory-soft p-7 shadow-[0_24px_60px_-40px_rgba(23,22,19,0.35)] lg:sticky lg:top-28 lg:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="eyebrow text-ink">Order summary</h2>
            <span className="text-xs text-ink-muted">
              {cart?.itemCount ?? items.length} {(cart?.itemCount ?? items.length) === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="flex flex-col gap-5 border-b border-line pb-7">
            {(cart?.lines ?? []).map((line) => (
              <li key={line.slug} className="flex items-center gap-4">
                <span className="relative flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-line bg-[linear-gradient(160deg,#fcfaf2_0%,#efe9d4_100%)]">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.image}
                      alt={line.name ?? line.slug}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-1 text-center font-serif text-sm lowercase text-olive">
                      {line.name ?? line.slug}
                    </span>
                  )}
                  <span className="absolute top-1.5 right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-olive px-1 text-[10px] text-ivory tabular-nums">
                    {line.quantity}
                  </span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-serif text-lg leading-tight text-ink lowercase">
                    {line.name ?? line.slug}
                  </span>
                  {(line.concentration || line.sizeMl) && (
                    <span className="text-xs text-ink-muted">
                      {[line.concentration, line.sizeMl && `${line.sizeMl} ml`]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                  <span className="text-xs text-ink-muted">
                    {formatPrice(line.price ?? 0)} × {line.quantity}
                  </span>
                </span>
                <span className="text-sm text-ink">{formatPrice(line.subtotal ?? 0)}</span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(cart?.amounts.subtotal ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-olive">
                {cart && cart.amounts.shipping > 0 ? formatPrice(cart.amounts.shipping) : 'Free'}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="text-ink">Total</dt>
              <dd className="price text-2xl font-bold text-ink">
                {formatPrice(cart?.amounts.total ?? 0)}
              </dd>
            </div>
          </dl>

          {unavailable.length > 0 && (
            <p className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-xs text-espresso">
              Something in your bag went out of stock. Return to the bag to adjust it.
            </p>
          )}

          <ul className="flex flex-col gap-3 rounded-xl bg-ivory-deep/60 p-5 text-xs text-ink-soft">
            {[
              'Secure payment through Razorpay — UPI, cards, net banking',
              'Free shipping on every order',
              'Confirmation email with your order number',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-olive text-[9px] text-ivory"
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>

          <p className="text-center text-[11px] leading-relaxed text-ink-muted">
            Prices are inclusive of all taxes.
          </p>
        </aside>
      </div>
    </Container>
  );
}

/** Numbered section title — the two parts of checkout, read top to bottom. */
function StepHeading({ number, children }: { number: number; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xs tracking-[0.16em] text-ink uppercase">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-olive text-[11px] tracking-normal text-ivory tabular-nums"
      >
        {number}
      </span>
      {children}
    </h2>
  );
}
