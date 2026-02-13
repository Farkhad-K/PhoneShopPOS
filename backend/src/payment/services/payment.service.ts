import { Injectable } from '@nestjs/common';
import { PaymentFindService } from './payment-find.service';
import { PaymentCreateService } from './payment-create.service';
import { PaymentApplicationService } from './payment-application.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { ApplyPaymentDto } from '../dto/apply-payment.dto';
import { Payment } from '../entities/payment.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';

/**
 * Facade service for payment operations
 */
@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentFindService: PaymentFindService,
    private readonly paymentCreateService: PaymentCreateService,
    private readonly paymentApplicationService: PaymentApplicationService,
  ) {}

  // Find operations
  async findAll(): Promise<Payment[]> {
    return this.paymentFindService.findAll();
  }

  async findOne(id: number): Promise<Payment> {
    return this.paymentFindService.findOne(id);
  }

  async findByCustomer(customerId: number): Promise<Payment[]> {
    return this.paymentFindService.findByCustomer(customerId);
  }

  async findBySupplier(supplierId: number): Promise<Payment[]> {
    return this.paymentFindService.findBySupplier(supplierId);
  }

  async findBySale(saleId: number): Promise<Payment[]> {
    return this.paymentFindService.findBySale(saleId);
  }

  async findByPurchase(purchaseId: number): Promise<Payment[]> {
    return this.paymentFindService.findByPurchase(purchaseId);
  }

  // Create operations
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.paymentCreateService.create(createPaymentDto);
  }

  // Payment application (FIFO)
  async applyCustomerPayment(
    customerId: number,
    paymentDto: ApplyPaymentDto,
  ): Promise<{ payment: Payment; appliedSales: Sale[] }> {
    return this.paymentApplicationService.applyCustomerPayment(customerId, paymentDto);
  }

  async applySupplierPayment(
    supplierId: number,
    paymentDto: ApplyPaymentDto,
  ): Promise<{ payment: Payment; appliedPurchases: Purchase[] }> {
    return this.paymentApplicationService.applySupplierPayment(supplierId, paymentDto);
  }
}
