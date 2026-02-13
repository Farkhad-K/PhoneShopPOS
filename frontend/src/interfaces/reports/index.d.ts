// ==== Reports Interfaces ====

declare interface ReportFilterParams {
  startDate?: string
  endDate?: string
  groupBy?: 'day' | 'week' | 'month'
}

declare interface FinancialReport {
  period: {
    startDate: string
    endDate: string
  }
  summary: {
    totalRevenue: number
    totalCost: number
    totalProfit: number
    profitMargin: number
  }
  sales: {
    count: number
    totalAmount: number
    averagePrice: number
  }
  purchases: {
    count: number
    totalAmount: number
    averagePrice: number
  }
  repairs: {
    count: number
    totalCost: number
    averageCost: number
  }
  payments: {
    received: number
    paid: number
    outstanding: number
  }
}

declare interface InventoryReport {
  totalPhones: number
  phonesByStatus: {
    status: PhoneStatus
    count: number
    totalValue: number
  }[]
  phonesByCondition: {
    condition: PhoneCondition
    count: number
  }[]
  averageRepairCost: number
  averageSaleProfit: number
  slowMovingInventory: {
    phoneId: number
    brand: string
    model: string
    daysInStock: number
    purchasePrice: number
  }[]
}

declare interface DashboardMetrics {
  totalRevenue: number
  revenueChange: number
  activeCustomers: number
  customersChange: number
  totalPhones: number
  phonesChange: number
  profitRate: number
  profitRateChange: number
  recentSales: Sale[]
  phoneStatusDistribution: {
    status: PhoneStatus
    count: number
    percentage: number
  }[]
  revenueTrend: {
    date: string
    revenue: number
    profit: number
  }[]
}
