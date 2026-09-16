import type { ApiResponse } from '@/types';
import { baseApi } from './baseApi';

export interface PrebookingPayload {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  quantity: number;
  slug?: string;
  source: 'product' | 'restock';
}

export interface MyPrebooking {
  slug: string;
  quantity: number;
  status: string;
}

/**
 * Pre-bookings go through the shared API slice, so the session cookie, the
 * refresh-and-replay behaviour and the error shape are the same as everywhere
 * else rather than a bare fetch inside a component.
 */
export const prebookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPrebooking: builder.mutation<
      ApiResponse<{ alreadyPrebooked: boolean }>,
      PrebookingPayload
    >({
      query: (body) => ({ url: '/prebookings', method: 'POST', body }),
      invalidatesTags: ['Prebooking'],
    }),
    getMyPrebookings: builder.query<ApiResponse<{ prebookings: MyPrebooking[] }>, void>({
      query: () => '/prebookings/mine',
      providesTags: ['Prebooking'],
    }),
  }),
});

export const { useCreatePrebookingMutation, useGetMyPrebookingsQuery } = prebookingApi;
