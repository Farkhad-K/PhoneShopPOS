import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSaleTable1707831000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create sales table
    await queryRunner.createTable(
      new Table({
        name: 'sales',
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
            name: 'phoneId',
            type: 'int',
            isUnique: true,
          },
          {
            name: 'customerId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'salePrice',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'saleDate',
            type: 'timestamptz',
          },
          {
            name: 'paymentType',
            type: 'enum',
            enum: ['CASH', 'PAY_LATER'],
            default: "'CASH'",
          },
          {
            name: 'paymentStatus',
            type: 'enum',
            enum: ['PAID', 'PARTIAL', 'UNPAID'],
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
        ],
      }),
      true,
    );

    // Add foreign key to phones table
    await queryRunner.createForeignKey(
      'sales',
      new TableForeignKey({
        columnNames: ['phoneId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'phones',
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key to customers table (nullable)
    await queryRunner.createForeignKey(
      'sales',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('sales');
    if (table) {
      const phoneForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('phoneId') !== -1,
      );
      if (phoneForeignKey) {
        await queryRunner.dropForeignKey('sales', phoneForeignKey);
      }

      const customerForeignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('customerId') !== -1,
      );
      if (customerForeignKey) {
        await queryRunner.dropForeignKey('sales', customerForeignKey);
      }
    }

    await queryRunner.dropTable('sales', true);
  }
}
