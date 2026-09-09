import type { ApiResponse, CartItem, CartTotals, Product, Review, ReviewSummary } from '@/types';
import { baseApi } from './baseApi';

export const catalogueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ApiResponse<{ products: Product[] }>, { featured?: boolean } | void>({
      query: (params) => (params?.featured ? '/products?featured=true' : '/products'),
      providesTags: ['Product'],
    }),
    getProduct: builder.query<ApiResponse<{ product: Product }>, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: ['Product'],
    }),
    getRelatedProducts: builder.query<ApiResponse<{ products: Product[] }>, string>({
      query: (slug) => `/products/${slug}/related`,
      providesTags: ['Product'],
    }),
    getReviews: builder.query<
      ApiResponse<{ reviews: Review[]; summary: ReviewSummary }>,
      string
    >({
      query: (slug) => `/products/${slug}/reviews`,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation<
      ApiResponse<{ review: Review }>,
      { slug: string; rating: number; title?: string; body: string }
    >({
      query: ({ slug, ...body }) => ({
        url: `/products/${slug}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),
    searchProducts: builder.query<
      ApiResponse<{ query: string; total: number; products: Product[] }>,
      string
    >({
      query: (q) => `/products/search?q=${encodeURIComponent(q)}&limit=8`,
      providesTags: ['Product'],
    }),
    getSearchFacets: builder.query<
      ApiResponse<{ accords: string[]; notes: string[]; seasons: string[]; fragrances: string[] }>,
      void
    >({
      query: () => '/products/search/facets',
      providesTags: ['Product'],
    }),
    validateCart: builder.query<ApiResponse<CartTotals>, CartItem[]>({
      query: (items) => ({ url: '/cart/validate', method: 'POST', body: { items } }),
      providesTags: ['Cart'],
    }),
  }),
});

export const {
  useSearchProductsQuery,
  useGetSearchFacetsQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetRelatedProductsQuery,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useValidateCartQuery,
} = catalogueApi;
