import { baseApi } from '@/api'
import { WORKERS } from '@/api/path'

export const workersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkers: builder.query<WorkerListResponse, void>({
      query: () => ({
        url: WORKERS.BASE,
        method: 'GET',
      }),
      providesTags: ['WORKERS'],
    }),

    getWorkerById: builder.query<Worker, number>({
      query: (id) => ({
        url: WORKERS.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'WORKERS', id }],
    }),

    createWorker: builder.mutation<Worker, CreateWorkerRequest>({
      query: (data) => ({
        url: WORKERS.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WORKERS'],
    }),

    updateWorker: builder.mutation<
      Worker,
      { id: number; data: UpdateWorkerRequest }
    >({
      query: ({ id, data }) => ({
        url: WORKERS.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'WORKERS', id },
        'WORKERS',
      ],
    }),

    deleteWorker: builder.mutation<void, number>({
      query: (id) => ({
        url: WORKERS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['WORKERS'],
    }),

    // Worker Payments
    getWorkerPayments: builder.query<
      WorkerPaymentListResponse,
      { workerId?: number }
    >({
      query: (params) => ({
        url: WORKERS.PAYMENTS,
        method: 'GET',
        params,
      }),
      providesTags: ['WORKER_PAYMENTS'],
    }),

    createWorkerPayment: builder.mutation<
      WorkerPayment,
      CreateWorkerPaymentRequest
    >({
      query: (data) => ({
        url: WORKERS.PAYMENTS,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WORKER_PAYMENTS', 'WORKERS'],
    }),

    deleteWorkerPayment: builder.mutation<void, number>({
      query: (id) => ({
        url: WORKERS.PAYMENT_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['WORKER_PAYMENTS'],
    }),
  }),
})

export const {
  useGetWorkersQuery,
  useGetWorkerByIdQuery,
  useCreateWorkerMutation,
  useUpdateWorkerMutation,
  useDeleteWorkerMutation,
  useGetWorkerPaymentsQuery,
  useCreateWorkerPaymentMutation,
  useDeleteWorkerPaymentMutation,
} = workersApi
