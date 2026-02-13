import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { User } from 'src/user/entities/user.entity';
import { WorkerPayment } from './worker-payment.entity';

@Entity({ name: 'workers' })
export class Worker extends Extender {
  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ unique: true })
  passportId: string;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlySalary: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Link to user account (optional - worker might not have system access)
  @Column({ nullable: true })
  userId?: number;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  // Payment history
  @OneToMany(() => WorkerPayment, (payment) => payment.worker)
  payments: WorkerPayment[];
}
