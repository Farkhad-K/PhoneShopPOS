import { baseApi } from '@/api'
import { SUPPLIERS } from '@/api/path'

export const suppliersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query<SupplierListResponse, void>({
      query: () => ({
        url: SUPPLIERS.BASE,
        method: 'GET',
      }),
      providesTags: ['SUPPLIERS'],
    }),

    getSupplierById: builder.query<Supplier, number>({
      query: (id) => ({
        url: SUPPLIERS.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'SUPPLIERS', id }],
    }),

    createSupplier: builder.mutation<Supplier, CreateSupplierRequest>({
      query: (data) => ({
        url: SUPPLIERS.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),

    updateSupplier: builder.mutation<
      Supplier,
      { id: number; data: UpdateSupplierRequest }
    >({
      query: ({ id, data }) => ({
        url: SUPPLIERS.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SUPPLIERS', id },
        'SUPPLIERS',
      ],
    }),

    deleteSupplier: builder.mutation<void, number>({
      query: (id) => ({
        url: SUPPLIERS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['SUPPLIERS'],
    }),
  }),
})

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
} = suppliersApi
