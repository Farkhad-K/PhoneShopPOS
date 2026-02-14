import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { useGetDashboardStatsQuery } from '@/api/reports'
import { useGetPhonesQuery } from '@/api/phones'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Smartphone,
  Package,
  Wrench,
  AlertTriangle,
} from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

const PHONE_STATUS_COLORS: Record<string, string> = {
  IN_STOCK: '#3b82f6',
  IN_REPAIR: '#eab308',
  READY_FOR_SALE: '#22c55e',
  SOLD: '#6b7280',
  RETURNED: '#ef4444',
}

export default function InventoryReportPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery()
  const { data: phonesData, isLoading: phonesLoading } = useGetPhonesQuery({
    page: 1,
    limit: 100,
    status: undefined,
    search: '',
  })

  const phones = phonesData?.data || []

  const statusChartData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'In Stock', value: stats.inventory.inStock, status: 'IN_STOCK' },
      { name: 'In Repair', value: stats.inventory.inRepair, status: 'IN_REPAIR' },
      { name: 'Ready for Sale', value: stats.inventory.readyForSale, status: 'READY_FOR_SALE' },
      { name: 'Sold', value: stats.inventory.sold, status: 'SOLD' },
    ].filter((item) => item.value > 0)
  }, [stats])

  const slowMovingPhones = useMemo(() => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return phones
      .filter(
        (phone) =>
          phone.status !== 'SOLD' &&
          new Date(phone.createdAt) < thirtyDaysAgo
      )
      .map((phone) => ({
        id: phone.id,
        brand: phone.brand,
        model: phone.model,
        barcode: phone.barcode,
        status: phone.status,
        daysInStock: Math.floor(
          (Date.now() - new Date(phone.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
        purchasePrice: phone.purchasePrice,
        totalCost: phone.totalCost,
      }))
      .sort((a, b) => b.daysInStock - a.daysInStock)
  }, [phones])

  const slowMovingColumns: ColumnDef<(typeof slowMovingPhones)[0]>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.brand} {row.original.model}
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {row.original.barcode}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'daysInStock',
        header: 'Days in Stock',
        cell: ({ row }) => (
          <span className="font-medium text-orange-600">
            {row.original.daysInStock} days
          </span>
        ),
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.totalCost),
      },
    ],
    []
  )

  const isLoading = statsLoading || phonesLoading

  if (isLoading) {
    return (
      <>
        <PageHeader title="Inventory Report" description="View inventory performance" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  if (!stats) {
    return (
      <>
        <PageHeader title="Inventory Report" description="No data available" />
        <div className="text-center p-8">
          <p className="text-muted-foreground">No inventory data available</p>
        </div>
      </>
    )
  }

  const { inventory } = stats

  return (
    <>
      <PageHeader title="Inventory Report" description="Comprehensive inventory analysis" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Total Phones"
            value={inventory.totalPhones}
            icon={Smartphone}
            iconClassName="text-blue-600"
          />
          <MetricCard
            title="Available for Sale"
            value={inventory.available}
            icon={Package}
            iconClassName="text-green-600"
          />
          <MetricCard
            title="In Repair"
            value={inventory.inRepair}
            icon={Wrench}
            iconClassName="text-yellow-600"
          />
          <MetricCard
            title="Slow-Moving Items"
            value={slowMovingPhones.length}
            icon={AlertTriangle}
            iconClassName="text-orange-600"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Phones by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PHONE_STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="IN_STOCK" />
                    <span className="text-sm">{inventory.inStock} phones</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="IN_REPAIR" />
                    <span className="text-sm">{inventory.inRepair} phones</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="READY_FOR_SALE" />
                    <span className="text-sm">{inventory.readyForSale} phones</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="SOLD" />
                    <span className="text-sm">{inventory.sold} phones</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Inventory
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {inventory.totalPhones} phones
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Available (In Stock + Ready for Sale)
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {inventory.available} phones
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    In Stock: {inventory.inStock} | Ready: {inventory.readyForSale}
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Under Repair
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventory.inRepair} phones
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Sold
                  </p>
                  <p className="text-2xl font-bold text-gray-600">
                    {inventory.sold} phones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {slowMovingPhones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Slow-Moving Inventory (30+ days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={slowMovingColumns}
                data={slowMovingPhones}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inventory Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Recommendations:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {slowMovingPhones.length > 0 && (
                  <li>
                    Consider promotional pricing for {slowMovingPhones.length} slow-moving items
                  </li>
                )}
                {inventory.inRepair > 0 && (
                  <li>
                    Complete {inventory.inRepair} pending repairs to increase saleable inventory
                  </li>
                )}
                {inventory.available === 0 && (
                  <li>
                    No phones available for sale — consider new purchases
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
