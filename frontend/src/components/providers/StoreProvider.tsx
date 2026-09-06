'use client';

import { useRef, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore, setupStoreListeners, type AppStore } from '@/store';

/** One store per browser session; a fresh store per request on the server. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupStoreListeners(storeRef.current);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
