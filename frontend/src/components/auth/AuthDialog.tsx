'use client';

import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closeAuth } from '@/store/slices/uiSlice';

const FORM_COPY = {
  signup: {
    title: 'Create your account',
    body: 'Name, email, number and a password — then you are done.',
  },
  forgot: {
    title: 'Reset your password',
    body: 'Tell us the email on the account and we will send a link to set a new password.',
  },
} as const;

const COPY = {
  signin: {
    title: 'Welcome back',
    body: '',
  },
  signup: {
    title: 'Create your account',
    body: 'Name, email, number and a password — then you are done.',
  },
  wishlist: {
    title: 'Save it to your wishlist',
    body: 'Your wishlist lives on your account, so it is waiting on every device you sign in from.',
  },
  cart: {
    title: 'Sign in to add to your bag',
    body: 'We keep your bag and addresses on your account, so checkout is a single step next time.',
  },
} as const;

/**
 * Signing in over the page rather than away from it.
 *
 * Someone saving a fragrance has not asked to go anywhere — sending them to a
 * separate page loses the thing they were looking at and makes an account feel
 * like a toll gate. This keeps the page behind the dialog and returns them to
 * exactly what they were doing.
 */
export function AuthDialog() {
  const dispatch = useAppDispatch();
  const reason = useAppSelector((state) => state.ui.authReason);
  const user = useAppSelector((state) => state.auth.user);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Each opening starts from whatever asked for it.
  useEffect(() => {
    if (reason) setMode(reason === 'signup' ? 'signup' : 'signin');
  }, [reason]);

  useEffect(() => {
    if (!reason) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(closeAuth());
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [reason, dispatch]);

  // Signing in from another tab, or a session restored underneath, should not
  // leave the dialog sitting over a page it no longer applies to.
  useEffect(() => {
    if (user && reason) dispatch(closeAuth());
  }, [user, reason, dispatch]);

  if (!reason) return null;

  // Why the dialog opened sets the first heading; after that the tab does,
  // so "Welcome back" cannot sit above a sign-up form.
  const copy = mode === 'signin' ? COPY[reason] : FORM_COPY[mode];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.title}
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => dispatch(closeAuth())}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-ivory p-7 shadow-2xl sm:p-9">
        <button
          type="button"
          onClick={() => dispatch(closeAuth())}
          aria-label="Close"
          className="absolute top-4 right-4 p-1 text-ink-muted transition-colors hover:text-ink"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="m5 5 10 10M15 5 5 15" />
          </svg>
        </button>

        <div className="mb-6 flex flex-col gap-2 pr-6">
          <span className="eyebrow text-bronze-deep">attume</span>
          <h2 className="font-serif text-3xl font-medium text-ink">{copy.title}</h2>
          {copy.body && (
            <p className="text-sm leading-relaxed font-medium text-ink-soft">{copy.body}</p>
          )}
        </div>

        <AuthForm
          initialMode={reason === 'signup' ? 'signup' : 'signin'}
          onSuccess={() => dispatch(closeAuth())}
          onModeChange={setMode}
          compact
        />
      </div>
    </div>
  );
}
