import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { Phone } from 'src/phone/entities/phone.entity';
import { Customer } from 'src/customer/entities/customer.entity';
import { PaymentStatus, PaymentType } from 'src/common/enums/enum';

@Entity({ name: 'sales' })
export class Sale extends Extender {
  @OneToOne(() => Phone, { eager: true })
  @JoinColumn({ name: 'phoneId' })
  phone: Phone;

  @Column({ unique: true })
  phoneId: number;

  @ManyToOne(() => Customer, { eager: true, nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ nullable: true })
  customerId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salePrice: number;

  @Column({ type: 'timestamptz' })
  saleDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.CASH,
  })
  paymentType: PaymentType;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Computed fields
  get profit(): number {
    if (!this.phone) return 0;
    return Number(this.salePrice) - Number(this.phone.totalCost);
  }

  get remainingAmount(): number {
    return Number(this.salePrice) - Number(this.paidAmount);
  }
}
