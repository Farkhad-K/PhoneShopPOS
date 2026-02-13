import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';

@Injectable()
export class SupplierCreateService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Check if phone number already exists
    const existing = await this.supplierRepository.findOne({
      where: { phoneNumber: createSupplierDto.phoneNumber },
    });

    if (existing) {
      throw new ConflictException(
        `Supplier with phone number ${createSupplierDto.phoneNumber} already exists`,
      );
    }

    const supplier = this.supplierRepository.create(createSupplierDto);
    return this.supplierRepository.save(supplier);
  }
}
