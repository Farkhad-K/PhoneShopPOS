// src/seed/phone-shop-seed.ts
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Role, PhoneStatus, PhoneCondition, PaymentStatus, PaymentType, PaymentMethod, RepairStatus } from 'src/common/enums/enum';
import { generatePhoneBarcode } from 'src/common/utils/barcode-generator.util';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random date within range
 */
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random Uzbek name
 */
function randomUzbekName(gender: 'male' | 'female'): { firstName: string; lastName: string } {
  const maleFirstNames = ['Dilshod', 'Aziz', 'Jamshid', 'Rustam', 'Otabek', 'Sardor', 'Bobur', 'Jahongir', 'Sherzod', 'Temur', 'Alisher', 'Bekzod', 'Davron', 'Eldor', 'Farruh', 'Javohir', 'Kamol', 'Mansur', 'Nodir', 'Ravshan', 'Sanjar', 'Ulugbek', 'Zafar'];
  const femaleFirstNames = ['Nodira', 'Dilnoza', 'Shahzoda', 'Gulnora', 'Malika', 'Feruza', 'Zarina', 'Kamola', 'Nilufar', 'Oydin', 'Madina', 'Sevara', 'Durdona', 'Yulduz', 'Barno', 'Fotima', 'Gavhar', 'Hilola'];
  const lastNames = ['Karimov', 'Rahimov', 'Tursunov', 'Mahmudov', 'Abdullayev', 'Yusupov', 'Nurmatov', 'Saidov', 'Ahmadov', 'Eshonov', 'Ismoilov', 'Mirzayev', 'Qodirov', 'Rasulov', 'Sobirova', 'Sharipova', 'Azizova', 'Karimova', 'Rahimova', 'Tursunova'];

  const firstName = gender === 'male' ? randomPick(maleFirstNames) : randomPick(femaleFirstNames);
  const lastName = randomPick(lastNames);

  return { firstName, lastName };
}

/**
 * Generate random Uzbek phone number (+998 format)
 */
function randomUzbekPhone(): string {
  const prefixes = ['90', '91', '93', '94', '95', '97', '98', '99'];
  const prefix = randomPick(prefixes);
  const number = randomInt(1000000, 9999999);
  return `+998${prefix}${number}`;
}

/**
 * Generate random passport ID (AA1234567 format)
 */
function randomPassportId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter1 = letters[randomInt(0, 25)];
  const letter2 = letters[randomInt(0, 25)];
  const numbers = randomInt(1000000, 9999999);
  return `${letter1}${letter2}${numbers}`;
}

/**
 * Generate random Uzbek address
 */
function randomUzbekAddress(): string {
  const cities = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana', 'Nukus', 'Urgench', 'Qarshi', 'Termez'];
  const districts = ['Chilanzar', 'Yunusabad', 'Sergeli', 'Mirzo Ulugbek', 'Uchtepa', 'Yakkasaray', 'Shaykhontohur', 'Bektemir', 'Olmazor', 'Center', 'Old City'];
  const city = randomPick(cities);
  const district = randomPick(districts);
  const building = randomInt(1, 150);
  return `${city}, ${district} ${building}`;
}

/**
 * Calculate partial payment amount
 */
function randomPartialPayment(total: number, minPercent: number, maxPercent: number): number {
  const percent = randomInt(minPercent, maxPercent);
  return Math.floor(total * percent / 100);
}

// ============================================================================
// DATA ARRAYS
// ============================================================================

/**
 * Phone models with realistic Uzbek prices (in UZS)
 */
