import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePaymentTable1707831100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment_method enum
    await queryRunner.query(`
      CREATE TYPE "public"."payments_paymentmethod_enum" AS ENUM('CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_PAYMENT')
    `);

    // Create payments table
    await queryRunner.createTable(
      new Table({
        name: 'payments',
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
            type: 'enum',
            enum: ['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_PAYMENT'],
            default: "'CASH'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'customerId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'supplierId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'saleId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'purchaseId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['supplierId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'suppliers',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['saleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'sales',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        columnNames: ['purchaseId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'purchases',
        onDelete: 'SET NULL',
      }),
    );

    // Add indexes for better query performance
    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_CUSTOMER',
        columnNames: ['customerId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_SUPPLIER',
        columnNames: ['supplierId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_SALE',
        columnNames: ['saleId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_PURCHASE',
        columnNames: ['purchaseId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_PAYMENTS_DATE',
        columnNames: ['paymentDate'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('payments', 'IDX_PAYMENTS_DATE');
    await queryRunner.dropIndex('payments', 'IDX_PAYMENTS_PURCHASE');
    await queryRunner.dropIndex('payments', 'IDX_PAYMENTS_SALE');
    await queryRunner.dropIndex('payments', 'IDX_PAYMENTS_SUPPLIER');
    await queryRunner.dropIndex('payments', 'IDX_PAYMENTS_CUSTOMER');

    // Drop foreign keys
    const table = await queryRunner.getTable('payments');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('payments', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('payments', true);

    // Drop enum
    await queryRunner.query(`DROP TYPE "public"."payments_paymentmethod_enum"`);
  }
}
