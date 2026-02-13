import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { PaymentStatus } from 'src/common/enums/enum';

export interface SupplierBalanceDto {
  supplierId: number;
  supplierName: string;
  totalCredit: number;
  unpaidPurchases: {
    id: number;
    totalAmount: number;
    paidAmount: number;
    remainingBalance: number;
    purchaseDate: Date;
    notes: string;
  }[];
}

@Injectable()
export class SupplierBalanceService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
  ) {}

  /**
   * Calculate supplier's total credit (what shop owes supplier) and unpaid purchases
   */
  async getSupplierBalance(supplierId: number): Promise<SupplierBalanceDto> {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, isActive: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    // Get all unpaid and partially paid purchases from this supplier
    const unpaidPurchases = await this.purchaseRepository.find({
      where: [
        { supplierId, paymentStatus: PaymentStatus.UNPAID, isActive: true },
        { supplierId, paymentStatus: PaymentStatus.PARTIAL, isActive: true },
      ],
      order: { purchaseDate: 'ASC' },
    });

    let totalCredit = 0;
    const unpaidPurchasesData = unpaidPurchases.map((purchase) => {
      const remainingBalance = Number(purchase.totalAmount) - Number(purchase.paidAmount);
      totalCredit += remainingBalance;

      return {
        id: purchase.id,
        totalAmount: Number(purchase.totalAmount),
        paidAmount: Number(purchase.paidAmount),
        remainingBalance,
        purchaseDate: purchase.purchaseDate,
        notes: purchase.notes || '',
      };
    });

    return {
      supplierId: supplier.id,
      supplierName: supplier.companyName,
      totalCredit,
      unpaidPurchases: unpaidPurchasesData,
    };
  }

  /**
   * Get supplier's full transaction history (all purchases)
   */
  async getSupplierTransactions(supplierId: number): Promise<Purchase[]> {
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, isActive: true },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    return await this.purchaseRepository.find({
      where: { supplierId, isActive: true },
      order: { purchaseDate: 'DESC' },
    });
  }
}
