import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import { CreateSaleTable1707831000000 } from './src/migrations/1707831000000-CreateSaleTable';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  const ds = app.get(DataSource);
  const queryRunner = ds.createQueryRunner();
  
  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    console.log('Running CreateSaleTable migration...');
    const migration = new CreateSaleTable1707831000000();
    await migration.up(queryRunner);
    
    await queryRunner.query(
      `INSERT INTO migrations(timestamp, name) VALUES ($1, $2)`,
      [1707831000000, 'CreateSaleTable1707831000000']
    );
    
    await queryRunner.commitTransaction();
    console.log('✅ Sales table created successfully');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error:', error.message);
  } finally {
    await queryRunner.release();
    await app.close();
  }
}

run();
