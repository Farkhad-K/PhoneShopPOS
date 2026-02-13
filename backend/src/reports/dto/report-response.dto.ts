import { ApiProperty } from '@nestjs/swagger';

export class SalesReportDto {
  @ApiProperty({ example: 5 })
  totalSales: number;

  @ApiProperty({ example: 5500.0 })
  totalRevenue: number;

  @ApiProperty({ example: 3750.0 })
  totalCost: number;

  @ApiProperty({ example: 1750.0 })
  totalProfit: number;

  @ApiProperty({ example: 31.82 })
  profitMargin: number; // percentage

  @ApiProperty({ example: 3 })
  cashSales: number;

  @ApiProperty({ example: 2 })
  creditSales: number;

  @ApiProperty({ example: 4 })
  paidSales: number;

  @ApiProperty({ example: 1 })
  unpaidSales: number;

  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;
}

export class PurchaseReportDto {
  @ApiProperty({ example: 3 })
  totalPurchases: number;

  @ApiProperty({ example: 4500.0 })
  totalAmount: number;

  @ApiProperty({ example: 4200.0 })
  totalPaid: number;

  @ApiProperty({ example: 300.0 })
  totalUnpaid: number;

  @ApiProperty({ example: 8 })
  totalPhonesPurchased: number;

  @ApiProperty({
    description: 'Breakdown by supplier',
    example: [
      {
        supplierId: 1,
        supplierName: 'TechnoMart LLC',
        totalPurchases: 2,
        totalAmount: 3000.0,
        totalPaid: 2700.0,
      },
    ],
  })
  bySupplier: {
    supplierId: number;
    supplierName: string;
    totalPurchases: number;
    totalAmount: number;
    totalPaid: number;
  }[];

  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;
}

export class RepairReportDto {
  @ApiProperty({ example: 5 })
  totalRepairs: number;

  @ApiProperty({ example: 750.0 })
  totalRepairCost: number;

  @ApiProperty({ example: 150.0 })
  averageRepairCost: number;

  @ApiProperty({ example: 3 })
  completedRepairs: number;

  @ApiProperty({ example: 1 })
  pendingRepairs: number;

  @ApiProperty({ example: 1 })
  inProgressRepairs: number;

  @ApiProperty({ example: 0 })
  cancelledRepairs: number;

  @ApiProperty({
    description: 'Most common repair types',
    example: [
      { description: 'Screen replacement', count: 3, totalCost: 450.0 },
    ],
  })
  commonRepairs: {
    description: string;
    count: number;
    totalCost: number;
  }[];

  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;
}

export class FinancialSummaryDto {
  @ApiProperty({
    description: 'Total revenue from all sales',
    example: 5500.0,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total expenses (purchases + repairs)',
    example: 4500.0,
  })
  totalExpenses: number;

  @ApiProperty({
    description: 'Net profit (revenue - expenses)',
    example: 1000.0,
  })
  netProfit: number;

  @ApiProperty({
    description: 'Profit margin percentage',
    example: 18.18,
  })
  profitMargin: number;

  @ApiProperty({
    description: 'Total amount owed by customers',
    example: 500.0,
  })
  totalReceivables: number;

  @ApiProperty({
    description: 'Total amount owed to suppliers',
    example: 300.0,
  })
  totalPayables: number;

  @ApiProperty({
    description: 'Inventory value (phones in stock + ready for sale)',
    example: 3500.0,
  })
  inventoryValue: number;

  @ApiProperty({
    description: 'Number of phones available for sale',
    example: 8,
  })
  inventoryCount: number;

  @ApiProperty()
  startDate?: string;

  @ApiProperty()
  endDate?: string;
}

export class DashboardStatsDto {
  @ApiProperty()
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
  };

  @ApiProperty()
  inventory: {
    totalPhones: number;
    inStock: number;
    inRepair: number;
    readyForSale: number;
    sold: number;
    available: number;
  };

  @ApiProperty()
  financial: {
    todayProfit: number;
    weekProfit: number;
    monthProfit: number;
    receivables: number;
    payables: number;
  };

  @ApiProperty()
  repairs: {
    pending: number;
    inProgress: number;
    completedToday: number;
    completedThisWeek: number;
  };
}
