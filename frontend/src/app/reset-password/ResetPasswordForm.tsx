'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useResetPasswordMutation } from '@/store/api/authApi';

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <span className="eyebrow text-bronze">Reset password</span>
        <h1 className="font-serif text-4xl font-light text-ink">This link is incomplete</h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Open the link from your email directly, or ask for a new one.
        </p>
        <Link href="/forgot-password" className="link-underline eyebrow self-start text-olive">
          Send another link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    if (form.password.length < 8) errors.password = 'At least 8 characters';
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      errors.password = 'Use at least one letter and one number';
    if (form.confirm !== form.password) errors.confirm = 'Passwords do not match';
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      await resetPassword({ token, password: form.password }).unwrap();
      router.replace('/account');
    } catch (caught) {
      const parsed = parseApiError(caught);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-bronze">Reset password</span>
        <h1 className="font-serif text-4xl font-light text-ink">Choose a new one</h1>
        <p className="text-sm text-ink-muted">
          Setting a new password signs out every other device.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        {error && (
          <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
            {error}{' '}
            <Link href="/forgot-password" className="link-underline">
              Ask for a new link
            </Link>
            .
          </p>
        )}

        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          error={fieldErrors.password}
          hint="At least 8 characters, with a letter and a number."
        />
        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(event) => setForm({ ...form, confirm: event.target.value })}
          error={fieldErrors.confirm}
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Set new password'}
        </Button>
      </form>
    </div>
  );
}
