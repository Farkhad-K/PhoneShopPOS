import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddImeiUniqueConstraint1707831200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add unique constraint on IMEI (allowing NULL for phones without IMEI)
    await queryRunner.createIndex(
      'phones',
      new TableIndex({
        name: 'IDX_PHONES_IMEI_UNIQUE',
        columnNames: ['imei'],
        isUnique: true,
        where: 'imei IS NOT NULL', // PostgreSQL partial index - only enforce uniqueness on non-null values
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('phones', 'IDX_PHONES_IMEI_UNIQUE');
  }
}
