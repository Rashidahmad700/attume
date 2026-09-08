import type { ApiResponse, Order, PlaceOrderPayload } from '@/types';
import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    placeOrder: builder.mutation<ApiResponse<{ order: Order }>, PlaceOrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'Cart'],
    }),
    getMyOrders: builder.query<ApiResponse<{ orders: Order[] }>, void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getMyOrder: builder.query<ApiResponse<{ order: Order }>, string>({
      query: (orderNumber) => `/orders/${orderNumber}`,
      providesTags: ['Order'],
    }),
    cancelMyOrder: builder.mutation<ApiResponse<{ order: Order }>, string>({
      query: (orderNumber) => ({ url: `/orders/${orderNumber}/cancel`, method: 'PATCH' }),
      invalidatesTags: ['Order', 'Product'],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
  useCancelMyOrderMutation,
} = orderApi;
