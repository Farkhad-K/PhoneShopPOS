// src/seed/wipe.ts
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function wipe(): Promise<void> {
  // Initialize Nest app context
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      console.log('Dropping public schema...');
      await queryRunner.query('DROP SCHEMA public CASCADE;');

      console.log('Recreating public schema...');
      await queryRunner.query('CREATE SCHEMA public;');

      console.log('Granting privileges...');
      // Try to grant to postgres role if it exists, otherwise skip
      try {
        await queryRunner.query('GRANT ALL ON SCHEMA public TO postgres;');
      } catch (err) {
        console.log('  ⚠️ Skipping grant to postgres role (role does not exist)');
      }
      await queryRunner.query('GRANT ALL ON SCHEMA public TO public;');

      console.log('✅ Database schema dropped and recreated successfully.');
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Wipe failed:', error);
  } finally {
    await app.close();
  }
}

wipe().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
