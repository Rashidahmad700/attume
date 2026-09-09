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

export const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11H14.5V8.5Z" />
  </svg>
);

export const WhatsappIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M3.5 20.5 5 16.6a8 8 0 1 1 3.1 2.9l-4.6 1Z" />
    <path d="M9 9.5c0 3 2.4 5.4 5.4 5.4l.9-1.4-1.9-1-.8.9a4.6 4.6 0 0 1-2-2l.9-.8-1-1.9-1.5.8Z" />
  </svg>
);

export const LeafIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M20 4c-8 0-14 3.5-14 10a6 6 0 0 0 6 6c6.5 0 8-6 8-16Z" />
    <path d="M5 21c2-5 5.5-8.5 10-11" />
  </svg>
);

export const RabbitIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M8.5 11C7 8 6.5 4.5 8 3.5S11 5 11.5 9" />
    <path d="M13 9.5C13.5 5.5 15 3 16.5 3.8S17 8.5 15.5 11" />
    <path d="M6 16.5a5.5 5.5 0 0 1 11 0c0 2-1.5 3.5-3.5 3.5h-4C7.5 20 6 18.5 6 16.5Z" />
    <path d="M18 17c1.5 0 2.5.8 2.5 2" />
  </svg>
);

export const FlaskIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M10 3v6L5 18a2.5 2.5 0 0 0 2.2 3.5h9.6A2.5 2.5 0 0 0 19 18l-5-9V3" />
    <path d="M8.5 3h7" />
    <path d="M7 15h10" />
  </svg>
);

export const ShieldIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M12 2.8 5 5.5v5.8c0 4.3 2.9 8.2 7 9.4 4.1-1.2 7-5.1 7-9.4V5.5L12 2.8Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const HandIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M9 11V4.8a1.3 1.3 0 0 1 2.6 0V11" />
    <path d="M11.6 10.5V3.6a1.3 1.3 0 0 1 2.6 0v7.4" />
    <path d="M14.2 11V5.6a1.3 1.3 0 0 1 2.6 0V14" />
    <path d="M9 11.5 6.8 13a2 2 0 0 0-.6 2.8l2.3 3.4A4 4 0 0 0 11.8 21h2.6a4 4 0 0 0 4-4v-3" />
  </svg>
);

export const PinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props} aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);
