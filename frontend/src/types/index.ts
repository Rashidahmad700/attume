export type UserRole = 'customer' | 'admin';

export interface Address {
  _id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
}

/** Envelope returned by every Express endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiErrorShape {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface Accord {
  name: string;
  strength: number;
}

export interface NotePyramid {
  top: string[];
  middle: string[];
  base: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  tagline: string;
  description: string;
  concentration: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number;
  discountPercent: number;
  stock: number;
  inStock: boolean;
  isLowStock: boolean;
  status: 'draft' | 'active' | 'archived';
  isFeatured: boolean;
  badge?: string;
  images: { url: string; alt?: string }[];
  accords: Accord[];
  notes: NotePyramid;
  inspiredBy?: { name: string; house: string; closeness?: string };
  performance: { longevity: string; sillage: string; concentrationPct?: string };
  wear: { seasons: string[]; times: string[] };
  highlights: string[];
  details: {
    ingredients: string;
    howToUse: string[];
    bestBefore: string;
    manufacturedBy: string;
    countryOfOrigin: string;
  };
  rating: { average: number; count: number };
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  distribution: { stars: number; count: number }[];
}

/** What the browser stores — never prices, only what was chosen. */
export interface CartItem {
  slug: string;
  quantity: number;
}

/** What the API returns after re-pricing a stored cart. */
export interface CartLine {
  id?: string;
  slug: string;
  name?: string;
  tagline?: string;
  sku?: string;
  sizeMl?: number;
  concentration?: string;
  image?: string;
  price?: number;
  compareAtPrice?: number;
  quantity: number;
  requestedQuantity?: number;
  subtotal?: number;
  stock?: number;
  available: boolean;
  adjusted?: boolean;
  reason?: string;
}

export interface CartTotals {
  lines: CartLine[];
  amounts: { subtotal: number; shipping: number; discount: number; total: number };
  itemCount: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  maxQuantityPerLine: number;
}
