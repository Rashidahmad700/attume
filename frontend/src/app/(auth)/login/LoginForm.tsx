'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAppSelector } from '@/store/hooks';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';
  const user = useAppSelector((state) => state.auth.user);

  // Covers arriving already signed in as well as signing in here.
  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center">
        <span className="eyebrow text-bronze-deep">attume</span>
        <h1 className="font-serif text-4xl font-medium text-ink">Your account</h1>
        <p className="text-sm text-ink-muted">
          Sign in, or make an account in a moment.
        </p>
      </header>

      <AuthForm onSuccess={() => router.replace(redirectTo)} />
    </div>
  );
}
