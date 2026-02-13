import { Entity, Column, OneToMany } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';

@Entity({ name: 'customers' })
export class Customer extends Extender {
  @Column()
  fullName: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  passportId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations will be added when Purchase, Sale, and Payment entities are created
  // @OneToMany(() => Purchase, purchase => purchase.customer)
  // purchases: Purchase[];

  // @OneToMany(() => Sale, sale => sale.customer)
  // sales: Sale[];

  // @OneToMany(() => Payment, payment => payment.customer)
  // payments: Payment[];
}
