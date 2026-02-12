import { Injectable } from '@nestjs/common';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerBalanceService } from './customer-balance.service';
import { CustomerCreateService } from './customer-create.service';
import { CustomerDeleteService } from './customer-delete.service';
import { CustomerFindService } from './customer-find.service';
import { CustomerUpdateService } from './customer-update.service';

@Injectable()
export class CustomerService {
  constructor(
    private readonly createService: CustomerCreateService,
    private readonly findService: CustomerFindService,
    private readonly updateService: CustomerUpdateService,
    private readonly deleteService: CustomerDeleteService,
    private readonly balanceService: CustomerBalanceService,
  ) {}

  async create(dto: CreateCustomerDto) {
    return this.createService.execute(dto);
  }

  async findAll(query: PaginationQueryDto) {
    return this.findService.findAll(query);
  }

  async findOne(id: number) {
    return this.findService.findOne(id);
  }

  async findByPhoneNumber(phoneNumber: string) {
    return this.findService.findByPhoneNumber(phoneNumber);
  }

  async searchByPhone(phoneNumber: string) {
    return this.findService.searchByPhone(phoneNumber);
  }

  async update(id: number, dto: UpdateCustomerDto) {
    return this.updateService.execute(id, dto);
  }

  async remove(id: number) {
    return this.deleteService.execute(id);
  }

  async getBalance(customerId: number) {
    return this.balanceService.calculate(customerId);
  }
}
