'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { checkEmail } from '@/lib/validateEmail';
import { checkName, checkPhone, digitsOnly } from '@/lib/validatePhone';
import { useCreatePrebookingMutation } from '@/store/api/prebookingApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openAuth } from '@/store/slices/uiSlice';

export type PrebookSource = 'product' | 'restock';

interface PrebookFormProps {
  /** Omitted for a plain list sign-up that is not about one fragrance. */
  slug?: string;
  productName?: string;
  source?: PrebookSource;
  heading?: string;
  blurb?: string;
  maxQuantity?: number;
  compact?: boolean;
  onDone?: () => void;
}

/**
 * Captures a pre-booking.
 *
 * A pre-booking is an expression of interest — not a purchase, and not an
 * account. Nothing is charged and nothing is registered beyond a name and a
 * way to be reached, which the form says outright: a shopper cannot otherwise
 * tell what handing over an email address will do.
 *
 * A signed-in customer is not asked for what their account already holds; the
 * fields arrive filled and they confirm.
 */
export function PrebookForm({
  slug,
  productName,
  source = 'product',
  heading,
  blurb,
  maxQuantity = 5,
  compact = false,
  onDone,
}: PrebookFormProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [createPrebooking, { isLoading }] = useCreatePrebookingMutation();

  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', quantity: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ message: string; already: boolean } | null>(null);

  // The session arrives after hydration, so the fields follow it rather than
  // being seeded once from an empty store.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      name: current.name || user.name,
      email: current.email || user.email,
      phone: current.phone || digitsOnly(user.phone ?? ''),
    }));
  }, [user]);

  useEffect(() => {
    if (result) onDone?.();
  }, [result, onDone]);

  const validate = () => {
    const next: Record<string, string> = {};
    const nameError = checkName(form.name);
    if (nameError) next.name = nameError;
    const emailError = checkEmail(form.email);
    if (emailError) next.email = emailError;
    // Optional here: a pre-booking needs one way to reach someone, not two.
    if (form.phone.trim()) {
      const phoneError = checkPhone(form.phone);
      if (phoneError) next.phone = phoneError;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    if (!validate()) return;

    try {
      const response = await createPrebooking({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        city: form.city.trim() || undefined,
        quantity: form.quantity,
        slug,
        source,
      }).unwrap();

      setResult({
        message: response.message ?? 'You are on the list.',
        already: Boolean(response.data?.alreadyPrebooked),
      });
    } catch (error) {
      const parsed = error as { data?: { message?: string; errors?: Record<string, string[]> } };
      const fieldErrors = parsed.data?.errors;
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors(
          Object.fromEntries(Object.entries(fieldErrors).map(([key, value]) => [key, value[0]])),
        );
      } else {
        setErrors({ email: parsed.data?.message ?? 'Something went wrong. Please try again.' });
      }
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-3 border border-olive/40 bg-olive/5 p-6 text-center">
        <p className="font-serif text-xl font-medium text-olive">
          {result.already ? 'You are already on the list' : 'You are on the list'}
        </p>
        <p className="text-sm text-ink-muted">{result.message}</p>
        <p className="text-xs text-ink-muted">
          No payment has been taken and no account was created. We will write to you before
          anything ships.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {heading && <h2 className="font-serif text-2xl font-medium text-ink">{heading}</h2>}
      {blurb && <p className="text-sm leading-relaxed text-ink-muted">{blurb}</p>}

      <div className={compact ? 'grid gap-4 sm:grid-cols-2' : 'flex flex-col gap-5'}>
        <Input
          label="Name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value.replace(/[0-9]/g, '') })}
          error={errors.name}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          error={errors.email}
        />

        <Input
          label="Contact number (optional)"
          name="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          placeholder="98765 43210"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: digitsOnly(event.target.value) })}
          error={errors.phone}
        />

        <Input
          label="City (optional)"
          name="city"
          autoComplete="address-level2"
          placeholder="New Delhi"
          value={form.city}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
        />
      </div>

      {slug && (
        <label className="flex items-center gap-4">
          <span className="eyebrow text-ink-muted">Bottles</span>
          <div className="flex items-center border border-line">
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
              disabled={form.quantity <= 1}
              aria-label="Fewer bottles"
              className="px-4 py-2 text-ink disabled:opacity-30"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{form.quantity}</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, quantity: Math.min(maxQuantity, form.quantity + 1) })}
              disabled={form.quantity >= maxQuantity}
              aria-label="More bottles"
              className="px-4 py-2 text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
        </label>
      )}

      <Button type="submit" size="lg" fullWidth disabled={isLoading}>
        {isLoading ? 'Sending…' : productName ? `Pre-book ${productName}` : 'Join the list'}
      </Button>

      {/* Said plainly: handing over an email is otherwise ambiguous. */}
      <p className="text-xs leading-relaxed text-ink-muted">
        This saves your details for this launch only. No payment is taken and no account is created.
        {!user && (
          <>
            {' '}
            <button
              type="button"
              onClick={() => dispatch(openAuth('signup'))}
              className="link-underline font-semibold text-olive"
            >
              Create an account
            </button>{' '}
            if you would rather we kept them for next time.
          </>
        )}
      </p>

      {user && (
        <p className="text-xs text-ink-muted">
          Using your account details.{' '}
          <Link href="/account" className="link-underline text-ink">
            Change them
          </Link>
        </p>
      )}
    </form>
  );
}
