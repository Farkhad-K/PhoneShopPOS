import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDashboardStatsQuery } from '@/api/reports'
import { useGetSalesQuery } from '@/api/sales'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSign,
  Users,
  Smartphone,
  TrendingUp,
  Plus,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'

export default function PhoneShopDashboard() {
  const navigate = useNavigate()

  const { data: metrics, isLoading: metricsLoading } = useGetDashboardStatsQuery()
  const { data: salesData } = useGetSalesQuery({ page: 1, limit: 5 })

  const recentSales = salesData?.data || []

  const salesColumns: ColumnDef<Sale>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.original.phone
          return phone ? `${phone.brand} ${phone.model}` : 'N/A'
        },
      },
      {
        accessorKey: 'salePrice',
        header: 'Sale Price',
        cell: ({ row }) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.salePrice)
        },
      },
      {
        accessorKey: 'profit',
        header: 'Profit',
        cell: ({ row }) => {
          const profit = row.original.profit
          return (
            <span
              className={profit > 0 ? 'text-green-600' : 'text-red-600'}
            >
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'UZS',
                minimumFractionDigits: 0,
              }).format(profit)}
            </span>
          )
        },
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        cell: ({ row }) => (
          <StatusBadge status={row.original.paymentStatus} />
        ),
      },
      {
        accessorKey: 'saleDate',
        header: 'Date',
        cell: ({ row }) => {
          return format(new Date(row.original.saleDate), 'MMM dd, yyyy')
        },
      },
    ],
    []
  )

  const PHONE_STATUS_COLORS: Record<PhoneStatus, string> = {
    IN_STOCK: '#3b82f6',
    IN_REPAIR: '#eab308',
    READY_FOR_SALE: '#22c55e',
    SOLD: '#6b7280',
    RETURNED: '#ef4444',
  }

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Month Revenue"
            value={
              metrics?.sales.monthRevenue
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(metrics.sales.monthRevenue)
                : '0 UZS'
            }
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
            value={
              metrics?.financial.monthProfit
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(metrics.financial.monthProfit)
                : '0 UZS'
            }
            icon={TrendingUp}
            iconClassName="text-orange-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>In Stock</span>
                  <span className="font-bold">{metrics?.inventory.inStock || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ready for Sale</span>
                  <span className="font-bold">{metrics?.inventory.readyForSale || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>In Repair</span>
                  <span className="font-bold text-orange-600">{metrics?.inventory.inRepair || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sold</span>
                  <span className="font-bold text-green-600">{metrics?.inventory.sold || 0}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="font-semibold">Available</span>
                  <span className="font-bold text-blue-600">{metrics?.inventory.available || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales & Repairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Sales</div>
                  <div className="flex justify-between items-center">
                    <span>Today</span>
                    <span className="font-bold">{metrics?.sales.today || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Week</span>
                    <span className="font-bold">{metrics?.sales.thisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold">{metrics?.sales.thisMonth || 0}</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground mb-2">Repairs</div>
                  <div className="flex justify-between items-center">
                    <span>Pending</span>
                    <span className="font-bold text-orange-600">{metrics?.repairs.pending || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>In Progress</span>
                    <span className="font-bold text-blue-600">{metrics?.repairs.inProgress || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={salesColumns}
              data={recentSales}
              onRowClick={(sale) => navigate(`/sales/${sale.id}`)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
