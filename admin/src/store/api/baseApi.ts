import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from './mutex';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/admin`,
  credentials: 'include',
});

const refreshMutex = new Mutex();

/** 401 → refresh the admin session once → replay. Failure ends the session. */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);

  const isRefreshCall = typeof args !== 'string' && args.url === '/auth/refresh-token';
  if (result.error?.status !== 401 || isRefreshCall) return result;

  if (!refreshMutex.isLocked()) {
    const release = await refreshMutex.acquire();
    try {
      const refresh = await rawBaseQuery(
        { url: '/auth/refresh-token', method: 'POST' },
        api,
        extraOptions,
      );
      if (refresh.data) {
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch({ type: 'adminAuth/sessionExpired' });
      }
    } finally {
      release();
    }
  } else {
    await refreshMutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Admin', 'Product', 'Order', 'Customer', 'Dashboard'],
  endpoints: () => ({}),
});
