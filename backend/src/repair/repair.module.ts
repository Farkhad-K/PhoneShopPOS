import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repair } from './entities/repair.entity';
import { Phone } from 'src/phone/entities/phone.entity';
import { RepairController } from './repair.controller';
import { RepairService } from './services/repair.service';

@Module({
  imports: [TypeOrmModule.forFeature([Repair, Phone])],
  controllers: [RepairController],
  providers: [RepairService],
  exports: [RepairService],
})
export class RepairModule {}
