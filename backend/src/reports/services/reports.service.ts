import { Injectable } from '@nestjs/common';
import { SalesReportService } from './sales-report.service';
import { PurchaseReportService } from './purchase-report.service';
import { RepairReportService } from './repair-report.service';
import { FinancialSummaryService } from './financial-summary.service';
import { DashboardStatsService } from './dashboard-stats.service';
import { ReportFilterDto } from '../dto/report-filter.dto';
import {
  SalesReportDto,
  PurchaseReportDto,
  RepairReportDto,
  FinancialSummaryDto,
  DashboardStatsDto,
} from '../dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly salesReportService: SalesReportService,
    private readonly purchaseReportService: PurchaseReportService,
    private readonly repairReportService: RepairReportService,
    private readonly financialSummaryService: FinancialSummaryService,
    private readonly dashboardStatsService: DashboardStatsService,
  ) {}

  async getSalesReport(filter: ReportFilterDto): Promise<SalesReportDto> {
    return this.salesReportService.getSalesReport(filter);
  }

  async getPurchaseReport(filter: ReportFilterDto): Promise<PurchaseReportDto> {
    return this.purchaseReportService.getPurchaseReport(filter);
  }

  async getRepairReport(filter: ReportFilterDto): Promise<RepairReportDto> {
    return this.repairReportService.getRepairReport(filter);
  }

  async getFinancialSummary(
    filter: ReportFilterDto,
  ): Promise<FinancialSummaryDto> {
    return this.financialSummaryService.getFinancialSummary(filter);
  }

  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardStatsService.getDashboardStats();
  }
}
