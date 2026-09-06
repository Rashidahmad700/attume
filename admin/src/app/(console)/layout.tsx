'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useGetCurrentAdminQuery } from '@/store/api/adminApi';
import { useAppSelector } from '@/store/hooks';

/**
 * Client-side gate. It is a convenience, not the security boundary — every
 * admin API route independently verifies the admin cookie, so a user who
 * bypasses this shell still gets 401s and sees nothing.
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isInitialised, admin } = useAppSelector((state) => state.adminAuth);
  const { isLoading } = useGetCurrentAdminQuery();

  useEffect(() => {
    if (isInitialised && !admin) router.replace('/login');
  }, [isInitialised, admin, router]);

  if (isLoading || !isInitialised) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="eyebrow text-ink-muted">Checking session…</p>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
