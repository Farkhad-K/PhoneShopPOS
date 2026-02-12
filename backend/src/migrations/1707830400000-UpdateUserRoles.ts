import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoles1707830400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old enum type and create new one with updated values
    await queryRunner.query(`
      -- Create new enum type
      CREATE TYPE "user_role_new" AS ENUM('OWNER', 'MANAGER', 'CASHIER', 'TECHNICIAN');

      -- Update existing users: ADMIN -> OWNER, WORKER -> CASHIER
      ALTER TABLE "user"
        ALTER COLUMN "role" TYPE VARCHAR(20);

      UPDATE "user" SET "role" = 'OWNER' WHERE "role" = 'ADMIN';
      UPDATE "user" SET "role" = 'CASHIER' WHERE "role" = 'WORKER';

      -- Drop old enum and rename new one
      DROP TYPE IF EXISTS "user_role_enum" CASCADE;
      ALTER TYPE "user_role_new" RENAME TO "user_role_enum";

      -- Apply new enum type to column
      ALTER TABLE "user"
        ALTER COLUMN "role" TYPE "user_role_enum"
        USING "role"::"user_role_enum";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to old enum type
    await queryRunner.query(`
      -- Create old enum type
      CREATE TYPE "user_role_old" AS ENUM('ADMIN', 'WORKER');

      -- Update existing users: OWNER -> ADMIN, others -> WORKER
      ALTER TABLE "user"
        ALTER COLUMN "role" TYPE VARCHAR(20);

      UPDATE "user" SET "role" = 'ADMIN' WHERE "role" = 'OWNER';
      UPDATE "user" SET "role" = 'WORKER' WHERE "role" IN ('MANAGER', 'CASHIER', 'TECHNICIAN');

      -- Drop new enum and rename old one
      DROP TYPE IF EXISTS "user_role_enum" CASCADE;
      ALTER TYPE "user_role_old" RENAME TO "user_role_enum";

      -- Apply old enum type to column
      ALTER TABLE "user"
        ALTER COLUMN "role" TYPE "user_role_enum"
        USING "role"::"user_role_enum";
    `);
  }
}
