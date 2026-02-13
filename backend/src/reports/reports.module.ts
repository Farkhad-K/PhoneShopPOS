import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './services/reports.service';
import { SalesReportService } from './services/sales-report.service';
import { PurchaseReportService } from './services/purchase-report.service';
import { RepairReportService } from './services/repair-report.service';
import { FinancialSummaryService } from './services/financial-summary.service';
import { DashboardStatsService } from './services/dashboard-stats.service';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Repair } from 'src/repair/entities/repair.entity';
import { Phone } from 'src/phone/entities/phone.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Purchase, Repair, Phone])],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    SalesReportService,
    PurchaseReportService,
    RepairReportService,
    FinancialSummaryService,
    DashboardStatsService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
