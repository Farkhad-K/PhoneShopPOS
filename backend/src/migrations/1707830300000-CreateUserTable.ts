import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1707830300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the user_role_enum type first
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('ADMIN', 'WORKER');
    `);

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'username',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'user_role_enum',
          },
          {
            name: 'refreshTokenVersion',
            type: 'int',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
    await queryRunner.query(`DROP TYPE "user_role_enum";`);
  }
}
