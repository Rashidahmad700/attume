import type { CommerceConfig } from '@/lib/config';
import { baseApi } from './baseApi';

/**
 * The commerce mode, for components that render in the browser and so cannot
 * read it from the server the way a page does. Cached for the session: it
 * changes when the shop opens for business, not between clicks.
 */
export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommerceConfig: builder.query<CommerceConfig, void>({
      query: () => '/config',
      transformResponse: (response: { data: { commerce: CommerceConfig } }) =>
        response.data.commerce,
    }),
  }),
});

export const { useGetCommerceConfigQuery } = configApi;

/** True while the shop takes interest rather than orders. Defaults to true so a
 *  failed request never offers a bag that checkout would refuse. */
export function useIsPrebook(): boolean {
  const { data, isLoading } = useGetCommerceConfigQuery();
  return isLoading ? true : (data?.isPrebook ?? true);
}
