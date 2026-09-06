import type {
  Admin,
  ApiResponse,
  Customer,
  DashboardStats,
  Order,
  OrderStatus,
  Pagination,
  PaymentStatus,
  Product,
} from '@/types';
import { baseApi } from './baseApi';

export interface ProductQuery {
  search?: string;
  status?: string;
  stock?: 'in' | 'low' | 'out';
  page?: number;
}

export interface OrderQuery {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
}

const query = (params: object) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<{ admin: Admin }>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Admin'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Admin'],
    }),
    getCurrentAdmin: builder.query<ApiResponse<{ admin: Admin }>, void>({
      query: () => '/auth/me',
      providesTags: ['Admin'],
    }),

    getDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),

    getProducts: builder.query<
      ApiResponse<{ products: Product[]; pagination: Pagination }>,
      ProductQuery
    >({
      query: (params) => `/products${query(params)}`,
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation<ApiResponse<{ product: Product }>, Partial<Product>>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),
    updateProduct: builder.mutation<
      ApiResponse<{ product: Product }>,
      { id: string; body: Partial<Product> }
    >({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),
    updateStock: builder.mutation<ApiResponse<{ product: Product }>, { id: string; stock: number }>({
      query: ({ id, stock }) => ({ url: `/products/${id}/stock`, method: 'PATCH', body: { stock } }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),
    archiveProduct: builder.mutation<ApiResponse<{ product: Product }>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Product', 'Dashboard'],
    }),

    getOrders: builder.query<ApiResponse<{ orders: Order[]; pagination: Pagination }>, OrderQuery>({
      query: (params) => `/orders${query(params)}`,
      providesTags: ['Order'],
    }),
    getOrder: builder.query<ApiResponse<{ order: Order }>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<{ order: Order }>,
      { id: string; status: OrderStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Order', 'Dashboard', 'Product'],
    }),
    updatePaymentStatus: builder.mutation<
      ApiResponse<{ order: Order }>,
      { id: string; paymentStatus: PaymentStatus; note?: string }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/payment`, method: 'PATCH', body }),
      invalidatesTags: ['Order', 'Dashboard'],
    }),

    getCustomers: builder.query<
      ApiResponse<{ customers: Customer[]; pagination: Pagination }>,
      { search?: string; page?: number }
    >({
      query: (params) => `/customers${query(params)}`,
      providesTags: ['Customer'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentAdminQuery,
  useGetDashboardQuery,
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateStockMutation,
  useArchiveProductMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useGetCustomersQuery,
} = adminApi;
