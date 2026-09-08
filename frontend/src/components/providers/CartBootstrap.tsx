'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { hydrate, readStoredCart } from '@/store/slices/cartSlice';

/** Loads the stored cart after mount so server and client markup agree. */
export function CartBootstrap() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrate(readStoredCart()));
  }, [dispatch]);

  return null;
}
