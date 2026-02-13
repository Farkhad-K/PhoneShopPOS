import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRepairTable1707830900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create repairs table
    await queryRunner.createTable(
      new Table({
        name: 'repairs',
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
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'repairCost',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: "'PENDING'",
          },
          {
            name: 'startDate',
            type: 'timestamptz',
          },
          {
            name: 'completionDate',
            type: 'timestamptz',
            isNullable: true,
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
      'repairs',
      new TableForeignKey({
        columnNames: ['phoneId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'phones',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('repairs');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('phoneId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('repairs', foreignKey);
      }
    }

    await queryRunner.dropTable('repairs', true);
  }
}
