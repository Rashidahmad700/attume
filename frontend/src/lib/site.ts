/** Canonical origin, shared by metadata, robots and the sitemap. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://houseofattume.com').replace(/\/+$/, '');

export const site = {
  name: 'attume',
  /**
   * The registered entity behind the shop.
   *
   * Razorpay requires the full legal name to appear on the site before net
   * banking is enabled — a customer's bank statement will read this, not
   * "attume", and a mismatch between the two is what the checks look for.
   * It is deliberately separate from `name`: the brand is lowercase attume
   * everywhere the customer is being spoken to, and this is the paperwork.
   */
  legalName: 'ATTUME FRAGRANCE LLP',
  tagline: 'Two Scents. Two Worlds.',
  description:
    'attume is an Indian fragrance house crafting extrait de parfum in small batches — considered, long-wearing and quietly distinct.',
  email: 'attume.official@gmail.com',
  phone: '+91 7289898320',
  address: 'D-2, H-758/A, Samsul Road, Jaitpur, Badarpur, New Delhi 110044',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? 'attume.official',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/attume.official',
  whatsapp: '917289898320',
  // Rotating strip above the header, in the order they appear.
  // The only strip on the page. It absorbed the ribbon that used to sit under
  // the hero, so IFRA, cruelty-free and the 50 ML size are carried here now
  // rather than repeated half a screen apart.
  announcements: [
    'Free shipping on every order',
    'Pre-booking open — no payment taken today',
    'Extrait de parfum · 50 ML',
    'IFRA compliant',
    'Cruelty free',
    "Crafted with one of India's top perfumers",
    'Proudly made in India',
  ],
} as const;



/**
 * Items marked `soon` are announcements, not navigation: they render as plain
 * labels with no href, because there is nothing behind them to visit.
 */
export const mainNav = [
  { label: 'Shop All', href: '/shop', soon: false },
  { label: 'Gifting', soon: true },
  { label: 'Attar', soon: true },
] as const;

export const footerNav = {
  categories: [
    { label: 'All Fragrances', href: '/shop' },
    { label: 'atolis', href: '/products/atolis' },
    { label: 'Santalyn', href: '/products/santalyn' },
  ],
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'My Orders', href: '/account/orders' },
  ],
  policies: [
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Refund Policy', href: '/policies/returns' },
    { label: 'Shipping Policy', href: '/policies/shipping' },
    { label: 'Terms of Service', href: '/policies/terms' },
  ],
} as const;
