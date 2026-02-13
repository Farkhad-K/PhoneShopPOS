import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class PaymentFindService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { isActive: true },
      relations: ['customer', 'supplier', 'sale', 'purchase'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id, isActive: true },
      relations: ['customer', 'supplier', 'sale', 'purchase'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async findByCustomer(customerId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { customerId, isActive: true },
      relations: ['sale'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findBySupplier(supplierId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { supplierId, isActive: true },
      relations: ['purchase'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findBySale(saleId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { saleId, isActive: true },
      relations: ['customer'],
      order: { paymentDate: 'DESC' },
    });
  }

  async findByPurchase(purchaseId: number): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { purchaseId, isActive: true },
      relations: ['supplier'],
      order: { paymentDate: 'DESC' },
    });
  }
}
