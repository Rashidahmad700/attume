export type ProductStatus = 'draft' | 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  tagline: string;
  description: string;
  notes: string[];
  concentration: string;
  sizeMl: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  badge?: string;
  images: { url: string; alt?: string }[];
  inStock: boolean;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone?: string };
  items: { name: string; sku: string; price: number; quantity: number; subtotal: number }[];
  amounts: { subtotal: number; shipping: number; discount: number; total: number };
  shippingAddress: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'cod' | 'online';
  timeline: { status: string; note?: string; at: string }[];
  placedAt: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addresses: unknown[];
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardStats {
  orders: Record<'total' | 'today' | 'thisWeek' | OrderStatus, number>;
  revenue: { allTime: number; last30Days: number };
  catalogue: { total: number; active: number; outOfStock: number; lowStock: number };
  customers: { total: number; newThisWeek: number };
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
