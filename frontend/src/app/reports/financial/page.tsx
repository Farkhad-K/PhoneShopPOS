import { BaseLayout } from '@/components/layouts/base-layout'
import { MetricCard } from '@/components/shared/metric-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGetFinancialReportQuery } from '@/api/reports'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Download,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { format } from 'date-fns'

export default function FinancialReportPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const { data: report, isLoading } = useGetFinancialReportQuery(dateRange)

  const handleExport = () => {
    if (!report) return

    const csvContent = [
      ['Phone Shop POS - Financial Report'],
      ['Period', `${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Summary'],
      ['Total Revenue', report.summary.totalRevenue],
      ['Total Cost', report.summary.totalCost],
      ['Total Profit', report.summary.totalProfit],
      ['Profit Margin', `${report.summary.profitMargin}%`],
      [],
      ['Sales'],
      ['Count', report.sales.count],
      ['Total Amount', report.sales.totalAmount],
      ['Average Price', report.sales.averagePrice],
      [],
      ['Purchases'],
      ['Count', report.purchases.count],
      ['Total Amount', report.purchases.totalAmount],
      ['Average Price', report.purchases.averagePrice],
      [],
      ['Repairs'],
      ['Count', report.repairs.count],
      ['Total Cost', report.repairs.totalCost],
      ['Average Cost', report.repairs.averageCost],
      [],
      ['Payments'],
      ['Received', report.payments.received],
      ['Paid', report.payments.paid],
      ['Outstanding', report.payments.outstanding],
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${dateRange.startDate}-${dateRange.endDate}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <BaseLayout
        title="Financial Report"
        description="View financial performance"
      >
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout
      title="Financial Report"
      description={`${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`}
    >
      <div className="space-y-6 p-6">
        <div className="flex gap-4 items-end justify-between">
          <div className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    startDate: today.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                  })
                }}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const firstDay = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  )
                  setDateRange({
                    startDate: firstDay.toISOString().split('T')[0],
                    endDate: today.toISOString().split('T')[0],
                  })
                }}
              >
                This Month
              </Button>
            </div>
          </div>

          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {report && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(report.summary.totalRevenue)}
                icon={DollarSign}
                iconClassName="text-green-600"
              />
              <MetricCard
                title="Total Cost"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(report.summary.totalCost)}
                icon={TrendingDown}
                iconClassName="text-red-600"
              />
              <MetricCard
                title="Total Profit"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(report.summary.totalProfit)}
                icon={TrendingUp}
                iconClassName="text-blue-600"
              />
              <MetricCard
                title="Profit Margin"
                value={`${report.summary.profitMargin.toFixed(1)}%`}
                icon={Percent}
                iconClassName="text-purple-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Financial Overview',
                        Revenue: report.summary.totalRevenue,
                        Cost: report.summary.totalCost,
                        Profit: report.summary.totalProfit,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#22c55e" />
                    <Bar dataKey="Cost" fill="#ef4444" />
                    <Bar dataKey="Profit" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sales:</span>
                    <span className="font-semibold">{report.sales.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.sales.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Price:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.sales.averagePrice)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchases Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Purchases:
                    </span>
                    <span className="font-semibold">
                      {report.purchases.count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.purchases.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Price:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.purchases.averagePrice)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Repairs Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Repairs:</span>
                    <span className="font-semibold">{report.repairs.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.repairs.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Cost:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.repairs.averageCost)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payments Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Received
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.payments.received)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Paid</p>
                    <p className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.payments.paid)}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Outstanding
                    </p>
                    <p className="text-xl font-bold text-yellow-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(report.payments.outstanding)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </BaseLayout>
  )
}
