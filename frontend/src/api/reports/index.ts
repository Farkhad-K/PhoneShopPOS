import { baseApi } from '@/api'
import { REPORTS } from '@/api/path'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query<SalesReport, ReportFilterParams | void>({
      query: (params) => ({
        url: REPORTS.SALES,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getPurchasesReport: builder.query<
      PurchasesReport,
      ReportFilterParams | void
    >({
      query: (params) => ({
        url: REPORTS.PURCHASES,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getRepairsReport: builder.query<RepairsReport, ReportFilterParams | void>({
      query: (params) => ({
        url: REPORTS.REPAIRS,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getFinancialSummary: builder.query<
      FinancialSummary,
      ReportFilterParams | void
    >({
      query: (params) => ({
        url: REPORTS.FINANCIAL_SUMMARY,
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['REPORTS'],
    }),

    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: REPORTS.DASHBOARD,
        method: 'GET',
      }),
      providesTags: ['REPORTS'],
    }),
  }),
})

export const {
  useGetSalesReportQuery,
  useGetPurchasesReportQuery,
  useGetRepairsReportQuery,
  useGetFinancialSummaryQuery,
  useGetDashboardStatsQuery,
} = reportsApi
