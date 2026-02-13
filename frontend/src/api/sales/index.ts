import { baseApi } from '@/api'
import { SALES } from '@/api/path'

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSales: builder.query<SaleListResponse, SaleFilterParams | void>({
      query: (params) => ({
        url: SALES.BASE,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['SALES'],
    }),

    getSaleById: builder.query<Sale, number>({
      query: (id) => ({
        url: SALES.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'SALES', id }],
    }),

    createSale: builder.mutation<Sale, CreateSaleRequest>({
      query: (data) => ({
        url: SALES.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SALES', 'PHONES', 'CUSTOMERS'],
    }),

    updateSale: builder.mutation<
      Sale,
      { id: number; data: UpdateSaleRequest }
    >({
      query: ({ id, data }) => ({
        url: SALES.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SALES', id },
        'SALES',
        'CUSTOMERS',
      ],
    }),

    deleteSale: builder.mutation<void, number>({
      query: (id) => ({
        url: SALES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['SALES', 'PHONES', 'CUSTOMERS'],
    }),
  }),
})

export const {
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useCreateSaleMutation,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesApi
