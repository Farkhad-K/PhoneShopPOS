import { baseApi } from '@/api'
import { REPORTS } from '@/api/path'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialReport: builder.query<
      FinancialReport,
      ReportFilterParams | void
    >({
      query: (params) => ({
        url: REPORTS.FINANCIAL,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getInventoryReport: builder.query<
      InventoryReport,
      ReportFilterParams | void
    >({
      query: (params) => ({
        url: REPORTS.INVENTORY,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getDashboardMetrics: builder.query<
      DashboardMetrics,
      ReportFilterParams | void
    >({
      query: (params) => ({
        url: REPORTS.DASHBOARD,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),
  }),
})

export const {
  useGetFinancialReportQuery,
  useGetInventoryReportQuery,
  useGetDashboardMetricsQuery,
} = reportsApi
