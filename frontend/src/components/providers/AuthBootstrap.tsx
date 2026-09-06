'use client';

import { useGetCurrentUserQuery } from '@/store/api/authApi';

/**
 * Rehydrates the session on first paint. The httpOnly cookie is the source of
 * truth, so a single /auth/me call restores the user after a refresh.
 */
export function AuthBootstrap() {
  useGetCurrentUserQuery(undefined, { refetchOnMountOrArgChange: false });
  return null;
}
