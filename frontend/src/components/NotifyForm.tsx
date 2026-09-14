'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Captures interest locally for now — the list is wired to an email service in
 * a later phase, so this deliberately does not pretend to have subscribed
 * anyone anywhere.
 */
export function NotifyForm({ label }: { label: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please add your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      next.phone = 'Enter a valid contact number';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setDone(true);
    setForm({ name: '', email: '', phone: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex h-fit flex-col gap-5 border border-line bg-ivory-soft p-7 lg:p-9"
    >
      <h2 className="font-serif text-2xl font-light text-ink">{label}</h2>
      <p className="text-sm leading-relaxed text-ink-muted">
        Leave your details and you will hear from us first. Small batches, so the list matters.
      </p>

      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={(event) => {
          setForm({ ...form, name: event.target.value });
          setDone(false);
        }}
        error={errors.name}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(event) => {
          setForm({ ...form, email: event.target.value });
          setDone(false);
        }}
        error={errors.email}
      />

      <Input
        label="Contact number"
        name="phone"
        type="tel"
        placeholder="+91 00000 00000"
        value={form.phone}
        onChange={(event) => {
          setForm({ ...form, phone: event.target.value });
          setDone(false);
        }}
        error={errors.phone}
      />

      <Button type="submit" size="lg">
        Notify me
      </Button>

      <p className="text-xs" aria-live="polite">
        {done ? (
          <span className="text-olive">Thank you — we will write to you first.</span>
        ) : (
          <span className="text-ink-muted">No noise, and never your details to anyone else.</span>
        )}
      </p>
    </form>
  );
}
