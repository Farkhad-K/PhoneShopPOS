// ==== Reports Interfaces ====

declare interface ReportFilterParams {
  startDate?: string
  endDate?: string
  customerId?: number
  supplierId?: number
}

declare interface SalesReport {
  totalSales: number
  totalRevenue: number
  totalCost: number
  totalProfit: number
  profitMargin: number
  cashSales: number
  creditSales: number
  paidSales: number
  unpaidSales: number
  startDate?: string
  endDate?: string
}

declare interface PurchasesReport {
  totalPurchases: number
  totalAmount: number
  totalPaid: number
  totalUnpaid: number
  totalPhonesPurchased: number
  bySupplier: {
    supplierId: number
    supplierName: string
    totalPurchases: number
    totalAmount: number
    totalPaid: number
  }[]
  startDate?: string
  endDate?: string
}

declare interface RepairsReport {
  totalRepairs: number
  totalRepairCost: number
  averageRepairCost: number
  completedRepairs: number
  pendingRepairs: number
  inProgressRepairs: number
  cancelledRepairs: number
  commonRepairs: {
    description: string
    count: number
    totalCost: number
  }[]
  startDate?: string
  endDate?: string
}

declare interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalReceivables: number
  totalPayables: number
  inventoryValue: number
  inventoryCount: number
  startDate?: string
  endDate?: string
}

declare interface DashboardStats {
  sales: {
    today: number
    thisWeek: number
    thisMonth: number
    todayRevenue: number
    weekRevenue: number
    monthRevenue: number
  }
  inventory: {
    totalPhones: number
    inStock: number
    inRepair: number
    readyForSale: number
    sold: number
    available: number
  }
  financial: {
    todayProfit: number
    weekProfit: number
    monthProfit: number
    receivables: number
    payables: number
  }
  repairs: {
    pending: number
    inProgress: number
    completedToday: number
    completedThisWeek: number
  }
}
