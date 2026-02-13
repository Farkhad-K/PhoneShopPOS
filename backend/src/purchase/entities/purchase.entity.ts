import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { PaymentStatus } from 'src/common/enums/enum';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Phone } from 'src/phone/entities/phone.entity';

@Entity({ name: 'purchases' })
export class Purchase extends Extender {
  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  @Column()
  supplierId: number;

  @OneToMany(() => Phone, (phone) => phone.purchase, { eager: true })
  phones: Phone[];

  @Column({ type: 'timestamptz' })
  purchaseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

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

  // Calculated field
  get remainingAmount(): number {
    return Number(this.totalAmount) - Number(this.paidAmount);
  }
}
