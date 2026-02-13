import { baseApi } from '@/api'
import { CUSTOMERS } from '@/api/path'

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerListResponse, void>({
      query: () => ({
        url: CUSTOMERS.BASE,
        method: 'GET',
      }),
      providesTags: ['CUSTOMERS'],
    }),

    getCustomerById: builder.query<Customer, number>({
      query: (id) => ({
        url: CUSTOMERS.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'CUSTOMERS', id }],
    }),

    getCustomerBalance: builder.query<CustomerBalance, number>({
      query: (id) => ({
        url: CUSTOMERS.BALANCE(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [
        { type: 'CUSTOMERS', id },
        'PAYMENTS',
      ],
    }),

    createCustomer: builder.mutation<Customer, CreateCustomerRequest>({
      query: (data) => ({
        url: CUSTOMERS.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CUSTOMERS'],
    }),

    updateCustomer: builder.mutation<
      Customer,
      { id: number; data: UpdateCustomerRequest }
    >({
      query: ({ id, data }) => ({
        url: CUSTOMERS.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'CUSTOMERS', id },
        'CUSTOMERS',
      ],
    }),

    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({
        url: CUSTOMERS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['CUSTOMERS'],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerBalanceQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi
