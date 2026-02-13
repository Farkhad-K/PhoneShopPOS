import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { PaymentFindService } from './services/payment-find.service';
import { PaymentCreateService } from './services/payment-create.service';
import { PaymentApplicationService } from './services/payment-application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Sale, Purchase, Customer, Supplier]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentFindService,
    PaymentCreateService,
    PaymentApplicationService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
