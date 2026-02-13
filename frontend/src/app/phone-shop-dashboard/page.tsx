import { BaseLayout } from '@/components/layouts/base-layout'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { DataTable } from '@/components/shared/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetDashboardMetricsQuery } from '@/api/reports'
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

  const { data: metrics, isLoading: metricsLoading } = useGetDashboardMetricsQuery()
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
      <BaseLayout title="Dashboard" description="Phone Shop POS Dashboard">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Dashboard"
      description="Phone Shop POS Dashboard"
    >
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
            title="Total Revenue"
            value={
              metrics?.totalRevenue
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(metrics.totalRevenue)
                : '0 UZS'
            }
            change={metrics?.revenueChange}
            icon={DollarSign}
            iconClassName="text-green-600"
          />
          <MetricCard
            title="Active Customers"
            value={metrics?.activeCustomers || 0}
            change={metrics?.customersChange}
            icon={Users}
            iconClassName="text-blue-600"
          />
          <MetricCard
            title="Total Phones"
            value={metrics?.totalPhones || 0}
            change={metrics?.phonesChange}
            icon={Smartphone}
            iconClassName="text-purple-600"
          />
          <MetricCard
            title="Profit Rate"
            value={
              metrics?.profitRate
                ? `${metrics.profitRate.toFixed(1)}%`
                : '0%'
            }
            change={metrics?.profitRateChange}
            icon={TrendingUp}
            iconClassName="text-orange-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.revenueTrend || []}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorProfit"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22c55e"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      format(new Date(value), 'MMM dd')
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phone Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics?.phoneStatusDistribution || []}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.status}: ${entry.percentage}%`}
                  >
                    {(metrics?.phoneStatusDistribution || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PHONE_STATUS_COLORS[entry.status]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
    </BaseLayout>
  )
}
