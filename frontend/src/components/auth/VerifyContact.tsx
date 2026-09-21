'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { parseApiError } from '@/lib/apiError';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

type Channel = 'email' | 'phone';

/**
 * Verifies that a customer holds the email address or number on their account.
 *
 * Typing a contact detail proves nothing; a code sent to it and read back
 * does. Until that happens the account carries the detail unverified, which is
 * what actions like cancelling an order check before they run.
 */
export function VerifyContact({
  channel,
  onVerified,
  compact = false,
}: {
  channel: Channel;
  onVerified?: () => void;
  compact?: boolean;
}) {
  const user = useAppSelector((state) => state.auth.user);
  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const [sent, setSent] = useState(false);
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const verified = channel === 'email' ? user?.emailVerified : user?.phoneVerified;

  // Counts the resend cooldown down locally; the API enforces it regardless.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSend() {
    setError('');
    try {
      const response = await sendOtp({ channel }).unwrap();
      if (response.data?.alreadyVerified) {
        onVerified?.();
        return;
      }
      setDestination(response.data?.destination ?? '');
      setCooldown(response.data?.resendAfterSeconds ?? 60);
      setSent(true);
    } catch (caught) {
      setError(parseApiError(caught).message);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the 6-digit code');
      return;
    }
    try {
      await verifyOtp({ channel, code: code.trim() }).unwrap();
      onVerified?.();
    } catch (caught) {
      setError(parseApiError(caught).message);
      setCode('');
    }
  }

  if (verified) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-olive">
        <span aria-hidden="true">✓</span>
        Your {channel} is verified
      </p>
    );
  }

  const label = channel === 'email' ? 'email address' : 'contact number';

  return (
    <div className={compact ? 'flex flex-col gap-4' : 'flex flex-col gap-5'}>
      {!sent ? (
        <>
          <p className="text-sm leading-relaxed text-ink-muted">
            We will send a 6-digit code to your {label} to confirm it reaches you.
          </p>
          {error && <p className="text-sm font-bold text-cherry">{error}</p>}
          {/* self-start, or a flex column stretches it into a full-width
              slab — far too much weight for a secondary action. */}
          <Button
            type="button"
            size="sm"
            onClick={handleSend}
            disabled={isSending}
            className="self-start"
          >
            {isSending ? 'Sending…' : `Send code to my ${channel}`}
          </Button>
        </>
      ) : (
        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink-muted">
            Code sent to {destination}. It expires in 10 minutes.
          </p>

          <Input
            label="6-digit code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            // Digits only, so a pasted code with spaces still works.
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            error={error}
          />

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="sm" disabled={isVerifying || code.length < 6}>
              {isVerifying ? 'Checking…' : 'Verify'}
            </Button>

            <button
              type="button"
              onClick={handleSend}
              disabled={cooldown > 0 || isSending}
              className="link-underline eyebrow font-bold text-olive disabled:text-ink-muted"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
