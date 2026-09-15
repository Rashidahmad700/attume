'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { checkEmail } from '@/lib/validateEmail';
import { useLoginMutation, useSignupMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';

  const user = useAppSelector((state) => state.auth.user);
  const [login, { isLoading }] = useLoginMutation();

  const [signup, { isLoading: isSigningUp }] = useSignupMutation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  const email = form.email.trim();
  const emailError = checkEmail(email);
  // Mirrors what the API enforces, so the rules are learned here rather than
  // discovered after a rejected round trip.
  const rules = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'A letter', ok: /[a-zA-Z]/.test(form.password) },
    { label: 'A number', ok: /[0-9]/.test(form.password) },
  ];

  const validate = () => {
    const errors: Record<string, string> = {};
    if (emailError) errors.email = emailError;

    if (mode === 'signup') {
      if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
      if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) errors.phone = 'Enter a valid contact number';
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
          phone: form.phone.trim(),
        }).unwrap();
      } else {
        await login({ email: form.email, password: form.password }).unwrap();
      }
      router.replace(redirectTo);
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <span className="eyebrow text-bronze">
          {mode === 'signin' ? 'Welcome back' : 'Join the house'}
        </span>
        <h1 className="font-serif text-4xl font-medium text-ink">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>

        {/* Both paths on one page — the client asked for sign up here rather
            than behind a separate link. */}
        <div className="flex gap-2" role="tablist">
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
                  ? 'rounded-xl border border-olive bg-olive px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-ivory uppercase'
                  : 'rounded-xl border border-line px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase transition-colors hover:border-olive hover:text-olive'
              }
            >
              {value === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        {formError && (
          <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
            {formError}
          </p>
        )}

        {mode === 'signup' && (
          <Input
            label="Full name"
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

        {mode === 'signup' && (
          <Input
            label="Contact number"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 00000 00000"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            error={fieldErrors.phone}
          />
        )}

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

          {/* Ticks as each rule is met, so the requirements are visible while
              typing rather than revealed by a rejection. */}
          {mode === 'signup' && (
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

        <Button type="submit" size="lg" fullWidth disabled={isLoading || isSigningUp}>
          {mode === 'signin'
            ? isLoading
              ? 'Signing in…'
              : 'Sign in'
            : isSigningUp
              ? 'Creating account…'
              : 'Create account'}
        </Button>
      </form>

      <p className="text-xs leading-relaxed text-ink-muted">
        By continuing you agree to our{' '}
        <Link href="/policies/terms" className="link-underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/policies/privacy" className="link-underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
