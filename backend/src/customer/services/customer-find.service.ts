import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import * as paginationUtil from 'src/common/utils/pagination.util';
import { Customer } from '../entities/customer.entity';
import { CustomerResponseDto } from '../dto/customer-response.dto';

@Injectable()
export class CustomerFindService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<paginationUtil.PaginationResult<CustomerResponseDto>> {
    const { page = 1, limit = 10, sortBy, sortOrder, search } = query;

    const qb = this.customerRepository.createQueryBuilder('customer');

    // Search by name or phone number
    if (search) {
      qb.where(
        '(customer.fullName ILIKE :search OR customer.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    if (sortBy) {
      const order = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`customer.${sortBy}`, order);
    } else {
      qb.orderBy('customer.createdAt', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return paginationUtil.paginateResponse(items, total, page, limit);
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Customer | null> {
    return this.customerRepository.findOne({
      where: { phoneNumber },
    });
  }

  async searchByPhone(phoneNumber: string): Promise<Customer[]> {
    return this.customerRepository.find({
      where: { phoneNumber: Like(`%${phoneNumber}%`) },
      take: 10,
    });
  }
}
