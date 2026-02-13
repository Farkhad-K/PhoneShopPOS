import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { Phone } from 'src/phone/entities/phone.entity';
import { RepairStatus } from 'src/common/enums/enum';

@Entity({ name: 'repairs' })
export class Repair extends Extender {
  @ManyToOne(() => Phone, { eager: true })
  @JoinColumn({ name: 'phoneId' })
  phone: Phone;

  @Column()
  phoneId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  repairCost: number;

  @Column({
    type: 'enum',
    enum: RepairStatus,
    default: RepairStatus.PENDING,
  })
  status: RepairStatus;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completionDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Computed field
  get isCompleted(): boolean {
    return this.status === RepairStatus.COMPLETED;
  }
}
