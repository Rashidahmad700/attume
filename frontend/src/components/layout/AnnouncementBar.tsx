'use client';

import { useEffect } from 'react';
import { site } from '@/lib/site';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissAnnouncement, setAnnouncementVisible } from '@/store/slices/uiSlice';
import { CloseIcon } from '@/components/ui/icons';

const STORAGE_KEY = 'attume:announcement-dismissed';

export function AnnouncementBar() {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector((state) => state.ui.isAnnouncementVisible);

  // Respect a previous dismissal without flashing the bar back on navigation.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') {
        dispatch(setAnnouncementVisible(false));
      }
    } catch {
      /* storage blocked — keep the bar visible */
    }
  }, [dispatch]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    dispatch(dismissAnnouncement());
    try {
      window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative bg-ink text-ivory">
      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-10 py-2.5 sm:px-12">
        <p className="eyebrow text-center text-ivory/85">{site.announcement}</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5 text-ivory/60 transition-colors hover:text-ivory sm:right-6"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
