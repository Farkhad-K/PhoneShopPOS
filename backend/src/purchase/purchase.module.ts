import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { PurchaseController } from './purchase.controller';
import { PurchaseService } from './services/purchase.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase, Phone, Supplier])],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}
