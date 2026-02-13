import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/common/enums/enum';
import { ReportsService } from './services/reports.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import {
  SalesReportDto,
  PurchaseReportDto,
  RepairReportDto,
  FinancialSummaryDto,
  DashboardStatsDto,
} from './dto/report-response.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Get sales report',
    description:
      'Returns sales metrics including revenue, profit, payment types, and status breakdown. ' +
      'Filter by date range or customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales report generated',
    type: SalesReportDto,
  })
  async getSalesReport(
    @Query() filter: ReportFilterDto,
  ): Promise<SalesReportDto> {
    return this.reportsService.getSalesReport(filter);
  }

  @Get('purchases')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Get purchase report',
    description:
      'Returns purchase metrics including total amount, payments, and breakdown by supplier. ' +
      'Filter by date range or supplier.',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase report generated',
    type: PurchaseReportDto,
  })
  async getPurchaseReport(
    @Query() filter: ReportFilterDto,
  ): Promise<PurchaseReportDto> {
    return this.reportsService.getPurchaseReport(filter);
  }

  @Get('repairs')
  @Roles(Role.MANAGER)
  @ApiOperation({
    summary: 'Get repair report',
    description:
      'Returns repair metrics including total costs, average costs, status breakdown, ' +
      'and most common repair types. Filter by date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Repair report generated',
    type: RepairReportDto,
  })
  async getRepairReport(
    @Query() filter: ReportFilterDto,
  ): Promise<RepairReportDto> {
    return this.reportsService.getRepairReport(filter);
  }

  @Get('financial-summary')
  @Roles(Role.OWNER)
  @ApiOperation({
    summary: 'Get comprehensive financial summary',
    description:
      'Returns overall financial metrics: revenue, expenses, profit, receivables, payables, ' +
      'and inventory value. Filter by date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Financial summary generated',
    type: FinancialSummaryDto,
  })
  async getFinancialSummary(
    @Query() filter: ReportFilterDto,
  ): Promise<FinancialSummaryDto> {
    return this.reportsService.getFinancialSummary(filter);
  }

  @Get('dashboard')
  @Roles(Role.CASHIER)
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description:
      'Returns real-time dashboard metrics: today/week/month sales, inventory status, ' +
      'financial overview, and repair status. No filters - always current data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics',
    type: DashboardStatsDto,
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.reportsService.getDashboardStats();
  }
}
