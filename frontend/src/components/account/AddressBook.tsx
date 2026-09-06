'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { parseApiError } from '@/lib/apiError';
import { useDeleteAddressMutation, useSetDefaultAddressMutation } from '@/store/api/userApi';
import type { Address } from '@/types';
import { AddressForm } from './AddressForm';

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const [mode, setMode] = useState<{ type: 'idle' | 'new' | 'edit'; id?: string }>({ type: 'idle' });
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const [setDefault, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();
  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

  const editing = mode.type === 'edit' ? addresses.find((a) => a._id === mode.id) : undefined;

  const run = async (fn: () => Promise<unknown>) => {
    setActionError('');
    try {
      await fn();
    } catch (error) {
      setActionError(parseApiError(error).message);
    }
  };

  return (
    <section className="border border-line bg-ivory-soft">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
        <div>
          <h2 className="eyebrow text-ink">Address book</h2>
          <p className="mt-1 text-xs text-ink-muted">
            Saved addresses appear at checkout. The default one is selected first.
          </p>
        </div>
        {mode.type === 'idle' && (
          <Button size="sm" variant="outline" onClick={() => setMode({ type: 'new' })}>
            Add address
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-6 px-6 py-6 sm:px-8">
        {actionError && (
          <p role="alert" className="border-l-2 border-espresso bg-espresso/5 px-4 py-3 text-sm text-espresso">
            {actionError}
          </p>
        )}

        {mode.type !== 'idle' && (
          <AddressForm
            address={editing}
            isFirstAddress={addresses.length === 0}
            onDone={() => setMode({ type: 'idle' })}
            onCancel={() => setMode({ type: 'idle' })}
          />
        )}

        {addresses.length === 0 && mode.type === 'idle' && (
          <div className="flex flex-col items-start gap-4 border border-dashed border-line px-6 py-10">
            <p className="text-sm text-ink-muted">
              No addresses saved yet. Add one now and checkout will be a single step later.
            </p>
            <Button size="sm" onClick={() => setMode({ type: 'new' })}>
              Add your first address
            </Button>
          </div>
        )}

        {addresses.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <li
                key={address._id}
                className={`flex flex-col justify-between gap-5 border p-6 ${
                  address.isDefault ? 'border-olive bg-ivory' : 'border-line bg-ivory'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow text-ink">{address.label || 'Address'}</span>
                    {address.isDefault && (
                      <span className="bg-olive px-2.5 py-1 text-[10px] tracking-[0.16em] text-ivory uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  <address className="text-sm leading-relaxed text-ink not-italic">
                    {address.line1}
                    {address.line2 && (
                      <>
                        <br />
                        {address.line2}
                      </>
                    )}
                    <br />
                    {address.city}, {address.state} {address.postalCode}
                    <br />
                    {address.country}
                    {address.phone && (
                      <>
                        <br />
                        <span className="text-ink-muted">{address.phone}</span>
                      </>
                    )}
                  </address>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
                  {!address.isDefault && (
                    <button
                      type="button"
                      disabled={isSettingDefault}
                      onClick={() => run(() => setDefault(address._id!).unwrap())}
                      className="link-underline eyebrow text-olive disabled:opacity-50"
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMode({ type: 'edit', id: address._id })}
                    className="link-underline eyebrow text-ink"
                  >
                    Edit
                  </button>

                  {confirmingId === address._id ? (
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={async () => {
                          await run(() => deleteAddress(address._id!).unwrap());
                          setConfirmingId(null);
                        }}
                        className="eyebrow text-espresso underline disabled:opacity-50"
                      >
                        {isDeleting ? 'Removing…' : 'Confirm remove'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="eyebrow text-ink-muted"
                      >
                        Keep
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(address._id ?? null)}
                      className="link-underline eyebrow text-espresso"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
