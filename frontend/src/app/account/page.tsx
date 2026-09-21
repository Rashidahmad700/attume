'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AddressBook } from '@/components/account/AddressBook';
import { ProfileDetails } from '@/components/account/ProfileDetails';
import { RecentOrders } from '@/components/account/RecentOrders';
import { Container } from '@/components/ui/Container';
import {
  LoadingAnnouncement,
  Skeleton,
  SkeletonText,
} from '@/components/ui/Skeleton';
import { useLogoutMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

export default function AccountPage() {
  const router = useRouter();
  const { user, isInitialised } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    if (isInitialised && !user) router.replace('/login?redirect=/account');
  }, [isInitialised, user, router]);

  if (!isInitialised || !user) {
    return (
      <Container className="py-16 lg:py-24">
        <div className="mx-auto w-full max-w-3xl">
          <LoadingAnnouncement>Loading your account</LoadingAnnouncement>
          {/* Mirrors the header and the two panels below it. */}
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-64 lg:h-12" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="mt-12 grid gap-12 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-4">
                <Skeleton className="h-3 w-32" />
                <SkeletonText lines={4} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16 lg:py-24">
      {/* The panels hold short label/value pairs — at full container width a
          five-line profile reads as mostly empty box. */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
          <div>
            <h1 className="font-serif text-4xl font-medium text-ink lg:text-5xl">
              Hello, {user.name}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={async () => {
                await logout()
                  .unwrap()
                  .catch(() => undefined);
                router.replace('/');
              }}
              className="link-underline eyebrow text-espresso disabled:opacity-50"
            >
              {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-8">
          <ProfileDetails user={user} />
          <AddressBook addresses={user.addresses} />

          <RecentOrders />
        </div>
      </div>
    </Container>
  );
}
