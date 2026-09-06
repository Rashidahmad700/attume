'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useUpdateProfileMutation } from '@/store/api/userApi';
import type { User } from '@/types';
import { DetailRow } from './DetailRow';

export function ProfileDetails({ user }: { user: User }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const defaultAddress = user.addresses.find((address) => address.isDefault);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
      }).unwrap();
      setIsEditing(false);
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <section className="border border-line bg-ivory-soft">
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
        <h2 className="eyebrow text-ink">Account details</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="link-underline eyebrow text-olive"
          >
            Edit
          </button>
        )}
      </header>

      <div className="px-6 py-2 sm:px-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 py-6">
            {formError && (
              <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
                {formError}
              </p>
            )}

            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              error={fieldErrors.name}
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              placeholder="+91 00000 00000"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              error={fieldErrors.phone}
            />

            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="sm" disabled={isLoading}>
                {isLoading ? 'Saving…' : 'Save changes'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setForm({ name: user.name, phone: user.phone ?? '' });
                  setFieldErrors({});
                  setFormError('');
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="flex flex-col">
            <DetailRow label="Name">{user.name}</DetailRow>
            <DetailRow label="Email">{user.email}</DetailRow>
            <DetailRow label="Phone">
              {user.phone || <span className="text-ink-muted">Not added</span>}
            </DetailRow>
            <DetailRow label="Default address">
              {defaultAddress ? (
                <span>
                  {[defaultAddress.line1, defaultAddress.line2, defaultAddress.city]
                    .filter(Boolean)
                    .join(', ')}{' '}
                  — {defaultAddress.postalCode}
                </span>
              ) : (
                <span className="text-ink-muted">No address saved</span>
              )}
            </DetailRow>
            <DetailRow label="Member since">
              {new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </DetailRow>
          </dl>
        )}
      </div>
    </section>
  );
}
