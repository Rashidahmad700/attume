export const site = {
  name: 'attume',
  tagline: 'Experience the art of scent',
  description:
    'attume is an Indian fragrance house crafting extrait de parfum in small batches — considered, long-wearing and quietly distinct.',
  email: 'attume.official@gmail.com',
  phone: '+91 7289898320',
  address: 'D-2, H-758/A, Samsul Road, Jaipur, Badarpur, New Delhi 110044',
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? 'attume.official',
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? 'https://www.instagram.com/attume.official',
  whatsapp: '917289898320',
  // Rotating strip above the header, in the order they appear.
  announcements: [
    'Complimentary shipping on all orders above ₹2000',
    'Cash on delivery available above ₹999',
    'Extrait de parfum · 30%+ fragrance load',
    'Small batch · Proudly made in India',
  ],
} as const;

/** Circular collection tiles on the home page. */
export const collections = [
  {
    label: 'Extrait de Parfum',
    href: '/shop',
    caption: '50 ml · full size',
    available: true,
  },
  {
    label: 'Discovery Set',
    href: '/discovery-set',
    caption: 'Both fragrances, 8 ml each',
    available: false,
  },
  {
    label: 'Gifting',
    href: '/gifting',
    caption: 'Boxed with a hand-written note',
    available: false,
  },
] as const;


// Only routes that exist — a nav link to a 404 is worse than no link.
export const mainNav = [
  { label: 'Shop All', href: '/shop' },
  { label: 'atolis', href: '/products/atolis' },
  { label: 'Santalyn', href: '/products/santalyn' },
] as const;

export const footerNav = {
  categories: [
    { label: 'All Fragrances', href: '/shop' },
    { label: 'atolis', href: '/products/atolis' },
    { label: 'Santalyn', href: '/products/santalyn' },
    { label: 'Discovery Set', href: '/discovery-set' },
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