const phoneModels = [
  // Premium iPhones
  { brand: 'Apple', model: 'iPhone 15 Pro Max', purchasePrice: 11000000, salePrice: 14500000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 15 Pro', purchasePrice: 9500000, salePrice: 12500000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 15', purchasePrice: 8000000, salePrice: 10500000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 14 Pro Max', purchasePrice: 8500000, salePrice: 11000000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 14 Pro', purchasePrice: 7500000, salePrice: 9800000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 14', purchasePrice: 6500000, salePrice: 8500000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 13 Pro Max', purchasePrice: 6000000, salePrice: 7800000, tier: 'premium' },
  { brand: 'Apple', model: 'iPhone 13', purchasePrice: 5000000, salePrice: 6500000, tier: 'premium' },

  // Premium Samsung
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', purchasePrice: 10500000, salePrice: 13500000, tier: 'premium' },
  { brand: 'Samsung', model: 'Galaxy S24+', purchasePrice: 9000000, salePrice: 11500000, tier: 'premium' },
  { brand: 'Samsung', model: 'Galaxy S24', purchasePrice: 7500000, salePrice: 9800000, tier: 'premium' },
  { brand: 'Samsung', model: 'Galaxy S23 Ultra', purchasePrice: 8000000, salePrice: 10500000, tier: 'premium' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', purchasePrice: 12000000, salePrice: 15500000, tier: 'premium' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', purchasePrice: 7000000, salePrice: 9200000, tier: 'premium' },

  // Mid-range Xiaomi
  { brand: 'Xiaomi', model: 'Xiaomi 14', purchasePrice: 4500000, salePrice: 5800000, tier: 'mid-range' },
  { brand: 'Xiaomi', model: 'Xiaomi 13T Pro', purchasePrice: 3800000, salePrice: 5000000, tier: 'mid-range' },
  { brand: 'Xiaomi', model: 'Xiaomi 13', purchasePrice: 3500000, salePrice: 4600000, tier: 'mid-range' },

  // Redmi series
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro+', purchasePrice: 3200000, salePrice: 4200000, tier: 'mid-range' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', purchasePrice: 2500000, salePrice: 3300000, tier: 'mid-range' },
  { brand: 'Xiaomi', model: 'Redmi Note 13', purchasePrice: 2000000, salePrice: 2700000, tier: 'mid-range' },
  { brand: 'Xiaomi', model: 'Redmi Note 12 Pro', purchasePrice: 2300000, salePrice: 3000000, tier: 'mid-range' },

  // Oppo
  { brand: 'Oppo', model: 'Oppo Reno 11 Pro', purchasePrice: 3500000, salePrice: 4600000, tier: 'mid-range' },
  { brand: 'Oppo', model: 'Oppo Reno 10 Pro', purchasePrice: 3000000, salePrice: 3900000, tier: 'mid-range' },
  { brand: 'Oppo', model: 'Oppo A78', purchasePrice: 2000000, salePrice: 2600000, tier: 'mid-range' },

  // Vivo
  { brand: 'Vivo', model: 'Vivo V30 Pro', purchasePrice: 3800000, salePrice: 5000000, tier: 'mid-range' },
  { brand: 'Vivo', model: 'Vivo V29', purchasePrice: 3200000, salePrice: 4200000, tier: 'mid-range' },
  { brand: 'Vivo', model: 'Vivo Y78', purchasePrice: 2300000, salePrice: 3000000, tier: 'mid-range' },
];

/**
 * Repair types with cost calculators
 */
const repairTypes = [
  { description: 'Screen replacement (flagship)', minCost: 800000, maxCost: 1500000, tier: 'premium' },
  { description: 'Screen replacement (mid-range)', minCost: 400000, maxCost: 800000, tier: 'mid-range' },
  { description: 'Battery replacement', minCost: 200000, maxCost: 500000, tier: 'both' },
  { description: 'Charging port repair', minCost: 150000, maxCost: 300000, tier: 'both' },
  { description: 'Camera module replacement', minCost: 500000, maxCost: 1200000, tier: 'premium' },
  { description: 'Camera module replacement', minCost: 300000, maxCost: 600000, tier: 'mid-range' },
  { description: 'Back glass replacement', minCost: 300000, maxCost: 600000, tier: 'both' },
  { description: 'Water damage repair', minCost: 600000, maxCost: 1500000, tier: 'both' },
  { description: 'Motherboard repair', minCost: 1000000, maxCost: 2500000, tier: 'premium' },
  { description: 'Motherboard repair', minCost: 500000, maxCost: 1200000, tier: 'mid-range' },
];

/**
 * Uzbek supplier companies
 */
