import { baseApi } from '@/api'
import { REPAIRS } from '@/api/path'

export const repairsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepairs: builder.query<RepairListResponse, RepairFilterParams | void>({
      query: (params) => ({
        url: REPAIRS.BASE,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPAIRS'],
    }),

    getRepairById: builder.query<Repair, number>({
      query: (id) => ({
        url: REPAIRS.BY_ID(id),
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: 'REPAIRS', id }],
    }),

    createRepair: builder.mutation<Repair, CreateRepairRequest>({
      query: (data) => ({
        url: REPAIRS.BASE,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['REPAIRS', 'PHONES'],
    }),

    updateRepair: builder.mutation<
      Repair,
      { id: number; data: UpdateRepairRequest }
    >({
      query: ({ id, data }) => ({
        url: REPAIRS.BY_ID(id),
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'REPAIRS', id },
        'REPAIRS',
        'PHONES',
      ],
    }),

    completeRepair: builder.mutation<Repair, number>({
      query: (id) => ({
        url: REPAIRS.COMPLETE(id),
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'REPAIRS', id },
        'REPAIRS',
        'PHONES',
      ],
    }),

    deleteRepair: builder.mutation<void, number>({
      query: (id) => ({
        url: REPAIRS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['REPAIRS', 'PHONES'],
    }),
  }),
})

export const {
  useGetRepairsQuery,
  useGetRepairByIdQuery,
  useCreateRepairMutation,
  useUpdateRepairMutation,
  useCompleteRepairMutation,
  useDeleteRepairMutation,
} = repairsApi
