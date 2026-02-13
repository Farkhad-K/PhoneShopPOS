import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { Customer } from 'src/customer/entities/customer.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Sale } from 'src/sale/entities/sale.entity';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { PaymentMethod } from 'src/common/enums/enum';

@Entity('payments')
export class Payment extends Extender {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'timestamptz' })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // For customer payments (customer paying shop for sales)
  @Column({ nullable: true })
  customerId: number;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  // For supplier payments (shop paying supplier for purchases)
  @Column({ nullable: true })
  supplierId: number;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplierId' })
  supplier: Supplier;

  // Optional: Link to specific sale if payment is for one sale
  @Column({ nullable: true })
  saleId: number;

  @ManyToOne(() => Sale, { nullable: true })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  // Optional: Link to specific purchase if payment is for one purchase
  @Column({ nullable: true })
  purchaseId: number;

  @ManyToOne(() => Purchase, { nullable: true })
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;
}
