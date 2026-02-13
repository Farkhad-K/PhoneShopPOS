import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SupplierUpdateService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // Check if phone number is being updated and if it conflicts
    if (
      updateSupplierDto.phoneNumber &&
      updateSupplierDto.phoneNumber !== supplier.phoneNumber
    ) {
      const existing = await this.supplierRepository.findOne({
        where: { phoneNumber: updateSupplierDto.phoneNumber },
      });

      if (existing) {
        throw new ConflictException(
          `Supplier with phone number ${updateSupplierDto.phoneNumber} already exists`,
        );
      }
    }

    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepository.save(supplier);
  }
}
