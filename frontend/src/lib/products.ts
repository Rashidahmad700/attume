import type { Product } from '@/types';

/**
 * Placeholder catalogue for Phase 1 — replaced by a real /products fetch
 * once the product model lands in a later phase.
 */
export const featuredProducts: Product[] = [
  {
    id: 'p-atolis',
    slug: 'atolis',
    name: 'atolis',
    tagline: 'Crisp apple, bright citrus, a quiet warmth beneath',
    notes: ['Apple', 'Bergamot', 'Cardamom', 'Driftwood'],
    price: 2499,
    compareAtPrice: 2999,
    size: '50 ML',
    image: '/products/atolis.jpg',
    badge: 'Bestseller',
  },
  {
    id: 'p-santalyn',
    slug: 'santalyn',
    name: 'Santalyn',
    tagline: 'Creamy sandalwood laid over warm amber and musk',
    notes: ['Sandalwood', 'Amber', 'Tonka', 'Musk'],
    price: 2699,
    size: '50 ML',
    image: '/products/santalyn.jpg',
    badge: 'New',
  },
  {
    id: 'p-noirette',
    slug: 'noirette',
    name: 'Noirette',
    tagline: 'Smoked leather and dark plum for the after hours',
    notes: ['Leather', 'Plum', 'Oud', 'Vetiver'],
    price: 2899,
    size: '50 ML',
    image: '/products/noirette.jpg',
  },
  {
    id: 'p-verdant',
    slug: 'verdant',
    name: 'Verdant',
    tagline: 'Fig leaf and green moss, cool as morning shade',
    notes: ['Fig Leaf', 'Moss', 'Vetiver', 'White Musk'],
    price: 2499,
    size: '50 ML',
    image: '/products/verdant.jpg',
  },
];

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
