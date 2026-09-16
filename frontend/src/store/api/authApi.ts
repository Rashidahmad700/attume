import type { ApiResponse, User } from '@/types';
import { baseApi } from './baseApi';

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginPayload {
  /** An email address or a phone number — the API resolves whichever it is. */
  identifier: string;
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
    requestPasswordReset: builder.mutation<{ success: boolean; message: string }, string>({
      query: (email) => ({ url: '/auth/forgot-password', method: 'POST', body: { email } }),
    }),
    resetPassword: builder.mutation<UserResponse, { token: string; password: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    sendOtp: builder.mutation<
      ApiResponse<{ destination: string; resendAfterSeconds: number; alreadyVerified?: boolean }>,
      { channel: 'email' | 'phone' }
    >({
      query: (body) => ({ url: '/auth/otp/send', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<UserResponse, { channel: 'email' | 'phone'; code: string }>({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<UserResponse, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
} = authApi;
