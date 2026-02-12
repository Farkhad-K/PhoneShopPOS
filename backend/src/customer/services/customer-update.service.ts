import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomerUpdateService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Check if phone number is being changed and if it already exists
    if (dto.phoneNumber && dto.phoneNumber !== customer.phoneNumber) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });

      if (existingCustomer) {
        throw new ConflictException(
          `Customer with phone number ${dto.phoneNumber} already exists`,
        );
      }
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }
}
