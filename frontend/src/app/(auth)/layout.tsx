import type { ReactNode } from 'react';

/**
 * Signing in usually happens in a dialog over the page. This layout is the
 * fallback — a redirect, a password reset link, a bookmark — so it is just the
 * form, centred, with nothing else to wade through.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-ivory px-5 py-16 sm:px-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
