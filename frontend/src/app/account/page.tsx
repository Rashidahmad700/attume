'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AddressBook } from '@/components/account/AddressBook';
import { ProfileDetails } from '@/components/account/ProfileDetails';
import { Container } from '@/components/ui/Container';
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
      <Container className="py-32">
        <p className="eyebrow text-ink-muted">Loading your account…</p>
      </Container>
    );
  }

  return (
    <Container className="py-16 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <span className="eyebrow text-bronze">Your account</span>
          <h1 className="mt-3 font-serif text-4xl font-light text-ink lg:text-5xl">
            Hello, {user.name}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/shop" className="link-underline eyebrow text-ink">
            Continue shopping
          </Link>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={async () => {
              await logout().unwrap().catch(() => undefined);
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

        <section className="border border-line bg-ivory-soft">
          <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
            <h2 className="eyebrow text-ink">Orders</h2>
            <Link href="/account/orders" className="link-underline eyebrow text-olive">
              View all
            </Link>
          </header>
          <div className="px-6 py-8 sm:px-8">
            <p className="text-sm text-ink-muted">
              Track dispatch, delivery and cancellations from your order history.
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
}
