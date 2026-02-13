import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB || 'phone_shop_db',
  synchronize: false,
  logging: true,
});

async function runMigration() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const sqlFile = fs.readFileSync(
      path.join(__dirname, 'create-worker-tables.sql'),
      'utf8',
    );

    await AppDataSource.query(sqlFile);
    console.log('Worker tables created successfully!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
