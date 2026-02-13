import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePurchaseTable1707830800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create payment_status enum
    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM('PAID', 'PARTIAL', 'UNPAID');
    `);

    // Create purchases table
    await queryRunner.createTable(
      new Table({
        name: 'purchases',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'supplierId',
            type: 'int',
          },
          {
            name: 'purchaseDate',
            type: 'timestamptz',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'paymentStatus',
            type: 'payment_status_enum',
            default: "'UNPAID'",
          },
          {
            name: 'paidAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
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
        ],
      }),
      true,
    );

    // Add foreign key to suppliers
    await queryRunner.createForeignKey(
      'purchases',
      new TableForeignKey({
        columnNames: ['supplierId'],
        referencedTableName: 'suppliers',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Add purchaseId column to phones table
    await queryRunner.query(`
      ALTER TABLE "phones" ADD COLUMN "purchaseId" int NOT NULL;
    `);

    // Add foreign key from phones to purchases
    await queryRunner.createForeignKey(
      'phones',
      new TableForeignKey({
        columnNames: ['purchaseId'],
        referencedTableName: 'purchases',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'purchases',
      new TableIndex({
        name: 'IDX_PURCHASES_SUPPLIER',
        columnNames: ['supplierId'],
      }),
    );

    await queryRunner.createIndex(
      'purchases',
      new TableIndex({
        name: 'IDX_PURCHASES_DATE',
        columnNames: ['purchaseDate'],
      }),
    );

    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_PURCHASE',
        columnNames: ['purchaseId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('phones', 'IDX_PHONES_PURCHASE');
    await queryRunner.dropIndex('purchases', 'IDX_PURCHASES_DATE');
    await queryRunner.dropIndex('purchases', 'IDX_PURCHASES_SUPPLIER');

    const phoneTable = await queryRunner.getTable('phones');
    if (phoneTable) {
      const phoneForeignKey = phoneTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('purchaseId') !== -1,
      );
      if (phoneForeignKey) {
        await queryRunner.dropForeignKey('phones', phoneForeignKey);
      }
    }

    await queryRunner.query(`ALTER TABLE "phones" DROP COLUMN "purchaseId"`);

    const purchaseTable = await queryRunner.getTable('purchases');
    if (purchaseTable) {
      const supplierForeignKey = purchaseTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('supplierId') !== -1,
      );
      if (supplierForeignKey) {
        await queryRunner.dropForeignKey('purchases', supplierForeignKey);
      }
    }

    await queryRunner.dropTable('purchases');
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
  }
}
