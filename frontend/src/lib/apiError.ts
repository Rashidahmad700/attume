import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

const FALLBACK = 'Something went wrong. Please try again.';

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error;

/** Normalises RTK Query errors into a message plus per-field messages. */
export function parseApiError(error: unknown): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  if (isFetchBaseQueryError(error)) {
    if (error.status === 'FETCH_ERROR') {
      return { message: 'Cannot reach the server. Is the API running?', fieldErrors: {} };
    }
    if (error.status === 'PARSING_ERROR' || error.status === 'TIMEOUT_ERROR') {
      return { message: FALLBACK, fieldErrors: {} };
    }

    const body = error.data as ErrorBody | undefined;
    const fieldErrors = Object.fromEntries(
      Object.entries(body?.errors ?? {}).map(([key, messages]) => [key, messages[0] ?? '']),
    );
    return { message: body?.message ?? FALLBACK, fieldErrors };
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return { message: String((error as { message?: unknown }).message ?? FALLBACK), fieldErrors: {} };
  }

  return { message: FALLBACK, fieldErrors: {} };
}
