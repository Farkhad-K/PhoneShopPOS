import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { SaleController } from './sale.controller';
import { SaleService } from './services/sale.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Phone, Customer])],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService],
})
export class SaleModule {}
