'use client';

import type { ReactNode } from 'react';
import { AuthBootstrap } from './AuthBootstrap';
import { CartBootstrap } from './CartBootstrap';
import { StoreProvider } from './StoreProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AuthBootstrap />
      <CartBootstrap />
      {children}
    </StoreProvider>
  );
}
