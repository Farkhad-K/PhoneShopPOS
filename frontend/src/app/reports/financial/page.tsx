import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/components/shared/metric-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  useGetFinancialSummaryQuery,
  useGetSalesReportQuery,
  useGetPurchasesReportQuery,
  useGetRepairsReportQuery,
} from '@/api/reports'
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

  const { data: summary, isLoading: summaryLoading } = useGetFinancialSummaryQuery(dateRange)
  const { data: salesReport } = useGetSalesReportQuery(dateRange)
  const { data: purchasesReport } = useGetPurchasesReportQuery(dateRange)
  const { data: repairsReport } = useGetRepairsReportQuery(dateRange)

  const handleExport = () => {
    if (!summary) return

    const csvContent = [
      ['Phone Shop POS - Financial Report'],
      ['Period', `${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Summary'],
      ['Total Revenue', summary.totalRevenue],
      ['Total Expenses', summary.totalExpenses],
      ['Net Profit', summary.netProfit],
      ['Profit Margin', `${summary.profitMargin}%`],
      [],
      ['Sales'],
      ['Count', salesReport?.totalSales ?? 'N/A'],
      ['Total Revenue', salesReport?.totalRevenue ?? 'N/A'],
      [],
      ['Purchases'],
      ['Count', purchasesReport?.totalPurchases ?? 'N/A'],
      ['Total Amount', purchasesReport?.totalAmount ?? 'N/A'],
      [],
      ['Repairs'],
      ['Count', repairsReport?.totalRepairs ?? 'N/A'],
      ['Total Cost', repairsReport?.totalRepairCost ?? 'N/A'],
      [],
      ['Receivables & Payables'],
      ['Receivables', summary.totalReceivables],
      ['Payables', summary.totalPayables],
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

  if (summaryLoading) {
    return (
      <>
        <PageHeader title="Financial Report" description="View financial performance" />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Financial Report" description={`${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`} />
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

        {summary && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard
                title="Total Revenue"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(summary.totalRevenue)}
                icon={DollarSign}
                iconClassName="text-green-600"
              />
              <MetricCard
                title="Total Expenses"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(summary.totalExpenses)}
                icon={TrendingDown}
                iconClassName="text-red-600"
              />
              <MetricCard
                title="Net Profit"
                value={new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'UZS',
                  minimumFractionDigits: 0,
                }).format(summary.netProfit)}
                icon={TrendingUp}
                iconClassName="text-blue-600"
              />
              <MetricCard
                title="Profit Margin"
                value={`${summary.profitMargin.toFixed(1)}%`}
                icon={Percent}
                iconClassName="text-purple-600"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Financial Overview',
                        Revenue: summary.totalRevenue,
                        Expenses: summary.totalExpenses,
                        Profit: summary.netProfit,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Revenue" fill="#22c55e" />
                    <Bar dataKey="Expenses" fill="#ef4444" />
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
                    <span className="font-semibold">{salesReport?.totalSales ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(salesReport?.totalRevenue ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Profit:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(salesReport?.totalProfit ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash / Credit:</span>
                    <span className="font-semibold">
                      {salesReport?.cashSales ?? 0} / {salesReport?.creditSales ?? 0}
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
                      {purchasesReport?.totalPurchases ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(purchasesReport?.totalAmount ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phones Purchased:</span>
                    <span className="font-semibold">
                      {purchasesReport?.totalPhonesPurchased ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unpaid:</span>
                    <span className="font-semibold text-red-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(purchasesReport?.totalUnpaid ?? 0)}
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
                    <span className="font-semibold">{repairsReport?.totalRepairs ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(repairsReport?.totalRepairCost ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Cost:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(repairsReport?.averageRepairCost ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-semibold">
                      {repairsReport?.completedRepairs ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Receivables & Payables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Receivables (owed by customers)
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(summary.totalReceivables)}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Payables (owed to suppliers)
                    </p>
                    <p className="text-xl font-bold text-red-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(summary.totalPayables)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Inventory Value
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'UZS',
                        minimumFractionDigits: 0,
                      }).format(summary.inventoryValue)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary.inventoryCount} phones in stock
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
