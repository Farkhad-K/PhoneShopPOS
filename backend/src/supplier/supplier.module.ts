import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './services/supplier.service';
import { SupplierCreateService } from './services/supplier-create.service';
import { SupplierFindService } from './services/supplier-find.service';
import { SupplierUpdateService } from './services/supplier-update.service';
import { SupplierDeleteService } from './services/supplier-delete.service';
import { SupplierBalanceService } from './services/supplier-balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [
    SupplierService,
    SupplierCreateService,
    SupplierFindService,
    SupplierUpdateService,
    SupplierDeleteService,
    SupplierBalanceService,
  ],
  exports: [SupplierService],
})
export class SupplierModule {}
