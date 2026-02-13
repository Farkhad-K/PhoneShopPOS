import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { SalesReportDto } from '../dto/report-response.dto';
import { PaymentType, PaymentStatus } from 'src/common/enums/enum';

@Injectable()
export class SalesReportService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async getSalesReport(filter: ReportFilterDto): Promise<SalesReportDto> {
    const { startDate, endDate, customerId } = filter;

    // Build query conditions
    const where: any = { isActive: true };

    if (startDate && endDate) {
      where.saleDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.saleDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.saleDate = LessThanOrEqual(new Date(endDate));
    }

    if (customerId) {
      where.customerId = customerId;
    }

    // Get all sales matching criteria
    const sales = await this.saleRepository.find({
      where,
      relations: ['phone'],
    });

    // Calculate metrics
    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.salePrice),
      0,
    );
    const totalCost = sales.reduce(
      (sum, sale) => sum + Number(sale.phone.totalCost),
      0,
    );
    const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.profit), 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const cashSales = sales.filter(
      (s) => s.paymentType === PaymentType.CASH,
    ).length;
    const creditSales = sales.filter(
      (s) => s.paymentType === PaymentType.PAY_LATER,
    ).length;

    const paidSales = sales.filter(
      (s) => s.paymentStatus === PaymentStatus.PAID,
    ).length;
    const unpaidSales = sales.filter(
      (s) =>
        s.paymentStatus === PaymentStatus.UNPAID ||
        s.paymentStatus === PaymentStatus.PARTIAL,
    ).length;

    return {
      totalSales,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfit: Number(totalProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
      cashSales,
      creditSales,
      paidSales,
      unpaidSales,
      startDate,
      endDate,
    };
  }
}
