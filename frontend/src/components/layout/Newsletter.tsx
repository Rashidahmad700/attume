'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRightIcon } from '@/components/ui/icons';

/**
 * Phase 1 keeps this local-only — the email service is wired in a later phase.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('done');
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="flex items-center gap-3 border-b border-ivory/25 pb-2 focus-within:border-ivory/70">
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setStatus('idle');
          }}
          placeholder="Your email address"
          aria-label="Email address for newsletter"
          className="w-full bg-transparent py-1 text-sm text-ivory placeholder:text-ivory/45 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="p-1 text-ivory/70 transition-colors hover:text-ivory"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>
      <p
        className="mt-3 text-xs text-ivory/55"
        role={status === 'error' ? 'alert' : undefined}
        aria-live="polite"
      >
        {status === 'done' && 'Thank you — you are on the list.'}
        {status === 'error' && 'Please enter a valid email address.'}
        {status === 'idle' && 'Scent notes, launches and private previews. No noise.'}
      </p>
    </form>
  );
}
