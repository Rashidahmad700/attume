'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { LoadingAnnouncement, Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { parseApiError } from '@/lib/apiError';
import { formatPrice } from '@/lib/products';
import { useValidateCartQuery } from '@/store/api/catalogueApi';
import { usePlaceOrderMutation } from '@/store/api/orderApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
import { openCart } from '@/store/slices/uiSlice';
import type { OrderAddress } from '@/types';
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
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<OrderAddress>(blankAddress);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  /**
   * Address first, then payment. One page rather than two routes, so a refresh
   * cannot land someone on a payment step with no address behind it.
   */
  const [step, setStep] = useState<'address' | 'payment'>('address');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Set the moment an order is created, so emptying the cart afterwards does
  // not trip the "bag is empty" redirect and steal the navigation.
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);

  // One key per checkout attempt: a double submit returns the first order
  // rather than creating a second one.
  const idempotencyKey = useMemo(
    () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
    [],
  );

  const cart = data?.data;
  // Cash on delivery carries every order; nothing about the total can close
  // checkout.
  const codAvailable = cart?.payment.codAvailable ?? true;

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

  // Cash on delivery stays selected even when it is unavailable: switching to
  // "online" would preselect a method that cannot complete, and the button is
  // disabled with an explanation instead.
  useEffect(() => {
    if (!cart) return;
    setPaymentMethod('cod');
  }, [cart]);

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

  /** The address is checked here rather than at submit, so a mistake is caught
   *  on the step that owns it instead of after the payment choice. */
  const goToPayment = () => {
    setError('');
    if (useNewAddress && !validateNewAddress()) return;
    if (!useNewAddress && !addressId) {
      setError('Choose a delivery address');
      return;
    }
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setError('');

    if (useNewAddress && !validateNewAddress()) {
      // A server-side address rejection sends us back to the step that can fix it.
      setStep('address');
      return;
    }
    if (!useNewAddress && !addressId) {
      setStep('address');
      setError('Choose a delivery address');
      return;
    }

    try {
      const response = await placeOrder({
        items,
        ...(useNewAddress ? { address: newAddress, saveAddress } : { addressId: addressId! }),
        paymentMethod,
        idempotencyKey,
      }).unwrap();

      setHasPlacedOrder(true);
      dispatch(clearCart());
      router.replace(`/orders/${response.data.order.orderNumber}?placed=1`);
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

      {/* Two steps, both on this page. The second is only reachable once the
          first is valid, so the trail is a position rather than navigation. */}
      <ol className="mt-8 flex items-center gap-3 text-xs tracking-[0.14em] uppercase">
        {(['address', 'payment'] as const).map((name, index) => {
          const isCurrent = step === name;
          const isDone = step === 'payment' && name === 'address';
          return (
            <li key={name} className="flex items-center gap-3">
              {index > 0 && <span aria-hidden="true" className="h-px w-8 bg-line" />}
              <span
                aria-current={isCurrent ? 'step' : undefined}
                className={
                  isCurrent ? 'text-olive' : isDone ? 'text-ink-muted' : 'text-ink-muted/60'
                }
              >
                <span className="mr-2 tabular-nums">{index + 1}</span>
                {name === 'address' ? 'Address' : 'Payment'}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {error && (
            <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
              {error}
            </p>
          )}

          {step === 'address' ? (
            <>
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

          <button
            type="button"
            onClick={goToPayment}
            className="self-start rounded-xl border border-olive bg-olive px-10 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive"
          >
            Continue to payment
          </button>
            </>
          ) : (
            <>
          {/* The chosen address stays visible on the payment step — it is the
              thing most worth checking before committing. */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="eyebrow text-bronze">Delivering to</h2>
              <button
                type="button"
                onClick={() => setStep('address')}
                className="link-underline eyebrow text-ink"
              >
                Change
              </button>
            </div>
            <address className="text-sm leading-relaxed text-ink-soft not-italic">
              {chosenAddress ? (
                <>
                  <span className="block text-ink">{chosenAddress.name}</span>
                  {chosenAddress.line1}
                  {chosenAddress.line2 ? `, ${chosenAddress.line2}` : ''}
                  <br />
                  {chosenAddress.city}, {chosenAddress.state} {chosenAddress.postalCode}
                  <br />
                  {chosenAddress.country}
                  {chosenAddress.phone ? ` · ${chosenAddress.phone}` : ''}
                </>
              ) : null}
            </address>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="eyebrow text-bronze">Payment</h2>

            <label
              className={`flex cursor-pointer items-start gap-4 border p-5 ${
                paymentMethod === 'cod' ? 'border-olive bg-olive/5' : 'border-line'
              } ${!codAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'cod'}
                disabled={!codAvailable}
                onChange={() => setPaymentMethod('cod')}
                className="mt-1 h-4 w-4 accent-olive"
              />
              <span>
                <span className="block text-sm text-ink">Cash on delivery</span>
                <span className="mt-1 block text-xs text-ink-muted">
                  {codAvailable
                    ? 'Pay the courier when the parcel arrives.'
                    : 'Unavailable for this order.'}
                </span>
              </span>
            </label>

            <label className="flex cursor-not-allowed items-start gap-4 border border-line p-5 opacity-60 rounded-2xl">
              <input type="radio" name="payment" disabled className="mt-1 h-4 w-4" />
              <span>
                <span className="block text-sm text-ink">
                  UPI, cards and net banking
                  <span className="ml-2 border border-line px-2 py-0.5 text-[10px] tracking-[0.12em] text-ink-muted uppercase rounded-2xl">
                    Coming soon
                  </span>
                </span>
                <span className="mt-1 block text-xs text-ink-muted">
                  Online payment goes live once the gateway is connected.
                </span>
              </span>
            </label>
          </section>
            </>
          )}
        </div>

        <aside className="flex h-fit flex-col gap-6 border border-line bg-ivory-soft p-7 lg:sticky lg:top-28 rounded-2xl">
          <h2 className="eyebrow text-ink">Order summary</h2>

          <ul className="flex flex-col gap-4 border-b border-line pb-5">
            {(cart?.lines ?? []).map((line) => (
              <li key={line.slug} className="flex justify-between gap-4 text-sm">
                <span className="text-ink">
                  {line.name ?? line.slug}
                  <span className="text-ink-muted"> × {line.quantity}</span>
                </span>
                <span className="text-ink">{formatPrice(line.subtotal ?? 0)}</span>
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{formatPrice(cart?.amounts.subtotal ?? 0)}</dd>
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

          {/* Only offered on the payment step — placing an order is not an
              action that should be reachable before the address is settled. */}
          {step === 'payment' ? (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isPlacing || isFetching || unavailable.length > 0}
              className="rounded-xl border border-olive bg-olive px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ivory hover:text-olive disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlacing ? 'Placing order…' : 'Place order'}
            </button>
          ) : (
            <p className="text-center text-xs text-ink-muted">
              Confirm your address to continue.
            </p>
          )}

          <p className="text-center text-[11px] leading-relaxed text-ink-muted">
            Inclusive of all taxes. You will receive a confirmation with your order number.
          </p>
        </aside>
      </div>
    </Container>
  );
}
