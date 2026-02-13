import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Repair } from 'src/repair/entities/repair.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { FinancialSummaryDto } from '../dto/report-response.dto';
import { PaymentStatus, PhoneStatus } from 'src/common/enums/enum';

@Injectable()
export class FinancialSummaryService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Repair)
    private readonly repairRepository: Repository<Repair>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) {}

  async getFinancialSummary(
    filter: ReportFilterDto,
  ): Promise<FinancialSummaryDto> {
    const { startDate, endDate } = filter;

    // Build query conditions for date range
    let dateWhere: any = {};
    if (startDate && endDate) {
      dateWhere = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      dateWhere = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      dateWhere = LessThanOrEqual(new Date(endDate));
    }

    // Calculate total revenue from sales
    const salesWhere: any = { isActive: true };
    if (startDate || endDate) {
      salesWhere.saleDate = dateWhere;
    }

    const sales = await this.saleRepository.find({ where: salesWhere });
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.salePrice),
      0,
    );

    // Calculate total expenses from purchases
    const purchasesWhere: any = { isActive: true };
    if (startDate || endDate) {
      purchasesWhere.purchaseDate = dateWhere;
    }

    const purchases = await this.purchaseRepository.find({
      where: purchasesWhere,
    });
    const purchaseExpenses = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount),
      0,
    );

    // Calculate repair expenses
    const repairsWhere: any = { isActive: true };
    if (startDate || endDate) {
      repairsWhere.startDate = dateWhere;
    }

    const repairs = await this.repairRepository.find({ where: repairsWhere });
    const repairExpenses = repairs.reduce(
      (sum, repair) => sum + Number(repair.repairCost),
      0,
    );

    const totalExpenses = purchaseExpenses + repairExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate receivables (unpaid sales)
    const unpaidSales = await this.saleRepository.find({
      where: [
        { paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
    });
    const totalReceivables = unpaidSales.reduce(
      (sum, sale) => sum + (Number(sale.salePrice) - Number(sale.paidAmount)),
      0,
    );

    // Calculate payables (unpaid purchases)
    const unpaidPurchases = await this.purchaseRepository.find({
      where: [
        { paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
    });
    const totalPayables = unpaidPurchases.reduce(
      (sum, purchase) =>
        sum + (Number(purchase.totalAmount) - Number(purchase.paidAmount)),
      0,
    );

    // Calculate inventory value (phones in stock or ready for sale)
    const availablePhones = await this.phoneRepository.find({
      where: [
        { status: PhoneStatus.IN_STOCK, isActive: true },
        { status: PhoneStatus.READY_FOR_SALE, isActive: true },
      ],
    });
    const inventoryValue = availablePhones.reduce(
      (sum, phone) => sum + Number(phone.totalCost),
      0,
    );
    const inventoryCount = availablePhones.length;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMargin: Number(profitMargin.toFixed(2)),
      totalReceivables: Number(totalReceivables.toFixed(2)),
      totalPayables: Number(totalPayables.toFixed(2)),
      inventoryValue: Number(inventoryValue.toFixed(2)),
      inventoryCount,
      startDate,
      endDate,
    };
  }
}
