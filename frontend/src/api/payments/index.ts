import { baseApi } from '@/api'
import { PAYMENTS } from '@/api/path'

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<PaymentListResponse, void>({
      query: () => ({
        url: PAYMENTS.BASE,
        method: 'GET',
      }),
      providesTags: ['PAYMENTS'],
    }),

    getPaymentById: builder.query<Payment, number>({
      query: (id) => ({
        url: PAYMENTS.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'PAYMENTS', id }],
    }),

    createPayment: builder.mutation<Payment, CreatePaymentRequest>({
      query: (data) => ({
        url: PAYMENTS.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PAYMENTS', 'CUSTOMERS', 'SUPPLIERS', 'SALES', 'PURCHASES'],
    }),

    applyPayment: builder.mutation<void, ApplyPaymentRequest>({
      query: (data) => ({
        url: PAYMENTS.APPLY,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PAYMENTS', 'CUSTOMERS', 'SUPPLIERS', 'SALES', 'PURCHASES'],
    }),

    deletePayment: builder.mutation<void, number>({
      query: (id) => ({
        url: PAYMENTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['PAYMENTS', 'CUSTOMERS', 'SUPPLIERS'],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useApplyPaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi
