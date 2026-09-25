import type {
  ApiResponse,
  Order,
  PaymentInit,
  PlaceOrderPayload,
  VerifyPaymentPayload,
} from '@/types';
import { baseApi } from './baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** An online order comes back with `payment` — what Checkout needs to open. */
    placeOrder: builder.mutation<
      ApiResponse<{ order: Order; payment?: PaymentInit }>,
      PlaceOrderPayload
    >({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order', 'Product', 'Cart'],
    }),

    /**
     * Reports back what Checkout handed the browser. The server verifies the
     * signature and asks Razorpay what happened before believing any of it —
     * this is a shortcut to a confirmed order, not the thing that confirms it.
     * A 202 means the webhook has not settled it yet.
     */
    verifyPayment: builder.mutation<
      ApiResponse<{ order: Order; pending?: boolean }>,
      VerifyPaymentPayload
    >({
      query: ({ orderNumber, ...body }) => ({
        url: `/orders/${orderNumber}/pay/verify`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query<ApiResponse<{ orders: Order[] }>, void>({
      query: () => '/orders',
      providesTags: ['Order'],
    }),
    getMyOrder: builder.query<ApiResponse<{ order: Order }>, string>({
      query: (orderNumber) => `/orders/${orderNumber}`,
      providesTags: ['Order'],
    }),
  }),
});

export const {
  usePlaceOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetMyOrderQuery,
} = orderApi;
