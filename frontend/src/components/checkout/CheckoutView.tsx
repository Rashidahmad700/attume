'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { parseApiError } from '@/lib/apiError';
import { formatPrice } from '@/lib/products';
import { useValidateCartQuery } from '@/store/api/catalogueApi';
import { usePlaceOrderMutation } from '@/store/api/orderApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearCart } from '@/store/slices/cartSlice';
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
  const codAvailable = cart?.payment.codAvailable ?? false;

  useEffect(() => {
    if (isInitialised && !user) router.replace('/login?redirect=/checkout');
  }, [isInitialised, user, router]);

  useEffect(() => {
    if (hasPlacedOrder) return;
    if (isHydrated && items.length === 0) router.replace('/cart');
  }, [isHydrated, items.length, hasPlacedOrder, router]);

  useEffect(() => {
    if (!user) return;
    const preferred = user.addresses.find((entry) => entry.isDefault) ?? user.addresses[0];
    if (preferred?._id) setAddressId(preferred._id);
    else setUseNewAddress(true);
  }, [user]);

  // Only reconsider the payment method once the cart has actually been priced —
  // before that codAvailable is false simply because nothing has loaded.
  useEffect(() => {
    if (!cart) return;
    setPaymentMethod(cart.payment.codAvailable ? 'cod' : 'online');
  }, [cart]);

  if (hasPlacedOrder) {
    return (
      <Container className="py-28">
        <p className="eyebrow text-ink-muted">Confirming your order…</p>
      </Container>
    );
  }

  if (!isInitialised || !isHydrated || !user) {
    return (
      <Container className="py-28">
        <p className="eyebrow text-ink-muted">Preparing checkout…</p>
      </Container>
    );
  }

  const unavailable = (cart?.lines ?? []).filter((line) => !line.available);

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
          <h1 className="mt-3 font-serif text-4xl font-light text-ink lg:text-5xl">
            Complete your order
          </h1>
        </div>
        <Link href="/cart" className="link-underline eyebrow text-ink">
          Back to bag
        </Link>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
        <div className="flex flex-col gap-10">
          {error && (
            <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
              {error}
            </p>
          )}

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
                className="mt-1 h-4 w-4 accent-[#4f5a20]"
              />
              <span>
                <span className="block text-sm text-ink">Cash on delivery</span>
                <span className="mt-1 block text-xs text-ink-muted">
                  {codAvailable
                    ? 'Pay the courier when the parcel arrives.'
                    : `Available on orders above ${formatPrice(cart?.payment.codMinOrderValue ?? 999)}.`}
                </span>
              </span>
            </label>

            <label className="flex cursor-not-allowed items-start gap-4 border border-line p-5 opacity-60">
              <input type="radio" name="payment" disabled className="mt-1 h-4 w-4" />
              <span>
                <span className="block text-sm text-ink">
                  UPI, cards and net banking
                  <span className="ml-2 border border-line px-2 py-0.5 text-[10px] tracking-[0.12em] text-ink-muted uppercase">
                    Coming soon
                  </span>
                </span>
                <span className="mt-1 block text-xs text-ink-muted">
                  Online payment goes live once the gateway is connected.
                </span>
              </span>
            </label>
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-6 border border-line bg-ivory-soft p-7 lg:sticky lg:top-28">
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
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className="text-ink">
                {cart?.amounts.shipping === 0
                  ? 'Complimentary'
                  : formatPrice(cart?.amounts.shipping ?? 0)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base">
              <dt className="text-ink">Total</dt>
              <dd className="font-serif text-2xl font-light text-ink">
                {formatPrice(cart?.amounts.total ?? 0)}
              </dd>
            </div>
          </dl>

          {unavailable.length > 0 && (
            <p className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-xs text-espresso">
              Something in your bag went out of stock. Return to the bag to adjust it.
            </p>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPlacing || isFetching || unavailable.length > 0}
            className="bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlacing ? 'Placing order…' : 'Place order'}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-ink-muted">
            Inclusive of all taxes. You will receive a confirmation with your order number.
          </p>
        </aside>
      </div>
    </Container>
  );
}
