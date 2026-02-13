import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { PurchaseReportDto } from '../dto/report-response.dto';

@Injectable()
export class PurchaseReportService {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Phone)
    private readonly phoneRepository: Repository<Phone>,
  ) {}

  async getPurchaseReport(filter: ReportFilterDto): Promise<PurchaseReportDto> {
    const { startDate, endDate, supplierId } = filter;

    // Build query conditions
    const where: any = { isActive: true };

    if (startDate && endDate) {
      where.purchaseDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.purchaseDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.purchaseDate = LessThanOrEqual(new Date(endDate));
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    // Get all purchases matching criteria
    const purchases = await this.purchaseRepository.find({
      where,
      relations: ['supplier'],
    });

    // Calculate metrics
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.totalAmount),
      0,
    );
    const totalPaid = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.paidAmount),
      0,
    );
    const totalUnpaid = totalAmount - totalPaid;

    // Count phones from these purchases
    const purchaseIds = purchases.map((p) => p.id);
    const totalPhonesPurchased = purchaseIds.length > 0
      ? await this.phoneRepository.count({
          where: { purchaseId: In(purchaseIds) },
        })
      : 0;

    // Group by supplier
    const supplierMap = new Map<
      number,
      {
        supplierId: number;
        supplierName: string;
        totalPurchases: number;
        totalAmount: number;
        totalPaid: number;
      }
    >();

    for (const purchase of purchases) {
      const supplierId = purchase.supplierId;
      const supplierName = purchase.supplier?.companyName || 'Unknown';

      if (!supplierMap.has(supplierId)) {
        supplierMap.set(supplierId, {
          supplierId,
          supplierName,
          totalPurchases: 0,
          totalAmount: 0,
          totalPaid: 0,
        });
      }

      const supplierData = supplierMap.get(supplierId)!;
      supplierData.totalPurchases += 1;
      supplierData.totalAmount += Number(purchase.totalAmount);
      supplierData.totalPaid += Number(purchase.paidAmount);
    }

    const bySupplier = Array.from(supplierMap.values()).map((s) => ({
      ...s,
      totalAmount: Number(s.totalAmount.toFixed(2)),
      totalPaid: Number(s.totalPaid.toFixed(2)),
    }));

    return {
      totalPurchases,
      totalAmount: Number(totalAmount.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalUnpaid: Number(totalUnpaid.toFixed(2)),
      totalPhonesPurchased,
      bySupplier,
      startDate,
      endDate,
    };
  }
}
