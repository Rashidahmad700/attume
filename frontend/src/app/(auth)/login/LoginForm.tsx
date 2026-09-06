'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useLoginMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';

  const user = useAppSelector((state) => state.auth.user);
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
    if (!form.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      await login(form).unwrap();
      router.replace(redirectTo);
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-bronze">Welcome back</span>
        <h1 className="font-serif text-4xl font-light text-ink">Sign in</h1>
        <p className="text-sm text-ink-muted">
          New here?{' '}
          <Link href="/signup" className="link-underline text-olive">
            Create an account
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
        {formError && (
          <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
            {formError}
          </p>
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

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          error={fieldErrors.password}
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="text-xs leading-relaxed text-ink-muted">
        By signing in you agree to our{' '}
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
