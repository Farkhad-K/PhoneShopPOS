import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import * as paginationUtil from 'src/common/utils/pagination.util';
import { Supplier } from '../entities/supplier.entity';
import { SupplierResponseDto } from '../dto/supplier-response.dto';

@Injectable()
export class SupplierFindService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(
    query: PaginationQueryDto,
  ): Promise<paginationUtil.PaginationResult<SupplierResponseDto>> {
    const { page = 1, take = 10, sortField, sortOrder, search } = query;

    const qb = this.supplierRepository.createQueryBuilder('supplier');

    // Search by company name or phone number
    if (search) {
      qb.where(
        '(supplier.companyName ILIKE :search OR supplier.phoneNumber LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    if (sortField) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`supplier.${sortField}`, order);
    } else {
      qb.orderBy('supplier.createdAt', 'DESC');
    }

    // Pagination
    const skip = (page - 1) * take;
    qb.skip(skip).take(take);

    const [results, count] = await qb.getManyAndCount();

    return {
      count,
      results,
      totalPages: Math.ceil(count / take),
      page: Number(page),
      take: Number(take),
    };
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Supplier | null> {
    return this.supplierRepository.findOne({
      where: { phoneNumber },
    });
  }

  async searchByPhone(phoneNumber: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { phoneNumber: Like(`%${phoneNumber}%`) },
      take: 10,
    });
  }
}
