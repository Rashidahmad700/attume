'use client';

import { useEffect, useState, type FormEvent } from 'react';

export type PrebookSource = 'product' | 'restock' | 'gifting' | 'attar' | 'newsletter';

interface PrebookFormProps {
  /** Omitted for a plain list sign-up that is not about one fragrance. */
  slug?: string;
  productName?: string;
  source?: PrebookSource;
  /** Shown above the fields; the page decides the wording. */
  heading?: string;
  blurb?: string;
  maxQuantity?: number;
  compact?: boolean;
  onDone?: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[0-9+\-\s]{7,15}$/;

/**
 * Captures a pre-booking. Nothing is charged — the shop takes interest rather
 * than money until a payment gateway is approved — so the form asks only for
 * what is needed to come back to someone.
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
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', quantity: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (state === 'done') onDone?.();
  }, [state, onDone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please add your name';
    if (!EMAIL.test(form.email.trim())) next.email = 'Enter a valid email address';
    if (form.phone.trim() && !PHONE.test(form.phone.trim()))
      next.phone = 'Enter a valid contact number';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setState('sending');
    try {
      const response = await fetch('/api/v1/prebookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          city: form.city.trim() || undefined,
          quantity: form.quantity,
          slug,
          source,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState('error');
        setMessage(payload?.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setState('done');
      setMessage(payload?.message ?? 'You are on the list.');
    } catch {
      setState('error');
      setMessage('We could not reach the server. Please try again in a moment.');
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col gap-3 border border-olive/40 bg-olive/5 p-6 text-center">
        <p className="font-serif text-xl font-normal text-olive">You are on the list.</p>
        <p className="text-sm text-ink-muted">{message}</p>
        <p className="text-xs text-ink-muted">
          Nothing has been charged. We will write to you before anything ships.
        </p>
      </div>
    );
  }

  const field = 'w-full border-b border-line bg-transparent py-3 text-sm focus:border-olive focus-visible:outline-none!';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {heading && <h2 className="font-serif text-2xl font-medium text-ink">{heading}</h2>}
      {blurb && <p className="text-sm leading-relaxed text-ink-muted">{blurb}</p>}

      <div className={compact ? 'grid gap-4 sm:grid-cols-2' : 'flex flex-col gap-5'}>
        <label className="flex flex-col gap-1">
          <span className="eyebrow text-ink-muted">Name</span>
          <input
            name="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={field}
            placeholder="Your name"
          />
          {errors.name && <span className="text-xs text-espresso">{errors.name}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow text-ink-muted">Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={field}
            placeholder="you@example.com"
          />
          {errors.email && <span className="text-xs text-espresso">{errors.email}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow text-ink-muted">Contact number</span>
          <input
            name="phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className={field}
            placeholder="+91 00000 00000"
          />
          {errors.phone && <span className="text-xs text-espresso">{errors.phone}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="eyebrow text-ink-muted">City</span>
          <input
            name="city"
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            className={field}
            placeholder="New Delhi"
          />
        </label>
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
              onClick={() =>
                setForm({ ...form, quantity: Math.min(maxQuantity, form.quantity + 1) })
              }
              disabled={form.quantity >= maxQuantity}
              aria-label="More bottles"
              className="px-4 py-2 text-ink disabled:opacity-30"
            >
              +
            </button>
          </div>
        </label>
      )}

      <button
        type="submit"
        disabled={state === 'sending'}
        className="w-full rounded-xl bg-cherry px-8 py-4 text-xs font-semibold tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-ink disabled:opacity-50"
      >
        {state === 'sending'
          ? 'Sending…'
          : productName
            ? `Pre-book ${productName}`
            : 'Join the list'}
      </button>

      <p className="text-xs text-ink-muted" aria-live="polite">
        {state === 'error' ? (
          <span className="text-espresso">{message}</span>
        ) : (
          'No payment is taken now. We will write to you with the details before anything ships.'
        )}
      </p>
    </form>
  );
}
