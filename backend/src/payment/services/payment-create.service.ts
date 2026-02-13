import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentCreateService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Validate that either customerId or supplierId is provided
    if (!createPaymentDto.customerId && !createPaymentDto.supplierId) {
      throw new BadRequestException('Either customerId or supplierId must be provided');
    }

    // Validate that both are not provided
    if (createPaymentDto.customerId && createPaymentDto.supplierId) {
      throw new BadRequestException('Cannot specify both customerId and supplierId');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      paymentDate: new Date(createPaymentDto.paymentDate),
    });

    return await this.paymentRepository.save(payment);
  }
}
