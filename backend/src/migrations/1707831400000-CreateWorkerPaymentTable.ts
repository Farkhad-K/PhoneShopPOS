import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkerPaymentTable1707831400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for payment method (if not exists)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE payment_method_enum AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_PAYMENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'worker_payments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deletedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'workerId',
            type: 'int',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'paymentDate',
            type: 'timestamptz',
          },
          {
            name: 'paymentMethod',
            type: 'payment_method_enum',
            default: "'CASH'",
          },
          {
            name: 'month',
            type: 'int',
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bonus',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'deduction',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'totalPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
        ],
      }),
      true,
    );

    // Add foreign key to workers table
    await queryRunner.createForeignKey(
      'worker_payments',
      new TableForeignKey({
        columnNames: ['workerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'workers',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKER_PAYMENTS_WORKER" ON "worker_payments" ("workerId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_WORKER_PAYMENTS_DATE" ON "worker_payments" ("paymentDate")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_WORKER_PAYMENTS_MONTH_YEAR" ON "worker_payments" ("month", "year")`,
    );

    // Create unique constraint on workerId + month + year
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_WORKER_PAYMENTS_UNIQUE" ON "worker_payments" ("workerId", "month", "year") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('worker_payments');
  }
}
