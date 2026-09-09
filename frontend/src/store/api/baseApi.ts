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
  baseUrl: API_URL,
  credentials: 'include',
});

// Single in-flight refresh; parallel 401s wait instead of stampeding the API.
const refreshMutex = new Mutex();

/**
 * On a 401 the access cookie has expired: refresh once, then replay the request.
 * A failed refresh clears the session and lets the original 401 surface.
 */
const baseQueryWithReauth: BaseQueryFn<
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
        api.dispatch({ type: 'auth/sessionExpired' });
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
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Product', 'Review', 'Cart', 'Order'],
  endpoints: () => ({}),
});
