'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { passwordRules } from '@/lib/validatePassword';
import { useResetPasswordMutation } from '@/store/api/authApi';

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // Same rules as signup, so a password accepted here would have been accepted
  // there — and matches what the API enforces.
  const rules = passwordRules(form.password);

  if (!token) {
    return (
      <div className="flex flex-col gap-6 text-center">
        <span className="eyebrow font-bold text-bronze-deep">Reset password</span>
        <h1 className="font-serif text-4xl font-medium text-ink">This link is incomplete</h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          Open the link from your email directly, or ask for a new one.
        </p>
        <Link href="/forgot-password" className="link-underline eyebrow self-center text-olive">
          Send another link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const errors: Record<string, string> = {};
    const failed = rules.find((rule) => !rule.ok);
    if (failed) errors.password = `Password needs: ${failed.label.toLowerCase()}`;
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
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center">
        <span className="eyebrow font-bold text-bronze-deep">Reset password</span>
        <h1 className="font-serif text-4xl font-medium text-ink">Choose a new one</h1>
        <p className="text-sm text-ink-muted">
          Setting a new password signs out every other device.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {error && (
          <p
            role="alert"
            className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso"
          >
            {error}{' '}
            <Link href="/forgot-password" className="link-underline">
              Ask for a new link
            </Link>
            .
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            error={fieldErrors.password}
          />

          {/* Appears as they type, the way it does on signup, rather than a
              static line of text that is only ever read after a rejection. */}
          {form.password.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className={
                    rule.ok
                      ? 'flex items-center gap-1.5 text-xs font-semibold text-olive'
                      : 'flex items-center gap-1.5 text-xs text-ink-muted'
                  }
                >
                  <span aria-hidden="true">{rule.ok ? '✓' : '·'}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Input
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          value={form.confirm}
          onChange={(event) => setForm({ ...form, confirm: event.target.value })}
          error={fieldErrors.confirm}
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Set new password'}
        </Button>
      </form>

      <Link href="/login" className="link-underline eyebrow self-center text-olive">
        Back to sign in
      </Link>
    </div>
  );
}
