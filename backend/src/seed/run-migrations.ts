// src/seed/run-migrations.ts
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function runMigrations(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);

    console.log('📝 Running pending migrations...\n');
    const migrations = await dataSource.runMigrations({ transaction: 'all' });

    if (migrations.length === 0) {
      console.log('✅ No pending migrations.');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migrations:`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

runMigrations().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
