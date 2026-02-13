import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateSupplierTable1707830600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'suppliers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'companyName',
            type: 'varchar',
          },
          {
            name: 'contactPerson',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: true,
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

    // Create index on phoneNumber for fast search
    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIERS_PHONE_NUMBER',
        columnNames: ['phoneNumber'],
      }),
    );

    // Create index on companyName for search
    await queryRunner.createIndex(
      'suppliers',
      new TableIndex({
        name: 'IDX_SUPPLIERS_COMPANY_NAME',
        columnNames: ['companyName'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIERS_COMPANY_NAME');
    await queryRunner.dropIndex('suppliers', 'IDX_SUPPLIERS_PHONE_NUMBER');
    await queryRunner.dropTable('suppliers');
  }
}