const supplierCompanies = [
  { name: 'TechnoMart Toshkent', person: 'Akbar Aliyev', specialty: 'Samsung/Android specialist', email: 'sales@technomart.uz' },
  { name: 'Apple Premium Reseller Uzbekistan', person: 'Olim Karimov', specialty: 'Authorized Apple dealer', email: 'contact@apple-uz.com' },
  { name: 'Samarkand Electronics LLC', person: 'Rustam Saidov', specialty: 'Mid-range phones', email: 'info@samelec.uz' },
  { name: 'Bukhara Phone Wholesale', person: 'Jamshid Mahmudov', specialty: 'Xiaomi/Redmi distributor', email: 'wholesale@bukhara-phones.uz' },
  { name: 'Silk Road Mobile Trading', person: 'Dilshod Yusupov', specialty: 'Chinese brands importer', email: 'import@silkroad-mobile.uz' },
  { name: 'Andijan Tech Supply', person: 'Aziz Nurmatov', specialty: 'Oppo/Vivo specialist', email: 'supply@andijan-tech.uz' },
  { name: 'Namangan Digital Market', person: 'Sardor Ahmadov', specialty: 'Mixed brands', email: 'sales@namangan-digital.uz' },
  { name: 'Fergana Phones Direct', person: 'Otabek Eshonov', specialty: 'Budget/mid-range', email: 'direct@fergana-phones.uz' },
  { name: 'Nukus Mobile Solutions', person: 'Temur Ismoilov', specialty: 'Regional supplier', email: 'solutions@nukus-mobile.uz' },
  { name: 'Urgench Electronics Hub', person: 'Bekzod Mirzayev', specialty: 'Samsung specialist', email: 'hub@urgench-electronics.uz' },
  { name: 'Qarshi Phone Distribution', person: 'Davron Qodirov', specialty: 'iPhone importer', email: 'distribution@qarshi-phones.uz' },
  { name: 'Termez Tech Wholesale', person: 'Eldor Rasulov', specialty: 'Xiaomi official distributor', email: 'wholesale@termez-tech.uz' },
];

/**
 * Phone colors
 */
const colors = [
  // Apple colors
  'Natural Titanium', 'Blue Titanium', 'White Titanium', 'Black Titanium',
  'Deep Purple', 'Gold', 'Silver', 'Space Black', 'Starlight', 'Midnight', 'Blue', 'Pink', 'Red',
  // Samsung colors
  'Phantom Black', 'Cream', 'Green', 'Lavender', 'Titanium Black', 'Titanium Gray', 'Icy Blue',
  // Chinese brands colors
  'Aurora Green', 'Midnight Black', 'Moonlight White', 'Ocean Blue', 'Sunset Orange',
];

// ============================================================================
// MAIN SEEDING FUNCTION
// ============================================================================

