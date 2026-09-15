'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { checkEmail } from '@/lib/validateEmail';
import { useLoginMutation, useSignupMutation } from '@/store/api/authApi';

/**
 * Sign in and sign up, in one form.
 *
 * Kept free of routing so the same form can sit on its own page or in a dialog
 * over whatever the shopper was looking at. Signing up asks for a name, an
 * email and a password — a phone number is offered but not demanded, since
 * nothing here needs one until there is a delivery to arrange.
 */
export function AuthForm({
  initialMode = 'signin',
  onSuccess,
  compact = false,
}: {
  initialMode?: 'signin' | 'signup';
  onSuccess: () => void;
  compact?: boolean;
}) {
  const [login, { isLoading }] = useLoginMutation();
  const [signup, { isLoading: isSigningUp }] = useSignupMutation();

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  const rules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'A letter', ok: /[a-zA-Z]/.test(form.password) },
    { label: 'A number', ok: /[0-9]/.test(form.password) },
  ];

  const validate = () => {
    const errors: Record<string, string> = {};
    const emailError = checkEmail(form.email.trim());
    if (emailError) errors.email = emailError;

    if (mode === 'signup') {
      if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
      // Optional, so it is only checked when something has been typed.
      if (form.phone.trim() && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
        errors.phone = 'Enter a valid contact number';
      const failed = rules.find((rule) => !rule.ok);
      if (failed) errors.password = `Password needs: ${failed.label.toLowerCase()}`;
    } else if (!form.password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      if (mode === 'signup') {
        await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
        }).unwrap();
      } else {
        await login({ email: form.email.trim(), password: form.password }).unwrap();
      }
      onSuccess();
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  const busy = isLoading || isSigningUp;

  return (
    <div className="flex flex-col gap-6">
      {/* One switch rather than two pages: the fields barely differ, and
          sending someone elsewhere to make an account loses their place. */}
      <div className="flex rounded-xl border border-line p-1" role="tablist">
        {(['signin', 'signup'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setFieldErrors({});
              setFormError('');
            }}
            className={
              mode === value
                ? 'flex-1 rounded-lg bg-olive px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-ivory uppercase transition-colors'
                : 'flex-1 rounded-lg px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase transition-colors hover:text-olive'
            }
          >
            {value === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className={compact ? 'flex flex-col gap-5' : 'flex flex-col gap-6'}>
        {formError && (
          <p role="alert" className="border-l-2 border-cherry bg-cherry/5 px-4 py-3 text-sm text-cherry">
            {formError}
          </p>
        )}

        {mode === 'signup' && (
          <Input
            label="Name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            error={fieldErrors.name}
          />
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          error={fieldErrors.email}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            error={fieldErrors.password}
          />

          {mode === 'signup' && form.password.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-1">
              {rules.map((rule) => (
                <li
                  key={rule.label}
                  className={
                    rule.ok
                      ? 'flex items-center gap-1.5 text-xs text-olive'
                      : 'flex items-center gap-1.5 text-xs text-ink-muted'
                  }
                >
                  <span aria-hidden="true">{rule.ok ? '✓' : '·'}</span>
                  {rule.label}
                </li>
              ))}
            </ul>
          )}

          {mode === 'signin' && (
            <Link href="/forgot-password" className="link-underline eyebrow self-end text-olive">
              Forgotten password?
            </Link>
          )}
        </div>

        {/* Tucked behind a link: useful for a delivery, never a reason to
            abandon making an account. */}
        {mode === 'signup' &&
          (showPhone ? (
            <Input
              label="Contact number (optional)"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 00000 00000"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              error={fieldErrors.phone}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowPhone(true)}
              className="link-underline eyebrow self-start text-ink-muted hover:text-olive"
            >
              + Add a contact number
            </button>
          ))}

        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {mode === 'signin'
            ? busy
              ? 'Signing in…'
              : 'Sign in'
            : busy
              ? 'Creating account…'
              : 'Create account'}
        </Button>
      </form>

      <p className="text-xs leading-relaxed text-ink-muted">
        By continuing you agree to our{' '}
        <Link href="/policies/terms" className="link-underline text-ink">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/policies/privacy" className="link-underline text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
