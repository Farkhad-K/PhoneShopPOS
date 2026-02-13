import { Entity, Column, ManyToOne, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Extender } from 'src/common/entities/common.entities';
import { PhoneStatus, PhoneCondition } from 'src/common/enums/enum';
import { Purchase } from 'src/purchase/entities/purchase.entity';
import { Repair } from 'src/repair/entities/repair.entity';
import { Sale } from 'src/sale/entities/sale.entity';

@Entity({ name: 'phones' })
export class Phone extends Extender {
  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ nullable: true, unique: true })
  imei: string;

  @Column({ nullable: true })
  color: string;

  @Column({
    type: 'enum',
    enum: PhoneCondition,
    default: PhoneCondition.NEW,
  })
  condition: PhoneCondition;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({
    type: 'enum',
    enum: PhoneStatus,
    default: PhoneStatus.IN_STOCK,
  })
  status: PhoneStatus;

  @Column({ unique: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Calculated field - total cost including repairs
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalCost: number;

  // Relations
  @ManyToOne(() => Purchase, (purchase) => purchase.phones)
  @JoinColumn({ name: 'purchaseId' })
  purchase: Purchase;

  @Column()
  purchaseId: number;

  @OneToMany(() => Repair, (repair) => repair.phone)
  repairs: Repair[];

  @OneToOne(() => Sale, (sale) => sale.phone)
  sale: Sale;
}
