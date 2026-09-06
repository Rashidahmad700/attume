'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useAddAddressMutation, useUpdateAddressMutation } from '@/store/api/userApi';
import type { Address } from '@/types';

const empty = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  phone: '',
  isDefault: false,
};

export function AddressForm({
  address,
  isFirstAddress,
  onDone,
  onCancel,
}: {
  address?: Address;
  isFirstAddress: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(address?._id);
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const isLoading = isAdding || isUpdating;

  const [form, setForm] = useState({
    ...empty,
    ...(address
      ? {
          label: address.label ?? '',
          line1: address.line1,
          line2: address.line2 ?? '',
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone ?? '',
          isDefault: address.isDefault,
        }
      : {}),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const set = (key: keyof typeof form) => (value: string) => setForm({ ...form, [key]: value });

  // Mirrors the zod schema on the API.
  const validate = () => {
    const errors: Record<string, string> = {};
    if (form.line1.trim().length < 3) errors.line1 = 'Address line 1 is required';
    if (form.city.trim().length < 2) errors.city = 'City is required';
    if (form.state.trim().length < 2) errors.state = 'State is required';
    if (!/^[0-9]{6}$/.test(form.postalCode.trim())) errors.postalCode = 'Enter a valid 6-digit PIN code';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    const payload = {
      label: form.label.trim() || undefined,
      line1: form.line1.trim(),
      line2: form.line2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim() || 'India',
      phone: form.phone.trim() || undefined,
      isDefault: form.isDefault || isFirstAddress,
    };

    try {
      if (isEdit && address?._id) {
        await updateAddress({ id: address._id, body: payload }).unwrap();
      } else {
        await addAddress(payload).unwrap();
      }
      onDone();
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 border border-line bg-ivory-soft p-6 sm:p-8"
    >
      <h3 className="font-serif text-2xl font-light text-ink">
        {isEdit ? 'Edit address' : 'Add a new address'}
      </h3>

      {formError && (
        <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
          {formError}
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Input
          label="Label (optional)"
          name="label"
          placeholder="Home, Office…"
          value={form.label}
          onChange={(event) => set('label')(event.target.value)}
          error={fieldErrors.label}
        />
        <Input
          label="Phone for this address (optional)"
          name="phone"
          type="tel"
          placeholder="+91 00000 00000"
          value={form.phone}
          onChange={(event) => set('phone')(event.target.value)}
          error={fieldErrors.phone}
        />
      </div>

      <Input
        label="Address line 1"
        name="line1"
        placeholder="House / flat, street"
        value={form.line1}
        onChange={(event) => set('line1')(event.target.value)}
        error={fieldErrors.line1}
      />
      <Input
        label="Address line 2 (optional)"
        name="line2"
        placeholder="Area, landmark"
        value={form.line2}
        onChange={(event) => set('line2')(event.target.value)}
        error={fieldErrors.line2}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        <Input
          label="City"
          name="city"
          value={form.city}
          onChange={(event) => set('city')(event.target.value)}
          error={fieldErrors.city}
        />
        <Input
          label="State"
          name="state"
          value={form.state}
          onChange={(event) => set('state')(event.target.value)}
          error={fieldErrors.state}
        />
        <Input
          label="PIN code"
          name="postalCode"
          inputMode="numeric"
          maxLength={6}
          value={form.postalCode}
          onChange={(event) => set('postalCode')(event.target.value)}
          error={fieldErrors.postalCode}
        />
      </div>

      <Input
        label="Country"
        name="country"
        value={form.country}
        onChange={(event) => set('country')(event.target.value)}
        error={fieldErrors.country}
      />

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.isDefault || isFirstAddress}
          disabled={isFirstAddress}
          onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
          className="h-4 w-4 accent-[#4f5a20]"
        />
        <span>
          Use as default delivery address
          {isFirstAddress && <span className="text-ink-muted"> — your first address</span>}
        </span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? 'Saving…' : isEdit ? 'Save address' : 'Add address'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
