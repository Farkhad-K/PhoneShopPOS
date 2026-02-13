// Run phone migration
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CreatePhoneTable1707830700000 } from '../migrations/1707830700000-CreatePhoneTable';

config();

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB || 'phone_shop_db',
    entities: [],
    migrations: [CreatePhoneTable1707830700000],
    synchronize: false,
    logging: true,
  });

  try {
    console.log('📦 Initializing DataSource...');
    await dataSource.initialize();

    console.log('🔄 Running phone migration...');
    await dataSource.runMigrations();

    console.log('✅ Phone table created successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
