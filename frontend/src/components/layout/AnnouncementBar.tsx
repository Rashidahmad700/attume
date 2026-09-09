'use client';

import { useEffect } from 'react';
import { site } from '@/lib/site';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { dismissAnnouncement, setAnnouncementVisible } from '@/store/slices/uiSlice';
import { CloseIcon } from '@/components/ui/icons';

const STORAGE_KEY = 'attume:announcement-dismissed';

/**
 * Continuously scrolling offer strip. The list is duplicated so the CSS
 * translation loops without a visible seam.
 */
export function AnnouncementBar() {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector((state) => state.ui.isAnnouncementVisible);

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

  const messages = [...site.announcements, ...site.announcements];

  return (
    <div className="relative overflow-hidden bg-ink py-2.5 text-ivory">
      <div className="flex w-max animate-[ticker_34s_linear_infinite] items-center gap-12 pr-12">
        {messages.map((message, index) => (
          <span key={`${message}-${index}`} className="flex items-center gap-12 whitespace-nowrap">
            <span className="eyebrow text-ivory/85">{message}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-bronze" />
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcements"
        className="absolute top-1/2 right-3 -translate-y-1/2 bg-ink p-1.5 text-ivory/60 transition-colors hover:text-ivory sm:right-5"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
