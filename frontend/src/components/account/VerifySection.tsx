'use client';

import { VerifyContact } from '@/components/auth/VerifyContact';
import type { User } from '@/types';

/**
 * Verification status for the account's contact details.
 *
 * Shown whether or not anything is outstanding: a customer should be able to
 * see that their address is confirmed, not only be told when it is not.
 */
export function VerifySection({ user }: { user: User }) {
  const allVerified = user.emailVerified && (!user.phone || user.phoneVerified);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-ivory-soft">
      <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
        <h2 className="eyebrow text-ink">Verification</h2>
        {allVerified && <span className="eyebrow text-olive">All confirmed</span>}
      </header>

      <div className="flex flex-col gap-8 px-6 py-8 sm:px-8">
        {!allVerified && (
          <p className="text-sm leading-relaxed text-ink-muted">
            Confirming your details lets us reach you about an order, and is required before an
            order can be cancelled or refunded.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <h3 className="eyebrow text-ink-muted">Email · {user.email}</h3>
          <VerifyContact channel="email" compact />
        </div>

        {user.phone && (
          <div className="flex flex-col gap-3 border-t border-line pt-8">
            <h3 className="eyebrow text-ink-muted">Contact number · {user.phone}</h3>
            <VerifyContact channel="phone" compact />
          </div>
        )}
      </div>
    </section>
  );
}
