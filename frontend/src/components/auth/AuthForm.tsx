'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { checkEmail } from '@/lib/validateEmail';
import { passwordRules } from '@/lib/validatePassword';
import { checkName, checkPhone, digitsOnly } from '@/lib/validatePhone';
import {
  useLoginMutation,
  useRequestPasswordResetMutation,
  useSignupMutation,
} from '@/store/api/authApi';

type Mode = 'signin' | 'signup' | 'forgot';

/**
 * Sign in, sign up and password reset, in one form.
 *
 * Kept free of routing so the same form can sit on its own page or in a dialog
 * over whatever the shopper was looking at — including the reset step, which
 * used to navigate away mid-flow and lose the dialog.
 */
export function AuthForm({
  initialMode = 'signin',
  onSuccess,
  onModeChange,
  compact = false,
}: {
  initialMode?: 'signin' | 'signup';
  onSuccess: () => void;
  /** Lets a surrounding dialog retitle itself when the tab changes. */
  onModeChange?: (mode: Mode) => void;
  compact?: boolean;
}) {
  const [login, { isLoading }] = useLoginMutation();
  const [signup, { isLoading: isSigningUp }] = useSignupMutation();
  const [requestReset, { isLoading: isSendingReset }] = useRequestPasswordResetMutation();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [form, setForm] = useState({ name: '', identifier: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resetSent, setResetSent] = useState(false);

  const rules = passwordRules(form.password);

  const switchTo = (next: Mode) => {
    setMode(next);
    onModeChange?.(next);
    setFieldErrors({});
    setResetSent(false);
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (mode === 'signup') {
      const nameError = checkName(form.name);
      if (nameError) errors.name = nameError;
      const emailError = checkEmail(form.email.trim());
      if (emailError) errors.email = emailError;
      const phoneError = checkPhone(form.phone);
      if (phoneError) errors.phone = phoneError;
      const failed = rules.find((rule) => !rule.ok);
      if (failed) errors.password = `Password needs: ${failed.label.toLowerCase()}`;
    } else if (mode === 'forgot') {
      const emailError = checkEmail(form.email.trim());
      if (emailError) errors.email = emailError;
    } else {
      if (!form.identifier.trim()) errors.identifier = 'Enter your email or phone number';
      if (!form.password) errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (mode === 'signup') {
        await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        }).unwrap();
        onSuccess();
      } else if (mode === 'forgot') {
        await requestReset(form.email.trim()).unwrap();
        setResetSent(true);
      } else {
        await login({ identifier: form.identifier.trim(), password: form.password }).unwrap();
        onSuccess();
      }
    } catch (error) {
      const parsed = parseApiError(error);
      // Field errors from the API land on their field; anything general is
      // attached to the field it is about, so nothing floats above the form.
      const errors = { ...parsed.fieldErrors };
      if (Object.keys(errors).length === 0 && parsed.message) {
        if (mode === 'signin') errors.password = parsed.message;
        else if (/phone|number/i.test(parsed.message)) errors.phone = parsed.message;
        else errors.email = parsed.message;
      }
      setFieldErrors(errors);
    }
  };

  const busy = isLoading || isSigningUp || isSendingReset;

  if (mode === 'forgot' && resetSent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="font-serif text-2xl font-medium text-olive">Check your email</p>
        <p className="text-sm leading-relaxed text-ink-muted">
          If {form.email.trim()} has an account, a link to set a new password is on its way. It
          expires in an hour.
        </p>
        <button
          type="button"
          onClick={() => switchTo('signin')}
          className="link-underline eyebrow self-center text-olive"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {mode === 'forgot' ? (
        <button
          type="button"
          onClick={() => switchTo('signin')}
          className="eyebrow flex items-center gap-2 self-start font-bold text-olive"
        >
          ← Back to sign in
        </button>
      ) : (
        <div className="flex rounded-xl border border-line p-1" role="tablist">
          {(['signin', 'signup'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => switchTo(value)}
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
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className={compact ? 'flex flex-col gap-5' : 'flex flex-col gap-6'}
      >

        {mode === 'signup' && (
          <Input
            label="Name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            // Digits are refused as they are typed rather than after submit.
            onChange={(event) =>
              setForm({ ...form, name: event.target.value.replace(/[0-9]/g, '') })
            }
            error={fieldErrors.name}
          />
        )}

        {mode === 'signin' && (
          <Input
            label="Email or phone number"
            name="identifier"
            autoComplete="username"
            placeholder="you@example.com or 98765 43210"
            value={form.identifier}
            onChange={(event) => setForm({ ...form, identifier: event.target.value })}
            error={fieldErrors.identifier}
          />
        )}

        {mode !== 'signin' && (
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
        )}

        {mode === 'signup' && (
          <Input
            label="Contact number"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            // Only digits reach the field, and never more than ten.
            onChange={(event) => setForm({ ...form, phone: digitsOnly(event.target.value) })}
            error={fieldErrors.phone}
          />
        )}

        {mode !== 'forgot' && (
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

            {/* Switches this form to the reset step rather than navigating —
                in a dialog, a link would open the page behind it. */}
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => switchTo('forgot')}
                className="link-underline eyebrow self-end font-bold text-olive"
              >
                Forgot password?
              </button>
            )}
          </div>
        )}

        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {mode === 'signin'
            ? busy
              ? 'Signing in…'
              : 'Sign in'
            : mode === 'signup'
              ? busy
                ? 'Creating account…'
                : 'Create account'
              : busy
                ? 'Sending…'
                : 'Send reset link'}
        </Button>
      </form>

      <p className="text-xs leading-relaxed font-medium text-ink-soft">
        By continuing you agree to our{' '}
        {/* New tab: following these from inside the dialog would throw away a
            half-filled form. */}
        <Link
          href="/policies/terms"
          target="_blank"
          rel="noreferrer"
          className="link-underline font-bold text-ink"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/policies/privacy"
          target="_blank"
          rel="noreferrer"
          className="link-underline font-bold text-ink"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
