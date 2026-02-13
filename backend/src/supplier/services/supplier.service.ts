import { Injectable } from '@nestjs/common';
import { SupplierCreateService } from './supplier-create.service';
import { SupplierFindService } from './supplier-find.service';
import { SupplierUpdateService } from './supplier-update.service';
import { SupplierDeleteService } from './supplier-delete.service';
import { SupplierBalanceService } from './supplier-balance.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

/**
 * Facade service that delegates to specialized sub-services
 */
@Injectable()
export class SupplierService {
  constructor(
    private readonly createService: SupplierCreateService,
    private readonly findService: SupplierFindService,
    private readonly updateService: SupplierUpdateService,
    private readonly deleteService: SupplierDeleteService,
    private readonly balanceService: SupplierBalanceService,
  ) {}

  create(createSupplierDto: CreateSupplierDto) {
    return this.createService.create(createSupplierDto);
  }

  findAll(query: PaginationQueryDto) {
    return this.findService.findAll(query);
  }

  findOne(id: number) {
    return this.findService.findOne(id);
  }

  searchByPhone(phoneNumber: string) {
    return this.findService.searchByPhone(phoneNumber);
  }

  update(id: number, updateSupplierDto: UpdateSupplierDto) {
    return this.updateService.update(id, updateSupplierDto);
  }

  remove(id: number) {
    return this.deleteService.remove(id);
  }

  getBalance(id: number) {
    return this.balanceService.getBalance(id);
  }
}
