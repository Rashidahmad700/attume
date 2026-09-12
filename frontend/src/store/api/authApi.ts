import type { ApiResponse, User } from '@/types';
import { baseApi } from './baseApi';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

type UserResponse = ApiResponse<{ user: User }>;

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<UserResponse, SignupPayload>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    login: builder.mutation<UserResponse, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    requestMagicLink: builder.mutation<{ success: boolean; message: string }, string>({
      query: (email) => ({ url: '/auth/magic-link', method: 'POST', body: { email } }),
    }),
    verifyMagicLink: builder.mutation<UserResponse, string>({
      query: (token) => ({ url: '/auth/magic-link/verify', method: 'POST', body: { token } }),
      invalidatesTags: ['User'],
    }),
    requestPasswordReset: builder.mutation<{ success: boolean; message: string }, string>({
      query: (email) => ({ url: '/auth/forgot-password', method: 'POST', body: { email } }),
    }),
    resetPassword: builder.mutation<UserResponse, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query<UserResponse, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useRequestMagicLinkMutation,
  useVerifyMagicLinkMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
