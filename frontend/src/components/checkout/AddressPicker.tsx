'use client';

import { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import type { Address, OrderAddress } from '@/types';

interface Props {
  addresses: Address[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  useNewAddress: boolean;
  onUseNewAddress: () => void;
  newAddress: OrderAddress;
  onNewAddressChange: (address: OrderAddress) => void;
  saveAddress: boolean;
  onSaveAddressChange: (value: boolean) => void;
  fieldErrors: Record<string, string>;
  defaultName: string;
  defaultPhone?: string;
}

/** Saved addresses as selectable cards, with an inline form for a new one. */
export function AddressPicker({
  addresses,
  selectedId,
  onSelect,
  useNewAddress,
  onUseNewAddress,
  newAddress,
  onNewAddressChange,
  saveAddress,
  onSaveAddressChange,
  fieldErrors,
  defaultName,
  defaultPhone,
}: Props) {
  // Pre-fill the new-address form from the account, so most people only type
  // the street and PIN.
  useEffect(() => {
    if (!useNewAddress) return;
    if (newAddress.name === '' || newAddress.phone === '') {
      onNewAddressChange({
        ...newAddress,
        name: newAddress.name || defaultName,
        phone: newAddress.phone || defaultPhone || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useNewAddress]);

  const set = (key: keyof OrderAddress, value: string) =>
    onNewAddressChange({ ...newAddress, [key]: value });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="eyebrow text-bronze">Delivery address</h2>

      {addresses.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {addresses.map((address) => {
            const isSelected = !useNewAddress && selectedId === address._id;
            return (
              <li key={address._id}>
                <label
                  className={`flex h-full cursor-pointer gap-4 border p-5 transition-colors ${
                    isSelected ? 'border-olive bg-olive/5' : 'border-line hover:border-ink/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={isSelected}
                    onChange={() => onSelect(address._id!)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#4f5a20]"
                  />
                  <span className="text-sm leading-relaxed">
                    <span className="eyebrow block text-ink-muted">
                      {address.label || 'Address'}
                      {address.isDefault && <span className="ml-2 text-olive">Default</span>}
                    </span>
                    <span className="mt-2 block text-ink">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postalCode}
                      {address.phone && (
                        <>
                          <br />
                          <span className="text-ink-muted">{address.phone}</span>
                        </>
                      )}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {!useNewAddress ? (
        <button
          type="button"
          onClick={onUseNewAddress}
          className="self-start border border-line px-5 py-3 text-[11px] tracking-[0.14em] text-ink uppercase hover:border-ink"
        >
          Deliver somewhere else
        </button>
      ) : (
        <div className="flex flex-col gap-6 border border-line p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm text-ink">New delivery address</h3>
            {addresses.length > 0 && selectedId && (
              <button
                type="button"
                onClick={() => onSelect(selectedId)}
                className="eyebrow text-ink-muted hover:text-ink"
              >
                Use a saved address
              </button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              label="Full name"
              name="name"
              value={newAddress.name}
              onChange={(event) => set('name', event.target.value)}
              error={fieldErrors.name}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={newAddress.phone ?? ''}
              onChange={(event) => set('phone', event.target.value)}
              error={fieldErrors.phone}
              hint="The courier calls this number."
            />
          </div>

          <Input
            label="Address line 1"
            name="line1"
            placeholder="House / flat, street"
            value={newAddress.line1}
            onChange={(event) => set('line1', event.target.value)}
            error={fieldErrors.line1}
          />
          <Input
            label="Address line 2 (optional)"
            name="line2"
            placeholder="Area, landmark"
            value={newAddress.line2 ?? ''}
            onChange={(event) => set('line2', event.target.value)}
          />

          <div className="grid gap-6 sm:grid-cols-3">
            <Input
              label="City"
              name="city"
              value={newAddress.city}
              onChange={(event) => set('city', event.target.value)}
              error={fieldErrors.city}
            />
            <Input
              label="State"
              name="state"
              value={newAddress.state}
              onChange={(event) => set('state', event.target.value)}
              error={fieldErrors.state}
            />
            <Input
              label="PIN code"
              name="postalCode"
              inputMode="numeric"
              maxLength={6}
              value={newAddress.postalCode}
              onChange={(event) => set('postalCode', event.target.value)}
              error={fieldErrors.postalCode}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(event) => onSaveAddressChange(event.target.checked)}
              className="h-4 w-4 accent-[#4f5a20]"
            />
            Save this address to my account
          </label>
        </div>
      )}
    </section>
  );
}
