import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerController } from './customer.controller';
import { Customer } from './entities/customer.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { CustomerService } from './services/customer.service';
import { CustomerCreateService } from './services/customer-create.service';
import { CustomerFindService } from './services/customer-find.service';
import { CustomerUpdateService } from './services/customer-update.service';
import { CustomerDeleteService } from './services/customer-delete.service';
import { CustomerBalanceService } from './services/customer-balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Sale])],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CustomerCreateService,
    CustomerFindService,
    CustomerUpdateService,
    CustomerDeleteService,
    CustomerBalanceService,
  ],
  exports: [CustomerService],
})
export class CustomerModule {}
