'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useSignupMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

export function SignupForm() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const [signup, { isLoading }] = useSignupMutation();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user) router.replace('/account');
  }, [user, router]);

  // Mirrors the zod rules on the API so the user sees errors before a round trip.
  const validate = () => {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address';
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password))
      errors.password = 'Use at least one letter and one number';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      }).unwrap();
      router.replace('/account');
    } catch (error) {
      const parsed = parseApiError(error);
      setFormError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="eyebrow text-bronze">Join the house</span>
        <h1 className="font-serif text-4xl font-light text-ink">Create account</h1>
        <p className="text-sm text-ink-muted">
          Already with us?{' '}
          <Link href="/login" className="link-underline text-olive">
            Sign in
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
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          error={fieldErrors.name}
        />

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
          label="Phone (optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 00000 00000"
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          error={fieldErrors.phone}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          error={fieldErrors.password}
          hint="At least 8 characters, with a letter and a number."
        />

        <Button type="submit" size="lg" fullWidth disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </div>
  );
}
