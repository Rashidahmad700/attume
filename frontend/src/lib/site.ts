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
  announcement: 'Complimentary shipping on all orders above ₹2000 · Crafted in India',
} as const;

export const mainNav = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Collections', href: '/collections' },
  { label: 'Discovery Set', href: '/discovery-set' },
  { label: 'The House', href: '/about' },
] as const;

export const footerNav = {
  shop: [
    { label: 'All Fragrances', href: '/shop' },
    { label: 'Extrait de Parfum', href: '/collections/extrait' },
    { label: 'Discovery Set', href: '/discovery-set' },
    { label: 'Gifting', href: '/gifting' },
  ],
  house: [
    { label: 'Our Story', href: '/about' },
    { label: 'Journal', href: '/journal' },
    { label: 'Layering Guide', href: '/journal/layering' },
    { label: 'Contact', href: '/contact' },
  ],
  care: [
    { label: 'Shipping & Delivery', href: '/policies/shipping' },
    { label: 'Returns & Exchanges', href: '/policies/returns' },
    { label: 'Privacy Policy', href: '/policies/privacy' },
    { label: 'Terms of Service', href: '/policies/terms' },
  ],
} as const;
