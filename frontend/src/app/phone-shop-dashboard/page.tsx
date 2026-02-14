import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetDashboardStatsQuery } from '@/api/reports'
import { useGetSalesQuery } from '@/api/sales'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Users,
  Smartphone,
  TrendingUp,
  Plus,
  Package,
  CheckCircle2,
  Wrench,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Clock,
  Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

const PAGE_SIZE = 10

function formatUZS(value: number | null | undefined): string {
  if (value == null || isNaN(Number(value))) return 'UZS 0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(Number(value))
}

type PaymentFilter = 'all' | 'PAID' | 'UNPAID' | 'PARTIAL'

export default function PhoneShopDashboard() {
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')

  const { data: metrics, isLoading: metricsLoading } =
    useGetDashboardStatsQuery()

  const salesQueryParams: SaleFilterParams = {
    page: currentPage,
    limit: PAGE_SIZE,
    ...(paymentFilter !== 'all' && {
      paymentStatus: paymentFilter as PaymentStatus,
    }),
  }

  const { data: salesData, isFetching: salesFetching } =
    useGetSalesQuery(salesQueryParams)

  const recentSales = salesData?.data || []
  const totalPages = salesData?.meta?.totalPages || 1
  const totalSalesCount = salesData?.meta?.total || 0

  const handleFilterChange = useCallback((value: string) => {
    setPaymentFilter(value as PaymentFilter)
    setCurrentPage(1)
  }, [])

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1))
  }, [])

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1))
  }, [totalPages])

  if (metricsLoading) {
    return (
      <>
        <PageHeader title="Dashboard" description="Phone Shop POS Dashboard" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Dashboard" description="Phone Shop POS Dashboard" />
      <div className="space-y-6 p-6">
        {/* Quick Actions */}
        <div className="flex gap-2 justify-end">
          <Button onClick={() => navigate('/purchases/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Button>
          <Button onClick={() => navigate('/sales/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Month Revenue"
            value={formatUZS(metrics?.sales.monthRevenue)}
            icon={DollarSign}
            iconClassName="text-green-600"
          />
          <MetricCard
            title="Month Sales"
            value={metrics?.sales.thisMonth || 0}
            icon={Users}
            iconClassName="text-blue-600"
          />
          <MetricCard
            title="Total Phones"
            value={metrics?.inventory.totalPhones || 0}
            icon={Smartphone}
            iconClassName="text-purple-600"
          />
          <MetricCard
            title="Month Profit"
            value={formatUZS(metrics?.financial.monthProfit)}
            icon={TrendingUp}
            iconClassName="text-orange-600"
          />
        </div>

        {/* Inventory Status & Sales/Repairs */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Inventory Status - Redesigned */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Inventory Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                    In Stock
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics?.inventory.inStock || 0}
                  </p>
                </div>

                <div className="rounded-lg border bg-green-50 dark:bg-green-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    Ready for Sale
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {metrics?.inventory.readyForSale || 0}
                  </p>
                </div>

                <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5 text-amber-600" />
                    In Repair
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {metrics?.inventory.inRepair || 0}
                  </p>
                </div>

                <div className="rounded-lg border bg-gray-50 dark:bg-gray-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShoppingCart className="h-3.5 w-3.5 text-gray-500" />
                    Sold
                  </div>
                  <p className="text-2xl font-bold text-gray-500">
                    {metrics?.inventory.sold || 0}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Available
                </span>
                <span className="text-xl font-bold text-primary">
                  {metrics?.inventory.available || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Sales & Repairs - Redesigned */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Sales & Repairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Sales
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 space-y-1 text-center">
                      <CalendarDays className="h-4 w-4 text-muted-foreground mx-auto" />
                      <p className="text-xl font-bold">
                        {metrics?.sales.today || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1 text-center">
                      <CalendarRange className="h-4 w-4 text-muted-foreground mx-auto" />
                      <p className="text-xl font-bold">
                        {metrics?.sales.thisWeek || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This Week
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1 text-center">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground mx-auto" />
                      <p className="text-xl font-bold">
                        {metrics?.sales.thisMonth || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        This Month
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Repairs
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Pending
                          </p>
                          <p className="text-xl font-bold text-amber-600">
                            {metrics?.repairs.pending || 0}
                          </p>
                        </div>
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            In Progress
                          </p>
                          <p className="text-xl font-bold text-blue-600">
                            {metrics?.repairs.inProgress || 0}
                          </p>
                        </div>
                        <Loader2 className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales with Filters & Pagination */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Sales</CardTitle>
            <Tabs
              value={paymentFilter}
              onValueChange={handleFilterChange}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="PAID">Paid</TabsTrigger>
                <TabsTrigger value="UNPAID">Unpaid</TabsTrigger>
                <TabsTrigger value="PARTIAL">Partial</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Sale Price</TableHead>
                      <TableHead>Profit</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesFetching ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : recentSales.length > 0 ? (
                      recentSales.map((sale) => (
                        <TableRow
                          key={sale.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/sales/${sale.id}`)}
                        >
                          <TableCell>{sale.id}</TableCell>
                          <TableCell>
                            {sale.phone
                              ? `${sale.phone.brand} ${sale.phone.model}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>{formatUZS(sale.salePrice)}</TableCell>
                          <TableCell>
                            <span
                              className={
                                (sale.profit ?? 0) >= 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {formatUZS(sale.profit)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sale.paymentStatus} />
                          </TableCell>
                          <TableCell>
                            {format(new Date(sale.saleDate), 'MMM dd, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No sales found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                  {totalSalesCount > 0 && (
                    <span className="ml-1">
                      ({totalSalesCount} total)
                    </span>
                  )}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1 || salesFetching}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || salesFetching}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
