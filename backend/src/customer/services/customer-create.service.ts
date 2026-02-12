import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomerCreateService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<Customer> {
    // Check if phone number already exists
    const existingCustomer = await this.customerRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (existingCustomer) {
      throw new ConflictException(
        `Customer with phone number ${dto.phoneNumber} already exists`,
      );
    }

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }
}
