import { BaseLayout } from '@/components/layouts/base-layout'
import { MetricCard } from '@/components/shared/metric-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { useGetInventoryReportQuery } from '@/api/reports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Smartphone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

const PHONE_STATUS_COLORS: Record<PhoneStatus, string> = {
  IN_STOCK: '#3b82f6',
  IN_REPAIR: '#eab308',
  READY_FOR_SALE: '#22c55e',
  SOLD: '#6b7280',
  RETURNED: '#ef4444',
}

const CONDITION_COLORS: Record<PhoneCondition, string> = {
  NEW: '#22c55e',
  LIKE_NEW: '#3b82f6',
  GOOD: '#eab308',
  FAIR: '#f97316',
  POOR: '#ef4444',
}

export default function InventoryReportPage() {
  const { data: report, isLoading } = useGetInventoryReportQuery()

  const slowMovingColumns: ColumnDef<{
    phoneId: number
    brand: string
    model: string
    daysInStock: number
    purchasePrice: number
  }>[] = useMemo(
    () => [
      {
        accessorKey: 'phoneId',
        header: 'ID',
      },
      {
        accessorKey: 'brand',
        header: 'Brand',
      },
      {
        accessorKey: 'model',
        header: 'Model',
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
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        cell: ({ row }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
          }).format(row.original.purchasePrice),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <BaseLayout
        title="Inventory Report"
        description="View inventory performance"
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  if (!report) {
    return (
      <BaseLayout
        title="Inventory Report"
        description="No data available"
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground">No inventory data available</p>
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Inventory Report"
      description="Comprehensive inventory analysis"
    >
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Total Phones"
            value={report.totalPhones}
            icon={Smartphone}
            iconClassName="text-blue-600"
          />
          <MetricCard
            title="Average Repair Cost"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'UZS',
              minimumFractionDigits: 0,
            }).format(report.averageRepairCost)}
            icon={DollarSign}
            iconClassName="text-yellow-600"
          />
          <MetricCard
            title="Average Sale Profit"
            value={new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'UZS',
              minimumFractionDigits: 0,
            }).format(report.averageSaleProfit)}
            icon={TrendingUp}
            iconClassName="text-green-600"
          />
          <MetricCard
            title="Slow-Moving Items"
            value={report.slowMovingInventory.length}
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
                    data={report.phonesByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                  >
                    {report.phonesByStatus.map((entry, index) => (
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
                {report.phonesByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="text-sm">{item.count} phones</span>
                    </div>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(item.totalValue)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phones by Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.phonesByCondition}>
                  <XAxis dataKey="condition" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6">
                    {report.phonesByCondition.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CONDITION_COLORS[entry.condition]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {report.phonesByCondition.map((item) => (
                  <div
                    key={item.condition}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm font-medium capitalize">
                      {item.condition.replace('_', ' ')}
                    </span>
                    <span className="text-sm">{item.count} phones</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {report.slowMovingInventory.length > 0 && (
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
                data={report.slowMovingInventory}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Inventory Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Total Inventory Value
                </p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'UZS',
                    minimumFractionDigits: 0,
                  }).format(
                    report.phonesByStatus.reduce(
                      (sum, item) => sum + item.totalValue,
                      0
                    )
                  )}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Available for Sale
                </p>
                <p className="text-xl font-bold">
                  {report.phonesByStatus.find(
                    (item) => item.status === 'READY_FOR_SALE'
                  )?.count || 0}{' '}
                  +{' '}
                  {report.phonesByStatus.find(
                    (item) => item.status === 'IN_STOCK'
                  )?.count || 0}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  In Repair Process
                </p>
                <p className="text-xl font-bold">
                  {report.phonesByStatus.find(
                    (item) => item.status === 'IN_REPAIR'
                  )?.count || 0}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Recommendations:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                {report.slowMovingInventory.length > 0 && (
                  <li>
                    Consider promotional pricing for {report.slowMovingInventory.length} slow-moving items
                  </li>
                )}
                {report.phonesByStatus.find((item) => item.status === 'IN_REPAIR')?.count && (
                  <li>
                    Complete pending repairs to increase saleable inventory
                  </li>
                )}
                {report.averageSaleProfit < 100000 && (
                  <li>
                    Review pricing strategy to improve profit margins
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}
