import type { SVGProps } from 'react';

/** Hairline stroke icon set — matches the packaging line-art weight. */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
} as const;

export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** Confirmation — a heavier stroke than the set, so it reads at 16px. */
export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...props} aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const BagIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const WhatsappIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M3.5 20.5 5 16.6a8 8 0 1 1 3.1 2.9l-4.6 1Z" />
    <path d="M9 9.5c0 3 2.4 5.4 5.4 5.4l.9-1.4-1.9-1-.8.9a4.6 4.6 0 0 1-2-2l.9-.8-1-1.9-1.5.8Z" />
  </svg>
);

export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M12 20.3 10.4 18.8C5.4 14.3 2 11.3 2 7.6 2 4.6 4.3 2.3 7.3 2.3c1.7 0 3.3.8 4.7 2.1 1.4-1.3 3-2.1 4.7-2.1 3 0 5.3 2.3 5.3 5.3 0 3.7-3.4 6.7-8.4 11.2L12 20.3Z" />
  </svg>
);

export const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.2" />
  </svg>
);

export const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
    <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.8M6.5 7.7A15.8 15.8 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 3.6-.7" />
    <path d="M10 10a2.8 2.8 0 0 0 4 4" />
    <path d="m4 4 16 16" />
  </svg>
);
