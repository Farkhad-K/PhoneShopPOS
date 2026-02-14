import { baseApi } from '@/api'
import { PURCHASES } from '@/api/path'

export const purchasesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query<
      PurchaseListResponse,
      PurchaseFilterParams | void
    >({
      query: (params) => ({
        url: PURCHASES.BASE,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['PURCHASES'],
    }),

    getPurchaseById: builder.query<Purchase, number>({
      query: (id) => ({
        url: PURCHASES.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'PURCHASES', id }],
    }),

    createPurchase: builder.mutation<Purchase, CreatePurchaseRequest>({
      query: (data) => ({
        url: PURCHASES.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PURCHASES', 'PHONES', 'SUPPLIERS'],
    }),

    updatePurchase: builder.mutation<
      Purchase,
      { id: number; data: Partial<CreatePurchaseRequest> }
    >({
      query: ({ id, data }) => ({
        url: PURCHASES.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PURCHASES', id },
        'PURCHASES',
        'PHONES',
      ],
    }),

    deletePurchase: builder.mutation<void, number>({
      query: (id) => ({
        url: PURCHASES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['PURCHASES', 'PHONES'],
    }),
  }),
})

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
} = purchasesApi
