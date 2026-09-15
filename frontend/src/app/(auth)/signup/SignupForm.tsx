'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAppSelector } from '@/store/hooks';

export function SignupForm() {
  const router = useRouter();
  const redirectTo = useSearchParams().get('redirect') ?? '/account';
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) router.replace(redirectTo);
  }, [user, redirectTo, router]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2 text-center">
        <span className="eyebrow text-bronze-deep">attume</span>
        <h1 className="font-serif text-4xl font-medium text-ink">Create your account</h1>
        <p className="text-sm text-ink-muted">Name, email and a password. That is all.</p>
      </header>

      <AuthForm initialMode="signup" onSuccess={() => router.replace(redirectTo)} />
    </div>
  );
}
