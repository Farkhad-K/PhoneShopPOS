import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkerTable1707831300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'workers',
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
            name: 'fullName',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'passportId',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'hireDate',
            type: 'date',
          },
          {
            name: 'terminationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'monthlySalary',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key to user table
    await queryRunner.createForeignKey(
      'workers',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
      }),
    );

    // Create index on phoneNumber
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKERS_PHONE" ON "workers" ("phoneNumber")`,
    );

    // Create index on isActive
    await queryRunner.query(
      `CREATE INDEX "IDX_WORKERS_ACTIVE" ON "workers" ("isActive")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('workers');
  }
}
