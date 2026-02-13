import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { ApplyPaymentDto } from '../dto/apply-payment.dto';
import { PaymentStatus } from 'src/common/enums/enum';

/**
 * Service for applying payments using FIFO (First In, First Out) algorithm
 * Payments are applied to the oldest unpaid/partial transactions first
 */
@Injectable()
export class PaymentApplicationService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Apply payment to customer's unpaid sales using FIFO
   */
  async applyCustomerPayment(
    customerId: number,
    paymentDto: ApplyPaymentDto,
  ): Promise<{ payment: Payment; appliedSales: Sale[] }> {
    // Verify customer exists
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, isActive: true },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Fetch all unpaid/partial sales for this customer, oldest first
      const unpaidSales = await manager.find(Sale, {
        where: [
          { customerId, paymentStatus: PaymentStatus.UNPAID, isActive: true },
          { customerId, paymentStatus: PaymentStatus.PARTIAL, isActive: true },
        ],
        order: { saleDate: 'ASC' }, // FIFO: oldest first
      });

      if (unpaidSales.length === 0) {
        throw new BadRequestException('No unpaid sales found for this customer');
      }

      let remainingAmount = paymentDto.amount;
      const appliedSales: Sale[] = [];

      // Apply payment to sales in FIFO order
      for (const sale of unpaidSales) {
        if (remainingAmount <= 0) break;

        const saleBalance = Number(sale.salePrice) - Number(sale.paidAmount);
        const amountToApply = Math.min(remainingAmount, saleBalance);

        // Update sale payment
        sale.paidAmount = Number(sale.paidAmount) + amountToApply;

        // Update payment status
        if (sale.paidAmount >= Number(sale.salePrice)) {
          sale.paymentStatus = PaymentStatus.PAID;
        } else if (sale.paidAmount > 0) {
          sale.paymentStatus = PaymentStatus.PARTIAL;
        }

        await manager.save(Sale, sale);
        appliedSales.push(sale);

        remainingAmount -= amountToApply;
      }

      // If there's remaining amount, customer overpaid
      if (remainingAmount > 0) {
        throw new BadRequestException(
          `Payment amount exceeds total debt. Remaining: ${remainingAmount.toFixed(2)}`,
        );
      }

      // Create payment record
      const payment = manager.create(Payment, {
        amount: paymentDto.amount,
        paymentDate: new Date(),
        paymentMethod: paymentDto.paymentMethod,
        notes: paymentDto.notes,
        customerId,
      });

      await manager.save(Payment, payment);

      return { payment, appliedSales };
    });
  }

  /**
   * Apply payment to supplier's unpaid purchases using FIFO
   */
  async applySupplierPayment(
    supplierId: number,
    paymentDto: ApplyPaymentDto,
  ): Promise<{ payment: Payment; appliedPurchases: Purchase[] }> {
    // Verify supplier exists
    const supplier = await this.supplierRepository.findOne({
      where: { id: supplierId, isActive: true },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${supplierId} not found`);
    }

    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (manager) => {
      // Fetch all unpaid/partial purchases from this supplier, oldest first
      const unpaidPurchases = await manager.find(Purchase, {
        where: [
          { supplierId, paymentStatus: PaymentStatus.UNPAID, isActive: true },
          { supplierId, paymentStatus: PaymentStatus.PARTIAL, isActive: true },
        ],
        order: { purchaseDate: 'ASC' }, // FIFO: oldest first
      });

      if (unpaidPurchases.length === 0) {
        throw new BadRequestException('No unpaid purchases found for this supplier');
      }

      let remainingAmount = paymentDto.amount;
      const appliedPurchases: Purchase[] = [];

      // Apply payment to purchases in FIFO order
      for (const purchase of unpaidPurchases) {
        if (remainingAmount <= 0) break;

        const purchaseBalance = Number(purchase.totalAmount) - Number(purchase.paidAmount);
        const amountToApply = Math.min(remainingAmount, purchaseBalance);

        // Update purchase payment
        purchase.paidAmount = Number(purchase.paidAmount) + amountToApply;

        // Update payment status
        if (purchase.paidAmount >= Number(purchase.totalAmount)) {
          purchase.paymentStatus = PaymentStatus.PAID;
        } else if (purchase.paidAmount > 0) {
          purchase.paymentStatus = PaymentStatus.PARTIAL;
        }

        await manager.save(Purchase, purchase);
        appliedPurchases.push(purchase);

        remainingAmount -= amountToApply;
      }

      // If there's remaining amount, shop overpaid
      if (remainingAmount > 0) {
        throw new BadRequestException(
          `Payment amount exceeds total debt. Remaining: ${remainingAmount.toFixed(2)}`,
        );
      }

      // Create payment record
      const payment = manager.create(Payment, {
        amount: paymentDto.amount,
        paymentDate: new Date(),
        paymentMethod: paymentDto.paymentMethod,
        notes: paymentDto.notes,
        supplierId,
      });

      await manager.save(Payment, payment);

      return { payment, appliedPurchases };
    });
  }
}
