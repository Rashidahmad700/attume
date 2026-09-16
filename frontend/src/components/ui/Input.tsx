'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, type = 'text', ...props },
  ref,
) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, '-');

  // Visibility is presentation only: the field keeps its value, and the type
  // is the single thing that changes.
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);
  const resolvedType = isPassword && revealed ? 'text' : type;

  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={inputId} className="eyebrow text-ink-muted">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full border-b bg-transparent py-3 font-sans text-sm text-ink placeholder:text-ink-muted/60',
            'transition-colors duration-300 focus:outline-none',
            // Room for the toggle, so a long password never runs under it.
            isPassword && 'pr-11',
            error ? 'border-cherry' : 'border-line focus:border-olive',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            // A real button in the tab order, so it can be reached and
            // toggled from the keyboard and is announced with its state.
            className="absolute right-0 bottom-2.5 p-1.5 text-ink-muted transition-colors hover:text-olive focus-visible:text-olive"
          >
            {revealed ? (
              <EyeOffIcon className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <EyeIcon className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-sm font-bold text-cherry">
          {error}
        </p>
      )}
    </div>
  );
});
