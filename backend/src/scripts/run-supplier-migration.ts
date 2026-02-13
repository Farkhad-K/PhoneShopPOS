// Run supplier migration
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CreateSupplierTable1707830600000 } from '../migrations/1707830600000-CreateSupplierTable';

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
    migrations: [CreateSupplierTable1707830600000],
    synchronize: false,
    logging: true,
  });

  try {
    console.log('📦 Initializing DataSource...');
    await dataSource.initialize();

    console.log('🔄 Running supplier migration...');
    await dataSource.runMigrations();

    console.log('✅ Supplier table created successfully!');
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
