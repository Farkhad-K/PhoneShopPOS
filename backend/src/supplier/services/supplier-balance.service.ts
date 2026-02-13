import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { SupplierBalanceDto } from '../dto/supplier-response.dto';

@Injectable()
export class SupplierBalanceService {
  constructor(
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
  ) {}

  async getBalance(id: number): Promise<SupplierBalanceDto> {
    const supplier = await this.supplierRepository.findOne({ where: { id } });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    // TODO: Calculate actual balance from Purchase and Payment entities
    // For now, return placeholder values
    return {
      supplierId: supplier.id,
      companyName: supplier.companyName,
      totalPayable: 0,
      totalPaid: 0,
      remainingBalance: 0,
    };
  }
}
