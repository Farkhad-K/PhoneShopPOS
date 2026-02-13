import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Repair } from 'src/repair/entities/repair.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { DashboardStatsDto } from '../dto/report-response.dto';
import { PhoneStatus, RepairStatus, PaymentStatus } from 'src/common/enums/enum';

@Injectable()
export class DashboardStatsService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
    @InjectRepository(Repair)
    private readonly repairRepository: Repository<Repair>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
  ) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sales stats
    const todaySales = await this.saleRepository.find({
      where: { saleDate: MoreThanOrEqual(todayStart), isActive: true },
      relations: ['phone'],
    });
    const weekSales = await this.saleRepository.find({
      where: { saleDate: MoreThanOrEqual(weekStart), isActive: true },
      relations: ['phone'],
    });
    const monthSales = await this.saleRepository.find({
      where: { saleDate: MoreThanOrEqual(monthStart), isActive: true },
      relations: ['phone'],
    });

    const todayRevenue = todaySales.reduce(
      (sum, s) => sum + Number(s.salePrice),
      0,
    );
    const weekRevenue = weekSales.reduce((sum, s) => sum + Number(s.salePrice), 0);
    const monthRevenue = monthSales.reduce(
      (sum, s) => sum + Number(s.salePrice),
      0,
    );

    const todayProfit = todaySales.reduce((sum, s) => sum + Number(s.profit), 0);
    const weekProfit = weekSales.reduce((sum, s) => sum + Number(s.profit), 0);
    const monthProfit = monthSales.reduce((sum, s) => sum + Number(s.profit), 0);

    // Inventory stats
    const [
      totalPhones,
      inStock,
      inRepair,
      readyForSale,
      sold,
    ] = await Promise.all([
      this.phoneRepository.count({ where: { isActive: true } }),
      this.phoneRepository.count({
        where: { status: PhoneStatus.IN_STOCK, isActive: true },
      }),
      this.phoneRepository.count({
        where: { status: PhoneStatus.IN_REPAIR, isActive: true },
      }),
      this.phoneRepository.count({
        where: { status: PhoneStatus.READY_FOR_SALE, isActive: true },
      }),
      this.phoneRepository.count({
        where: { status: PhoneStatus.SOLD, isActive: true },
      }),
    ]);

    // Financial stats
    const unpaidSales = await this.saleRepository.find({
      where: [
        { paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
    });
    const receivables = unpaidSales.reduce(
      (sum, sale) => sum + (Number(sale.salePrice) - Number(sale.paidAmount)),
      0,
    );

    const unpaidPurchases = await this.purchaseRepository.find({
      where: [
        { paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
    });
    const payables = unpaidPurchases.reduce(
      (sum, purchase) =>
        sum + (Number(purchase.totalAmount) - Number(purchase.paidAmount)),
      0,
    );

    // Repair stats
    const [
      pendingRepairs,
      inProgressRepairs,
      completedTodayRepairs,
      completedWeekRepairs,
    ] = await Promise.all([
      this.repairRepository.count({
        where: { status: RepairStatus.PENDING, isActive: true },
      }),
      this.repairRepository.count({
        where: { status: RepairStatus.IN_PROGRESS, isActive: true },
      }),
      this.repairRepository.count({
        where: {
          status: RepairStatus.COMPLETED,
          completionDate: MoreThanOrEqual(todayStart),
          isActive: true,
        },
      }),
      this.repairRepository.count({
        where: {
          status: RepairStatus.COMPLETED,
          completionDate: MoreThanOrEqual(weekStart),
          isActive: true,
        },
      }),
    ]);

    return {
      sales: {
        today: todaySales.length,
        thisWeek: weekSales.length,
        thisMonth: monthSales.length,
        todayRevenue: Number(todayRevenue.toFixed(2)),
        weekRevenue: Number(weekRevenue.toFixed(2)),
        monthRevenue: Number(monthRevenue.toFixed(2)),
      },
      inventory: {
        totalPhones,
        inStock,
        inRepair,
        readyForSale,
        sold,
        available: inStock + readyForSale,
      },
      financial: {
        todayProfit: Number(todayProfit.toFixed(2)),
        weekProfit: Number(weekProfit.toFixed(2)),
        monthProfit: Number(monthProfit.toFixed(2)),
        receivables: Number(receivables.toFixed(2)),
        payables: Number(payables.toFixed(2)),
      },
      repairs: {
        pending: pendingRepairs,
        inProgress: inProgressRepairs,
        completedToday: completedTodayRepairs,
        completedThisWeek: completedWeekRepairs,
      },
    };
  }
}
