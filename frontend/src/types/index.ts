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

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  notes: string[];
  price: number;
  compareAtPrice?: number;
  size: string;
  image: string;
  badge?: string;
}
