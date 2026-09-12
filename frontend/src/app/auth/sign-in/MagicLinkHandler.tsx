'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/ui/Container';
import { parseApiError } from '@/lib/apiError';
import { useVerifyMagicLinkMutation } from '@/store/api/authApi';

export function MagicLinkHandler() {
  const router = useRouter();
  const token = useSearchParams().get('token') ?? '';
  const [verify] = useVerifyMagicLinkMutation();
  const [error, setError] = useState('');
  // Tokens are single use, so React's double-invoke in development must not
  // spend the link before the user is redirected.
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;

    verify(token)
      .unwrap()
      .then(() => router.replace('/account'))
      .catch((caught) => setError(parseApiError(caught).message));
  }, [token, verify, router]);

  return (
    <Container className="flex flex-col items-center gap-5 py-28 text-center">
      {error || !token ? (
        <>
          <span className="eyebrow text-bronze">Sign in</span>
          <h1 className="font-serif text-3xl font-light text-ink">
            {token ? error : 'This link is incomplete'}
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">
            Sign-in links work once and expire after 15 minutes. Ask for a fresh one and it will
            work straight away.
          </p>
          <Link
            href="/login"
            className="mt-2 rounded-xl bg-ink px-8 py-4 text-xs tracking-[0.16em] text-ivory uppercase transition-colors hover:bg-olive"
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <p className="eyebrow text-ink-muted">Signing you in…</p>
      )}
    </Container>
  );
}
