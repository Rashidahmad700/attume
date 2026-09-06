import type { Address, ApiResponse, User } from '@/types';
import { baseApi } from './baseApi';

export type AddressPayload = Omit<Address, '_id' | 'isDefault'> & { isDefault?: boolean };

type UserResponse = ApiResponse<{ user: User }>;

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<UserResponse, { name?: string; phone?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    addAddress: builder.mutation<UserResponse, AddressPayload>({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateAddress: builder.mutation<UserResponse, { id: string; body: Partial<AddressPayload> }>({
      query: ({ id, body }) => ({ url: `/users/me/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    setDefaultAddress: builder.mutation<UserResponse, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}/default`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
    deleteAddress: builder.mutation<UserResponse, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} = userApi;