async function run() {
  console.log('🌱 Starting Enhanced Phone Shop POS database seed...\n');
  console.log('📊 Target volumes:');
  console.log('   - 250 phones, 130 sales, 180 payments');
  console.log('   - 80 customers, 12 suppliers, 10 workers');
  console.log('   - Date range: Dec 14, 2025 - Feb 14, 2026');
  console.log('   - Currency: Uzbek sum (UZS)\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const ds = app.get<DataSource>(DataSource);

  // Date range for transactions
  const startDate = new Date('2025-12-14');
  const endDate = new Date('2026-02-14');

  try {
    await ds.transaction(async (manager) => {
      // ========================================================================
      // 1. CREATE USERS (10 workers)
      // ========================================================================
      console.log('👤 Creating 10 users (workers)...');

      const userSeeds = [
        { username: 'owner', password: 'owner123', role: Role.OWNER },
        { username: 'manager1', password: 'manager123', role: Role.MANAGER },
        { username: 'manager2', password: 'manager123', role: Role.MANAGER },
        { username: 'cashier1', password: 'cashier123', role: Role.CASHIER },
        { username: 'cashier2', password: 'cashier123', role: Role.CASHIER },
        { username: 'cashier3', password: 'cashier123', role: Role.CASHIER },
        { username: 'technician1', password: 'tech123', role: Role.TECHNICIAN },
        { username: 'technician2', password: 'tech123', role: Role.TECHNICIAN },
        { username: 'technician3', password: 'tech123', role: Role.TECHNICIAN },
        { username: 'sales1', password: 'sales123', role: Role.CASHIER },
      ];

      const userIds: number[] = [];
      for (const user of userSeeds) {
        const hash = await bcrypt.hash(user.password, 10);
        const result = await manager.query(
          `
          INSERT INTO "user" ("username","password","role","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, true, now(), now())
          ON CONFLICT ("username") DO UPDATE
            SET "password" = EXCLUDED."password",
                "role" = EXCLUDED."role",
                "isActive" = true,
                "updatedAt" = now()
          RETURNING id;
        `,
          [user.username, hash, user.role],
        );
        userIds.push(result[0].id);
      }
      console.log(`  ✓ Created ${userIds.length} users`);

      // ========================================================================
      // 2. CREATE WORKERS (10)
      // ========================================================================
      console.log('\n👷 Creating 10 workers...');

      const workerData = [
        { fullName: 'Dilshod Karimov', position: 'Shop Owner', monthlySalary: 5000000, userId: userIds[0], passportId: 'AA1000001' },
        { fullName: 'Aziz Rahimov', position: 'Sales Manager', monthlySalary: 3500000, userId: userIds[1], passportId: 'AA1000002' },
        { fullName: 'Rustam Tursunov', position: 'Inventory Manager', monthlySalary: 3200000, userId: userIds[2], passportId: 'AA1000003' },
        { fullName: 'Sardor Mahmudov', position: 'Cashier', monthlySalary: 2500000, userId: userIds[3], passportId: 'AA1000004' },
        { fullName: 'Jamshid Abdullayev', position: 'Cashier', monthlySalary: 2500000, userId: userIds[4], passportId: 'AA1000005' },
        { fullName: 'Otabek Yusupov', position: 'Sales Associate', monthlySalary: 2800000, userId: userIds[5], passportId: 'AA1000006' },
        { fullName: 'Bobur Nurmatov', position: 'Senior Technician', monthlySalary: 3000000, userId: userIds[6], passportId: 'AA1000007' },
        { fullName: 'Temur Saidov', position: 'Technician', monthlySalary: 2700000, userId: userIds[7], passportId: 'AA1000008' },
        { fullName: 'Alisher Ahmadov', position: 'Junior Technician', monthlySalary: 2300000, userId: userIds[8], passportId: 'AA1000009' },
        { fullName: 'Bekzod Eshonov', position: 'Sales Associate', monthlySalary: 2600000, userId: userIds[9], passportId: 'AA1000010' },
      ];

      const workerIds: number[] = [];
      for (const worker of workerData) {
        const phone = randomUzbekPhone();
        const address = randomUzbekAddress();
        const notes = `Position: ${worker.position}. Hired ${new Date('2023-01-01').toLocaleDateString()}`;
        const result = await manager.query(
          `
          INSERT INTO "workers" ("fullName","phoneNumber","address","passportId","monthlySalary","hireDate","userId","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, now(), now())
          ON CONFLICT ("passportId") DO UPDATE
            SET "fullName" = EXCLUDED."fullName",
                "phoneNumber" = EXCLUDED."phoneNumber",
                "address" = EXCLUDED."address",
                "monthlySalary" = EXCLUDED."monthlySalary",
                "userId" = EXCLUDED."userId",
                "notes" = EXCLUDED."notes"
          RETURNING id;
        `,
          [worker.fullName, phone, address, worker.passportId, worker.monthlySalary, randomDate(new Date('2023-01-01'), new Date('2025-06-01')), worker.userId, notes],
        );
        workerIds.push(result[0].id);
      }
      console.log(`  ✓ Created ${workerIds.length} workers`);

      // ========================================================================
      // 3. CREATE CUSTOMERS (80)
      // ========================================================================
      console.log('\n👥 Creating 80 customers with Uzbek names...');

      const customerIds: number[] = [];
      const usedPhones = new Set<string>();

      for (let i = 0; i < 80; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const { firstName, lastName } = randomUzbekName(gender);
        const fullName = `${firstName} ${lastName}`;

        let phone: string;
        do {
          phone = randomUzbekPhone();
        } while (usedPhones.has(phone));
        usedPhones.add(phone);

        const address = randomUzbekAddress();
        const passportId = Math.random() > 0.3 ? randomPassportId() : null;
        const notes = Math.random() > 0.7 ? randomPick(['Regular customer', 'Wholesale buyer', 'Prefers cash', 'Good payment history', 'VIP customer']) : null;

        const result = await manager.query(
          `
          INSERT INTO "customers" ("fullName","phoneNumber","address","passportId","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, true, now(), now())
          ON CONFLICT ("phoneNumber") DO NOTHING
          RETURNING id;
        `,
          [fullName, phone, address, passportId, notes],
        );

        if (result.length > 0) {
          customerIds.push(result[0].id);
        }
      }
      console.log(`  ✓ Created ${customerIds.length} customers`);

      // ========================================================================
      // 4. CREATE SUPPLIERS (12)
      // ========================================================================
      console.log('\n🏢 Creating 12 Uzbek suppliers...');

      const supplierIds: number[] = [];
      for (const supplier of supplierCompanies) {
        const phone = randomUzbekPhone();
        const address = randomUzbekAddress();
        const notes = `${supplier.specialty}. Reliable partner with competitive prices.`;

        const result = await manager.query(
          `
          INSERT INTO "suppliers" ("companyName","contactPerson","phoneNumber","email","address","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, true, now(), now())
          ON CONFLICT ("phoneNumber") DO UPDATE
            SET "companyName" = EXCLUDED."companyName",
                "contactPerson" = EXCLUDED."contactPerson",
                "email" = EXCLUDED."email"
          RETURNING id;
        `,
          [supplier.name, supplier.person, phone, supplier.email, address, notes],
        );
        supplierIds.push(result[0].id);
      }
      console.log(`  ✓ Created ${supplierIds.length} suppliers`);

      // ========================================================================
      // 5. CREATE PURCHASES (50 transactions)
      // ========================================================================
      console.log('\n📦 Creating 50 purchase transactions over 2 months...');

      const purchaseIds: number[] = [];
      const purchaseDates: Date[] = [];

      for (let i = 0; i < 50; i++) {
        const supplierId = randomPick(supplierIds);
        const purchaseDate = randomDate(startDate, new Date('2026-02-10')); // Purchases up to Feb 10
        purchaseDates.push(purchaseDate);

        // Random number of phones per purchase (3-8)
        const phoneCount = randomInt(3, 8);

        // Calculate total based on random phones (will be approximate)
        const avgPhonePrice = 5000000; // Average price
        const totalAmount = phoneCount * avgPhonePrice;

        // Payment status distribution: 70% PAID, 20% PARTIAL, 10% UNPAID
        const rand = Math.random();
        let paymentStatus: PaymentStatus;
        let paidAmount: number;

        if (rand < 0.7) {
          paymentStatus = PaymentStatus.PAID;
          paidAmount = totalAmount;
        } else if (rand < 0.9) {
          paymentStatus = PaymentStatus.PARTIAL;
          paidAmount = randomPartialPayment(totalAmount, 40, 80);
        } else {
          paymentStatus = PaymentStatus.UNPAID;
          paidAmount = 0;
        }

        const result = await manager.query(
          `
          INSERT INTO "purchases" ("supplierId","purchaseDate","totalAmount","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, 'Bulk purchase order', true, now(), now())
          RETURNING id;
        `,
          [supplierId, purchaseDate, totalAmount, paymentStatus, paidAmount],
        );
        purchaseIds.push(result[0].id);
      }
      console.log(`  ✓ Created ${purchaseIds.length} purchases`);

      // ========================================================================
      // 6. CREATE PHONES (250 units)
      // ========================================================================
      console.log('\n📱 Creating 250 phones with varied brands and models...');

      const phoneIds: number[] = [];
      const phoneData: Array<{ id: number; purchaseDate: Date; tier: string; status: PhoneStatus; totalCost: number; salePrice: number }> = [];

      let phoneIndex = 0;
      for (const purchaseId of purchaseIds) {
        const purchaseDate = purchaseDates[purchaseIds.indexOf(purchaseId)];
        const phonesInPurchase = randomInt(3, 8);

        for (let j = 0; j < phonesInPurchase && phoneIndex < 250; j++) {
          const model = randomPick(phoneModels);
          const color = randomPick(colors);
          const condition = randomPick([PhoneCondition.NEW, PhoneCondition.NEW, PhoneCondition.NEW, PhoneCondition.LIKE_NEW, PhoneCondition.GOOD]); // 60% NEW
          const barcode = generatePhoneBarcode();

          // Add ±5% variation to purchase price
          const priceVariation = 1 + (Math.random() * 0.1 - 0.05);
          const purchasePrice = Math.floor(model.purchasePrice * priceVariation);

          const result = await manager.query(
            `
            INSERT INTO "phones" ("brand","model","imei","color","condition","purchasePrice","status","barcode","totalCost","purchaseId","isActive","createdAt","updatedAt")
            VALUES ($1, $2, NULL, $3, $4, $5, 'IN_STOCK', $6, $5, $7, true, now(), now())
            RETURNING id;
          `,
            [model.brand, model.model, color, condition, purchasePrice, barcode, purchaseId],
          );

          phoneIds.push(result[0].id);
          phoneData.push({
            id: result[0].id,
            purchaseDate,
            tier: model.tier,
            status: PhoneStatus.IN_STOCK,
            totalCost: purchasePrice,
            salePrice: Math.floor(model.salePrice * priceVariation),
          });

          phoneIndex++;
        }
      }
      console.log(`  ✓ Created ${phoneIds.length} phones`);

      // ========================================================================
      // 7. CREATE REPAIRS (120 records - 40% of phones)
      // ========================================================================
      console.log('\n🔧 Creating 120 repair records...');

      // Select 120 random phones for repairs
      const phonesToRepair = [...phoneData].sort(() => Math.random() - 0.5).slice(0, 120);

      let repairCount = 0;
      for (const phone of phonesToRepair) {
        // Find appropriate repair type based on phone tier
        const availableRepairs = repairTypes.filter(r => r.tier === phone.tier || r.tier === 'both');
        const repair = randomPick(availableRepairs);
        const repairCost = randomInt(repair.minCost, repair.maxCost);

        // Repair starts 1-7 days after purchase
        const startDate = new Date(phone.purchaseDate.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);

        // Repair status distribution: 60% COMPLETED, 30% IN_PROGRESS, 10% PENDING
        const rand = Math.random();
        let status: RepairStatus;
        let completionDate: Date | null = null;
        let newPhoneStatus: PhoneStatus = PhoneStatus.IN_STOCK;

        if (rand < 0.6) {
          status = RepairStatus.COMPLETED;
          completionDate = new Date(startDate.getTime() + randomInt(1, 5) * 24 * 60 * 60 * 1000);
          newPhoneStatus = PhoneStatus.READY_FOR_SALE;
        } else if (rand < 0.9) {
          status = RepairStatus.IN_PROGRESS;
          newPhoneStatus = PhoneStatus.IN_REPAIR;
        } else {
          status = RepairStatus.PENDING;
          newPhoneStatus = PhoneStatus.IN_STOCK;
        }

        await manager.query(
          `
          INSERT INTO "repairs" ("phoneId","description","repairCost","status","startDate","completionDate","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, 'Repair completed successfully', true, now(), now());
        `,
          [phone.id, repair.description, repairCost, status, startDate, completionDate],
        );

        // Update phone totalCost and status
        await manager.query(
          `UPDATE "phones" SET "totalCost" = "totalCost" + $1, "status" = $2 WHERE id = $3`,
          [repairCost, newPhoneStatus, phone.id],
        );

        // Update local phone data
        phone.status = newPhoneStatus;
        phone.totalCost += repairCost;

        repairCount++;
      }
      console.log(`  ✓ Created ${repairCount} repairs`);

      // ========================================================================
      // 8. CREATE SALES (130 transactions - 52% of phones)
      // ========================================================================
      console.log('\n💰 Creating 130 sales transactions...');

      // Get phones available for sale (IN_STOCK or READY_FOR_SALE)
      const availablePhones = phoneData.filter(p => p.status === PhoneStatus.IN_STOCK || p.status === PhoneStatus.READY_FOR_SALE);
      const phonesToSell = availablePhones.sort(() => Math.random() - 0.5).slice(0, 130);

      const saleIds: number[] = [];
      for (const phone of phonesToSell) {
        // Sale date must be after purchase/repair date
        const minSaleDate = new Date(Math.max(phone.purchaseDate.getTime() + 2 * 24 * 60 * 60 * 1000, startDate.getTime()));
        const saleDate = randomDate(minSaleDate, endDate);

        // 40% CASH (no customer), 60% PAY_LATER (with customer)
        const isCash = Math.random() < 0.4;
        const customerId = isCash ? null : randomPick(customerIds);
        const paymentType = isCash ? PaymentType.CASH : PaymentType.PAY_LATER;

        // Payment status: 60% PAID, 30% PARTIAL, 10% UNPAID
        const rand = Math.random();
        let paymentStatus: PaymentStatus;
        let paidAmount: number;

        if (rand < 0.6) {
          paymentStatus = PaymentStatus.PAID;
          paidAmount = phone.salePrice;
        } else if (rand < 0.9) {
          paymentStatus = PaymentStatus.PARTIAL;
          paidAmount = randomPartialPayment(phone.salePrice, 30, 80);
        } else {
          paymentStatus = PaymentStatus.UNPAID;
          paidAmount = 0;
        }

        const result = await manager.query(
          `
          INSERT INTO "sales" ("phoneId","customerId","salePrice","saleDate","paymentType","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, true, now(), now())
          RETURNING id;
        `,
          [phone.id, customerId, phone.salePrice, saleDate, paymentType, paymentStatus, paidAmount],
        );

        saleIds.push(result[0].id);

        // Update phone status to SOLD
        await manager.query(`UPDATE "phones" SET "status" = 'SOLD' WHERE id = $1`, [phone.id]);
        phone.status = PhoneStatus.SOLD;
      }
      console.log(`  ✓ Created ${saleIds.length} sales`);

      // ========================================================================
      // 9. CREATE PAYMENTS (180 records)
      // ========================================================================
      console.log('\n💳 Creating 180 payment records (customer installments + supplier payments)...');

      let paymentCount = 0;

      // Get sales with PAID or PARTIAL status for customer payments
      const salesQuery = await manager.query(`
        SELECT id, "saleDate", "salePrice", "paidAmount", "paymentStatus", "customerId"
        FROM sales
        WHERE "paymentStatus" IN ('PAID', 'PARTIAL')
        ORDER BY "saleDate"
      `);

      for (const sale of salesQuery) {
        if (sale.paymentStatus === 'PAID') {
          // Create 1 full payment
          const paymentDate = new Date(new Date(sale.saleDate).getTime() + randomInt(0, 2) * 24 * 60 * 60 * 1000);
          const paymentMethod = randomPick([PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER, PaymentMethod.CARD]);

          await manager.query(
            `
            INSERT INTO "payments" ("saleId","purchaseId","amount","paymentDate","paymentMethod","notes","isActive","createdAt","updatedAt")
            VALUES ($1, NULL, $2, $3, $4, 'Full payment received', true, now(), now());
          `,
            [sale.id, sale.salePrice, paymentDate, paymentMethod],
          );
          paymentCount++;

        } else if (sale.paymentStatus === 'PARTIAL') {
          // Create 2-5 installment payments
          const installments = randomInt(2, 5);
          let remainingAmount = sale.paidAmount;
          const firstPaymentDate = new Date(sale.saleDate);

          for (let i = 0; i < installments && remainingAmount > 0; i++) {
            const isLastPayment = i === installments - 1;
            const paymentAmount = isLastPayment ? remainingAmount : Math.floor(remainingAmount / (installments - i) * (0.8 + Math.random() * 0.4));
            const paymentDate = new Date(firstPaymentDate.getTime() + i * 7 * 24 * 60 * 60 * 1000); // Weekly installments
            const paymentMethod = randomPick([PaymentMethod.CASH, PaymentMethod.BANK_TRANSFER, PaymentMethod.CARD, PaymentMethod.MOBILE_PAYMENT]);

            await manager.query(
              `
              INSERT INTO "payments" ("saleId","purchaseId","amount","paymentDate","paymentMethod","notes","isActive","createdAt","updatedAt")
              VALUES ($1, NULL, $2, $3, $4, $5, true, now(), now());
            `,
              [sale.id, paymentAmount, paymentDate, paymentMethod, `Installment ${i + 1}/${installments}`],
            );

            remainingAmount -= paymentAmount;
            paymentCount++;
          }
        }
      }

      // Add supplier payments for PARTIAL purchases
      const purchasesQuery = await manager.query(`
        SELECT id, "purchaseDate", "totalAmount", "paidAmount", "paymentStatus"
        FROM purchases
        WHERE "paymentStatus" IN ('PAID', 'PARTIAL')
        LIMIT 30
      `);

      for (const purchase of purchasesQuery) {
        if (purchase.paymentStatus === 'PARTIAL' && paymentCount < 180) {
          // Create 2-4 supplier payment installments
          const installments = randomInt(2, 4);
          let remainingAmount = purchase.paidAmount;
          const firstPaymentDate = new Date(purchase.purchaseDate);

          for (let i = 0; i < installments && remainingAmount > 0 && paymentCount < 180; i++) {
            const isLastPayment = i === installments - 1;
            const paymentAmount = isLastPayment ? remainingAmount : Math.floor(remainingAmount / (installments - i));
            const paymentDate = new Date(firstPaymentDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
            const paymentMethod = randomPick([PaymentMethod.BANK_TRANSFER, PaymentMethod.BANK_TRANSFER, PaymentMethod.CASH]);

            await manager.query(
              `
              INSERT INTO "payments" ("saleId","purchaseId","amount","paymentDate","paymentMethod","notes","isActive","createdAt","updatedAt")
              VALUES (NULL, $1, $2, $3, $4, $5, true, now(), now());
            `,
              [purchase.id, paymentAmount, paymentDate, paymentMethod, `Supplier payment ${i + 1}/${installments}`],
            );

            remainingAmount -= paymentAmount;
            paymentCount++;
          }
        }
      }

      console.log(`  ✓ Created ${paymentCount} payments`);

      // ========================================================================
      // 10. CREATE WORKER PAYMENTS (20 records - 2 months × 10 workers)
      // ========================================================================
      console.log('\n💼 Creating 20 worker salary payments (2 months)...');

      const months = [
        { month: 12, year: 2025, name: 'December 2025' },
        { month: 1, year: 2026, name: 'January 2026' },
      ];

      let workerPaymentCount = 0;
      for (const period of months) {
        for (let i = 0; i < workerData.length; i++) {
          const worker = workerData[i];
          const workerId = workerIds[i];

          // Random bonus (0-500,000) and deduction (0-200,000)
          const bonus = Math.random() > 0.6 ? randomInt(0, 500000) : 0;
          const deduction = Math.random() > 0.8 ? randomInt(0, 200000) : 0;
          const amount = worker.monthlySalary;
          const totalPaid = amount + bonus - deduction;

          // Payment date: last day of month
          const paymentDate = new Date(period.year, period.month, 0);
          const paymentMethod = PaymentMethod.BANK_TRANSFER;

          await manager.query(
            `
            INSERT INTO "worker_payments" ("workerId","amount","paymentDate","paymentMethod","month","year","bonus","deduction","totalPaid","notes","isActive","createdAt","updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, now(), now());
          `,
            [workerId, amount, paymentDate, paymentMethod, period.month, period.year, bonus, deduction, totalPaid, `Salary for ${period.name}`],
          );

          workerPaymentCount++;
        }
      }
      console.log(`  ✓ Created ${workerPaymentCount} worker payments`);

      // ========================================================================
      // FINAL STATISTICS
      // ========================================================================
      console.log('\n📊 Database seeding completed! Statistics:');
      console.log(`  👤 Users: ${userIds.length}`);
      console.log(`  👷 Workers: ${workerIds.length}`);
      console.log(`  👥 Customers: ${customerIds.length}`);
      console.log(`  🏢 Suppliers: ${supplierIds.length}`);
      console.log(`  📦 Purchases: ${purchaseIds.length}`);
      console.log(`  📱 Phones: ${phoneIds.length}`);
      console.log(`  🔧 Repairs: ${repairCount}`);
      console.log(`  💰 Sales: ${saleIds.length}`);
      console.log(`  💳 Payments: ${paymentCount}`);
      console.log(`  💼 Worker Payments: ${workerPaymentCount}`);

      // Calculate final statistics
      const stats = await manager.query(`
        SELECT
          (SELECT COUNT(*) FROM phones WHERE status = 'IN_STOCK') as in_stock,
          (SELECT COUNT(*) FROM phones WHERE status = 'IN_REPAIR') as in_repair,
          (SELECT COUNT(*) FROM phones WHERE status = 'READY_FOR_SALE') as ready_for_sale,
          (SELECT COUNT(*) FROM phones WHERE status = 'SOLD') as sold,
          (SELECT COUNT(*) FROM sales WHERE "paymentStatus" = 'PAID') as paid_sales,
          (SELECT COUNT(*) FROM sales WHERE "paymentStatus" = 'PARTIAL') as partial_sales,
          (SELECT COUNT(*) FROM sales WHERE "paymentStatus" = 'UNPAID') as unpaid_sales
      `);

      console.log('\n📈 Phone Status Distribution:');
      console.log(`  IN_STOCK: ${stats[0].in_stock}`);
      console.log(`  IN_REPAIR: ${stats[0].in_repair}`);
      console.log(`  READY_FOR_SALE: ${stats[0].ready_for_sale}`);
      console.log(`  SOLD: ${stats[0].sold}`);

      console.log('\n💵 Sales Payment Distribution:');
      console.log(`  PAID: ${stats[0].paid_sales} (${Math.round(stats[0].paid_sales / saleIds.length * 100)}%)`);
      console.log(`  PARTIAL: ${stats[0].partial_sales} (${Math.round(stats[0].partial_sales / saleIds.length * 100)}%)`);
      console.log(`  UNPAID: ${stats[0].unpaid_sales} (${Math.round(stats[0].unpaid_sales / saleIds.length * 100)}%)`);
    });

    console.log('\n✅ Enhanced seed completed successfully!\n');
    console.log('🔐 Test Credentials:');
    console.log('  Owner:       username: owner        password: owner123');
    console.log('  Manager:     username: manager1     password: manager123');
    console.log('  Cashier:     username: cashier1     password: cashier123');
    console.log('  Technician:  username: technician1  password: tech123\n');
    console.log('💱 Currency: All prices in Uzbek sum (UZS)');
    console.log('📅 Date Range: December 14, 2025 - February 14, 2026\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
