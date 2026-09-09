'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

/**
 * Captures interest locally for now — the list is wired to an email service
 * in a later phase, so this deliberately does not pretend to have subscribed
 * anyone anywhere.
 */
export function NotifyForm({ label }: { label: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      return;
    }
    setState('done');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex h-fit flex-col gap-5 border border-line bg-ivory-soft p-7 lg:p-9">
      <h2 className="font-serif text-2xl font-light text-ink">{label}</h2>
      <p className="text-sm leading-relaxed text-ink-muted">
        Leave your email and you will hear from us first. Small batches, so the list matters.
      </p>

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setState('idle');
        }}
        error={state === 'error' ? 'Enter a valid email address' : undefined}
      />

      <Button type="submit" size="lg">
        Notify me
      </Button>

      <p className="text-xs" aria-live="polite">
        {state === 'done' ? (
          <span className="text-olive">Thank you — we will write to you first.</span>
        ) : (
          <span className="text-ink-muted">No noise, and never your address to anyone else.</span>
        )}
      </p>
    </form>
  );
}
