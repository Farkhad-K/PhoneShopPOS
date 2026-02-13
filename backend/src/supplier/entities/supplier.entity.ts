import { Entity, Column } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';

@Entity({ name: 'suppliers' })
export class Supplier extends Extender {
  @Column()
  companyName: string;

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations will be added when Purchase and Payment entities are created
  // @OneToMany(() => Purchase, purchase => purchase.supplier)
  // purchases: Purchase[];

  // @OneToMany(() => Payment, payment => payment.supplier)
  // payments: Payment[];
}
