import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { Worker } from './worker.entity';
import { PaymentMethod } from 'src/common/enums/enum';

@Entity({ name: 'worker_payments' })
export class WorkerPayment extends Extender {
  @Column()
  workerId: number;

  @ManyToOne(() => Worker, (worker) => worker.payments)
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Bonus or deduction
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deduction: number;

  // Total = amount + bonus - deduction
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPaid: number;
}
