import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function check() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ds = app.get(DataSource);
  const migrations = await ds.query('SELECT * FROM migrations ORDER BY timestamp');
  console.log('Migrations in database:');
  migrations.forEach(m => console.log(`  ${m.timestamp} - ${m.name}`));
  await app.close();
}

check();
