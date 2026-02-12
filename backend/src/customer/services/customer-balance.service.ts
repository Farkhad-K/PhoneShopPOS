import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomerBalanceDto } from '../dto/customer-response.dto';

@Injectable()
export class CustomerBalanceService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async calculate(customerId: number): Promise<CustomerBalanceDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    // TODO: Calculate actual debt and credit from Sales and Purchases
    // For now, return zeros (will be implemented in later milestones)
    const totalDebt = 0;
    const totalCredit = 0;
    const netBalance = totalDebt - totalCredit;

    return {
      customerId: customer.id,
      customerName: customer.fullName,
      totalDebt,
      totalCredit,
      netBalance,
    };
  }
}
