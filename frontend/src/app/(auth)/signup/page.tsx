import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SignupForm } from './SignupForm';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create your attume account.',
};

export default function SignupPage() {
  // useSearchParams needs a suspense boundary during static prerender.
  return (
    <Suspense fallback={<div className="h-96" />}>
      <SignupForm />
    </Suspense>
  );
}
