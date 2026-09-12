'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useRequestPasswordResetMutation } from '@/store/api/authApi';

export function ForgotPasswordForm() {
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    try {
      await requestReset(email).unwrap();
      setSent(true);
    } catch (caught) {
      setError(parseApiError(caught).message);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-6">
        <span className="eyebrow text-bronze">Check your email</span>
        <h1 className="font-serif text-4xl font-light text-ink">Link sent</h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          If {email} has an account, a link to choose a new password is on its way. It works once
          and expires in an hour.
        </p>
        <Link href="/login" className="link-underline eyebrow self-start text-olive">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-bronze">Forgotten password</span>
        <h1 className="font-serif text-4xl font-light text-ink">Reset it</h1>
        <p className="text-sm text-ink-muted">
          We will email you a link to choose a new one.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        {error && (
          <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
            {error}
          </p>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Email me a link'}
        </Button>
      </form>

      <Link href="/login" className="link-underline eyebrow self-start text-olive">
        Back to sign in
      </Link>
    </div>
  );
}
