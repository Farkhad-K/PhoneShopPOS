import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerController } from './worker.controller';
import { WorkerService } from './services/worker.service';
import { WorkerPaymentService } from './services/worker-payment.service';
import { Worker } from './entities/worker.entity';
import { WorkerPayment } from './entities/worker-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, WorkerPayment])],
  controllers: [WorkerController],
  providers: [WorkerService, WorkerPaymentService],
  exports: [WorkerService, WorkerPaymentService],
})
export class WorkerModule {}
