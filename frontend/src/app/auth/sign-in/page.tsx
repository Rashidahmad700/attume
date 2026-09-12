import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MagicLinkHandler } from './MagicLinkHandler';

export const metadata: Metadata = { title: 'Signing you in' };

export default function MagicSignInPage() {
  return (
    <Suspense fallback={<div className="h-96" />}>
      <MagicLinkHandler />
    </Suspense>
  );
}
