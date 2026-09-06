'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { parseApiError } from '@/lib/apiError';
import { useLoginMutation } from '@/store/api/adminApi';
import { useAppSelector } from '@/store/hooks';

export function LoginForm() {
  const router = useRouter();
  const admin = useAppSelector((state) => state.adminAuth.admin);
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (admin) router.replace('/');
  }, [admin, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await login(form).unwrap();
      router.replace('/');
    } catch (caught) {
      // The API returns one generic message for every failure — do not
      // elaborate here either, or the form becomes an admin-account oracle.
      setError(parseApiError(caught).message);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <span className="font-serif text-3xl lowercase tracking-[0.06em] text-ivory">attume</span>
          <p className="eyebrow mt-3 text-bronze">Admin console</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 border border-line-dark bg-ink-soft p-8">
          {error && (
            <p role="alert" className="border-l-2 border-espresso bg-espresso/15 px-4 py-3 text-xs text-ivory">
              {error}
            </p>
          )}

          <label className="flex flex-col gap-2">
            <span className="eyebrow text-ivory/50">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="border-b border-ivory/20 bg-transparent py-2 text-sm text-ivory focus:border-bronze focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="eyebrow text-ivory/50">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="border-b border-ivory/20 bg-transparent py-2 text-sm text-ivory focus:border-bronze focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-ivory px-6 py-3 text-[11px] tracking-[0.16em] text-ink uppercase transition-colors hover:bg-bronze hover:text-ivory disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ivory/35">
          Authorised personnel only. Sessions are logged.
        </p>
      </div>
    </main>
  );
}
