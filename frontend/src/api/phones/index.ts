import { baseApi } from '@/api'
import { PHONES } from '@/api/path'

export const phonesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPhones: builder.query<PhoneListResponse, PhoneFilterParams | void>({
      query: (params) => ({
        url: PHONES.BASE,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['PHONES'],
    }),

    getPhoneById: builder.query<Phone, number>({
      query: (id) => ({
        url: PHONES.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'PHONES', id }],
    }),

    updatePhone: builder.mutation<
      Phone,
      { id: number; data: Partial<Phone> }
    >({
      query: ({ id, data }) => ({
        url: PHONES.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PHONES', id },
        'PHONES',
      ],
    }),

    deletePhone: builder.mutation<void, number>({
      query: (id) => ({
        url: PHONES.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['PHONES'],
    }),
  }),
})

export const {
  useGetPhonesQuery,
  useGetPhoneByIdQuery,
  useUpdatePhoneMutation,
  useDeletePhoneMutation,
} = phonesApi
