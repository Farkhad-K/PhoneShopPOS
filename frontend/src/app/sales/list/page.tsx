import { BaseLayout } from '@/components/layouts/base-layout'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { MetricCard } from '@/components/shared/metric-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetSalesQuery } from '@/api/sales'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, DollarSign, TrendingUp, Percent } from 'lucide-react'
import { format } from 'date-fns'
import { debounce } from '@/lib/debounce'

export default function SalesListPage() {
  const navigate = useNavigate()

  const [filters, setFilters] = useState<SaleFilterParams>({
    page: 1,
    limit: 20,
    paymentStatus: undefined,
    search: '',
  })

  const { data, isLoading } = useGetSalesQuery(filters)

  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }))
  }, [])

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  )

  const sales = data?.data || []

  const metrics = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0)
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0)
    const avgProfitMargin =
      sales.length > 0
        ? (totalProfit / totalRevenue) * 100
        : 0

    return {
      totalRevenue,
      totalProfit,
      avgProfitMargin,
    }
  }, [sales])

  const columns: ColumnDef<Sale>[] = useMemo(
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
          if (!phone) return 'N/A'
          return (
            <div>
              <div className="font-medium">
                {phone.brand} {phone.model}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {phone.barcode}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: ({ row }) => {
          const customer = row.original.customer
          return customer ? (
            <div>
              <div>{customer.fullName}</div>
              <div className="text-sm text-muted-foreground">
                {customer.phoneNumber}
              </div>
            </div>
          ) : (
            'Walk-in'
          )
        },
      },
      {
        accessorKey: 'salePrice',
        header: 'Sale Price',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.salePrice),
      },
      {
        accessorKey: 'profit',
        header: 'Profit',
        cell: ({ row }) => {
          const profit = row.original.profit
          return (
            <span
              className={profit > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}
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
        cell: ({ row }) => <StatusBadge status={row.original.paymentStatus} />,
      },
      {
        accessorKey: 'saleDate',
        header: 'Date',
        cell: ({ row }) =>
          format(new Date(row.original.saleDate), 'MMM dd, yyyy'),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <BaseLayout title="Sales" description="Manage phone sales">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Sales"
      description={`Total: ${data?.meta.total || 0} sales`}
    >
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Revenue"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'UZS',
              minimumFractionDigits: 0,
            }).format(metrics.totalRevenue)}
            icon={DollarSign}
            iconClassName="text-green-600"
          />
          <MetricCard
            title="Total Profit"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'UZS',
              minimumFractionDigits: 0,
            }).format(metrics.totalProfit)}
            icon={TrendingUp}
            iconClassName="text-blue-600"
          />
          <MetricCard
            title="Avg Profit Margin"
            value={`${metrics.avgProfitMargin.toFixed(1)}%`}
            icon={Percent}
            iconClassName="text-purple-600"
          />
        </div>

        <div className="flex gap-4 justify-between items-center">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, customer..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.paymentStatus || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus:
                    value === 'all' ? undefined : (value as PaymentStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PARTIAL">Partial</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => navigate('/sales/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['all', 'PAID', 'PARTIAL', 'UNPAID'].map((status) => (
            <Button
              key={status}
              variant={
                (filters.paymentStatus || 'all') === status
                  ? 'default'
                  : 'outline'
              }
              size="sm"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  paymentStatus:
                    status === 'all' ? undefined : (status as PaymentStatus),
                  page: 1,
                }))
              }
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={sales}
          onRowClick={(sale) => navigate(`/sales/${sale.id}`)}
        />
      </div>
    </BaseLayout>
  )
}
