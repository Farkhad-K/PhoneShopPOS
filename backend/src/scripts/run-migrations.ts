// Run migrations directly
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { CreateUserTable1707830300000 } from '../migrations/1707830300000-CreateUserTable';
import { UpdateUserRoles1707830400000 } from '../migrations/1707830400000-UpdateUserRoles';
import { CreateCustomerTable1707830500000 } from '../migrations/1707830500000-CreateCustomerTable';

config();

async function runMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB || 'phone_shop_db',
    entities: [],
    migrations: [
      CreateUserTable1707830300000,
      UpdateUserRoles1707830400000,
      CreateCustomerTable1707830500000,
    ],
    synchronize: false,
    logging: true,
  });

  try {
    console.log('📦 Initializing DataSource...');
    await dataSource.initialize();

    console.log('🔄 Running migrations...');
    await dataSource.runMigrations();

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
