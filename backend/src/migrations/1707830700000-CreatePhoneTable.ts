import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePhoneTable1707830700000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE "phone_status_enum" AS ENUM('IN_STOCK', 'IN_REPAIR', 'READY_FOR_SALE', 'SOLD', 'RETURNED');
      CREATE TYPE "phone_condition_enum" AS ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'phones',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'brand',
            type: 'varchar',
          },
          {
            name: 'model',
            type: 'varchar',
          },
          {
            name: 'imei',
            type: 'varchar',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'condition',
            type: 'phone_condition_enum',
            default: "'NEW'",
          },
          {
            name: 'purchasePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'phone_status_enum',
            default: "'IN_STOCK'",
          },
          {
            name: 'barcode',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'totalCost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
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

    // Create indexes
    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_BARCODE',
        columnNames: ['barcode'],
      }),
    );

    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_IMEI',
        columnNames: ['imei'],
      }),
    );

    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_BRAND_MODEL',
        columnNames: ['brand', 'model'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('phones', 'IDX_PHONES_BRAND_MODEL');
    await queryRunner.dropIndex('phones', 'IDX_PHONES_STATUS');
    await queryRunner.dropIndex('phones', 'IDX_PHONES_IMEI');
    await queryRunner.dropIndex('phones', 'IDX_PHONES_BARCODE');
    await queryRunner.dropTable('phones');
    await queryRunner.query(`
      DROP TYPE "phone_condition_enum";
      DROP TYPE "phone_status_enum";
    `);
  }
}
