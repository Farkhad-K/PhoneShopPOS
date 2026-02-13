// src/seed/phone-shop-seed.ts
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Role, PhoneStatus, PhoneCondition, PaymentStatus, PaymentType, RepairStatus } from 'src/common/enums/enum';
import { generatePhoneBarcode } from 'src/common/utils/barcode-generator.util';

async function run() {
  console.log('🌱 Starting Phone Shop POS database seed...\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const ds = app.get<DataSource>(DataSource);

  try {
    await ds.transaction(async (manager) => {
      console.log('👤 Creating users with different roles...');

      // Define users for phone shop
      const userSeeds: { username: string; password: string; role: Role }[] = [
        { username: 'owner', password: 'owner123', role: Role.OWNER },
        { username: 'manager1', password: 'manager123', role: Role.MANAGER },
        { username: 'manager2', password: 'manager123', role: Role.MANAGER },
        { username: 'cashier1', password: 'cashier123', role: Role.CASHIER },
        { username: 'cashier2', password: 'cashier123', role: Role.CASHIER },
        { username: 'technician1', password: 'tech123', role: Role.TECHNICIAN },
        { username: 'technician2', password: 'tech123', role: Role.TECHNICIAN },
      ];

      // Insert users
      for (const user of userSeeds) {
        const hash = await bcrypt.hash(user.password, 10);
        await manager.query(
          `
          INSERT INTO "user" ("username","password","role","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, true, now(), now())
          ON CONFLICT ("username") DO UPDATE
            SET "password" = EXCLUDED."password",
                "role" = EXCLUDED."role",
                "isActive" = true,
                "updatedAt" = now();
        `,
          [user.username, hash, user.role],
        );
        console.log(`  ✓ Created user: ${user.username} (${user.role})`);
      }

      console.log('\n👥 Creating sample customers...');

      // Insert John Doe (for PAY_LATER sale)
      const johnDoeResult = await manager.query(
        `
        INSERT INTO "customers" ("fullName","phoneNumber","address","passportId","notes","isActive","createdAt","updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, now(), now())
        ON CONFLICT ("phoneNumber") DO UPDATE
          SET "fullName" = EXCLUDED."fullName",
              "address" = EXCLUDED."address",
              "passportId" = EXCLUDED."passportId",
              "notes" = EXCLUDED."notes",
              "isActive" = true,
              "updatedAt" = now()
        RETURNING id;
      `,
        ['John Doe', '+998901234567', 'Tashkent, Chilanzar 9', 'AA1234567', 'Regular customer, prefers iPhone models'],
      );
      const johnDoeId = johnDoeResult[0].id;
      console.log(`  ✓ Created customer: John Doe (ID: ${johnDoeId})`);

      // Insert Ali Karimov (for UNPAID sale)
      const aliKarimovResult = await manager.query(
        `
        INSERT INTO "customers" ("fullName","phoneNumber","address","passportId","notes","isActive","createdAt","updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, now(), now())
        ON CONFLICT ("phoneNumber") DO UPDATE
          SET "fullName" = EXCLUDED."fullName",
              "address" = EXCLUDED."address",
              "passportId" = EXCLUDED."passportId",
              "notes" = EXCLUDED."notes",
              "isActive" = true,
              "updatedAt" = now()
        RETURNING id;
      `,
        ['Ali Karimov', '+998901234569', 'Samarkand, Center', 'AC3456789', 'Frequent repairs'],
      );
      const aliKarimovId = aliKarimovResult[0].id;
      console.log(`  ✓ Created customer: Ali Karimov (ID: ${aliKarimovId})`);

      // Insert Sara Mahmudova (for CASH sale)
      const saraMahmudovaResult = await manager.query(
        `
        INSERT INTO "customers" ("fullName","phoneNumber","address","passportId","notes","isActive","createdAt","updatedAt")
        VALUES ($1, $2, $3, $4, $5, true, now(), now())
        ON CONFLICT ("phoneNumber") DO UPDATE
          SET "fullName" = EXCLUDED."fullName",
              "address" = EXCLUDED."address",
              "passportId" = EXCLUDED."passportId",
              "notes" = EXCLUDED."notes",
              "isActive" = true,
              "updatedAt" = now()
        RETURNING id;
      `,
        ['Sara Mahmudova', '+998901234570', 'Bukhara, Old City', null, 'Cash only'],
      );
      const saraMahmudovaId = saraMahmudovaResult[0].id;
      console.log(`  ✓ Created customer: Sara Mahmudova (ID: ${saraMahmudovaId})`);

      // Insert other customers
      await manager.query(
        `
        INSERT INTO "customers" ("fullName","phoneNumber","address","passportId","notes","isActive","createdAt","updatedAt")
        VALUES
          ('Jane Smith', '+998901234568', 'Tashkent, Yunusabad 5', 'AB2345678', 'Wholesale buyer', true, now(), now()),
          ('Rustam Usmanov', '+998901234571', 'Tashkent, Sergeli', 'AD4567890', NULL, true, now(), now())
        ON CONFLICT ("phoneNumber") DO NOTHING;
      `
      );
      console.log(`  ✓ Created other customers`);

      console.log('\n🏢 Creating sample suppliers...');

      // Insert Global Phones Trading (for iPhones)
      const globalPhonesResult = await manager.query(
        `
        INSERT INTO "suppliers" ("companyName","contactPerson","phoneNumber","email","address","notes","isActive","createdAt","updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, true, now(), now())
        ON CONFLICT ("phoneNumber") DO UPDATE
          SET "companyName" = EXCLUDED."companyName",
              "contactPerson" = EXCLUDED."contactPerson",
              "email" = EXCLUDED."email",
              "address" = EXCLUDED."address",
              "notes" = EXCLUDED."notes",
              "isActive" = true,
              "updatedAt" = now()
        RETURNING id;
      `,
        ['Global Phones Trading', 'Olim Karimov', '+998901111112', 'contact@globalphones.uz', 'Tashkent, Chilanzar, Business Center', 'Specializes in iPhone and Apple accessories'],
      );
      const globalPhonesId = globalPhonesResult[0].id;
      console.log(`  ✓ Created supplier: Global Phones Trading (ID: ${globalPhonesId})`);

      // Insert TechnoMart (for Samsung phones)
      const technoMartResult = await manager.query(
        `
        INSERT INTO "suppliers" ("companyName","contactPerson","phoneNumber","email","address","notes","isActive","createdAt","updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, true, now(), now())
        ON CONFLICT ("phoneNumber") DO UPDATE
          SET "companyName" = EXCLUDED."companyName",
              "contactPerson" = EXCLUDED."contactPerson",
              "email" = EXCLUDED."email",
              "address" = EXCLUDED."address",
              "notes" = EXCLUDED."notes",
              "isActive" = true,
              "updatedAt" = now()
        RETURNING id;
      `,
        ['TechnoMart LLC', 'Akbar Aliyev', '+998901111111', 'sales@technomart.uz', 'Tashkent, Sergeli district, Warehouse 12', 'Wholesale supplier, offers bulk discounts on Samsung devices'],
      );
      const technoMartId = technoMartResult[0].id;
      console.log(`  ✓ Created supplier: TechnoMart LLC (ID: ${technoMartId})`);

      // Insert other suppliers
      await manager.query(
        `
        INSERT INTO "suppliers" ("companyName","contactPerson","phoneNumber","email","address","notes","isActive","createdAt","updatedAt")
        VALUES
          ('Mobile Parts Wholesale', 'Zafar Usmonov', '+998901111113', 'parts@mobileparts.uz', 'Samarkand, Industrial Zone', 'Best prices for spare parts and repair components', true, now(), now()),
          ('China Direct Import', NULL, '+998901111114', NULL, 'Tashkent, Yunusabad', 'Direct importer from China, competitive prices', true, now(), now())
        ON CONFLICT ("phoneNumber") DO NOTHING;
      `
      );
      console.log(`  ✓ Created other suppliers`)

      console.log('\n📦 Creating sample purchases and phones...');

      // Purchase 1: From Global Phones Trading (3 iPhones)
      const purchase1Result = await manager.query(
        `
        INSERT INTO "purchases" ("supplierId","purchaseDate","totalAmount","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, now() - interval '5 days', 2550, 'PAID', 2550, 'Bulk iPhone purchase', true, now(), now())
        RETURNING id;
      `,
        [globalPhonesId]
      );
      const purchase1Id = purchase1Result[0].id;
      console.log(`  ✓ Created Purchase #${purchase1Id}: 3 iPhones from Global Phones Trading`);

      // Create phones for purchase 1
      const phones1 = [
        { brand: 'Apple', model: 'iPhone 15 Pro', imei: '123456789012345', color: 'Natural Titanium', condition: 'NEW', price: 850, status: 'IN_STOCK' },
        { brand: 'Apple', model: 'iPhone 15', imei: '123456789012346', color: 'Blue', condition: 'NEW', price: 750, status: 'IN_STOCK' },
        { brand: 'Apple', model: 'iPhone 14 Pro Max', imei: '123456789012347', color: 'Deep Purple', condition: 'LIKE_NEW', price: 950, status: 'IN_STOCK' },
      ];

      const phoneIds: number[] = [];
      for (const phone of phones1) {
        const barcode = generatePhoneBarcode();
        const result = await manager.query(
          `
          INSERT INTO "phones" ("brand","model","imei","color","condition","purchasePrice","status","barcode","totalCost","purchaseId","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $6, $9, true, now(), now())
          RETURNING id;
        `,
          [phone.brand, phone.model, phone.imei, phone.color, phone.condition, phone.price, phone.status, barcode, purchase1Id]
        );
        phoneIds.push(result[0].id);
        console.log(`    ✓ Added ${phone.brand} ${phone.model} (${barcode})`);
      }

      // Purchase 2: From TechnoMart (4 Samsung phones)
      const purchase2Result = await manager.query(
        `
        INSERT INTO "purchases" ("supplierId","purchaseDate","totalAmount","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, now() - interval '4 days', 2800, 'PARTIAL', 2000, 'Samsung bulk order', true, now(), now())
        RETURNING id;
      `,
        [technoMartId]
      );
      const purchase2Id = purchase2Result[0].id;
      console.log(`  ✓ Created Purchase #${purchase2Id}: 4 Samsung phones from TechnoMart (Partial payment)`);

      const phones2 = [
        { brand: 'Samsung', model: 'Galaxy S24 Ultra', imei: '987654321098765', color: 'Titanium Black', condition: 'NEW', price: 1000, status: 'IN_STOCK' },
        { brand: 'Samsung', model: 'Galaxy S23', imei: '987654321098766', color: 'Cream', condition: 'NEW', price: 650, status: 'IN_STOCK' },
        { brand: 'Samsung', model: 'Galaxy S23', imei: '987654321098767', color: 'Phantom Black', condition: 'GOOD', price: 600, status: 'IN_STOCK' },
        { brand: 'Samsung', model: 'Galaxy Z Fold 5', imei: '987654321098768', color: 'Icy Blue', condition: 'LIKE_NEW', price: 550, status: 'IN_REPAIR' },
      ];

      for (const phone of phones2) {
        const barcode = generatePhoneBarcode();
        const result = await manager.query(
          `
          INSERT INTO "phones" ("brand","model","imei","color","condition","purchasePrice","status","barcode","totalCost","purchaseId","isActive","createdAt","updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $6, $9, true, now(), now())
          RETURNING id;
        `,
          [phone.brand, phone.model, phone.imei, phone.color, phone.condition, phone.price, phone.status, barcode, purchase2Id]
        );
        phoneIds.push(result[0].id);
        console.log(`    ✓ Added ${phone.brand} ${phone.model} (${barcode})`);
      }

      console.log('\n🔧 Creating sample repairs...');

      // Repair 1: For iPhone 14 Pro Max (completed)
      const repair1Result = await manager.query(
        `
        INSERT INTO "repairs" ("phoneId","description","repairCost","status","startDate","completionDate","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 'Replace cracked screen', 150, 'COMPLETED', now() - interval '3 days', now() - interval '2 days', 'Screen replaced successfully', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[2]]
      );
      console.log(`  ✓ Repair #${repair1Result[0].id}: Screen replacement for iPhone 14 Pro Max (COMPLETED)`);

      // Update phone totalCost and status after repair completion
      await manager.query(
        `UPDATE "phones" SET "totalCost" = "totalCost" + 150, "status" = 'READY_FOR_SALE' WHERE id = $1`,
        [phoneIds[2]]
      );

      // Repair 2: For Galaxy Z Fold (in progress)
      const repair2Result = await manager.query(
        `
        INSERT INTO "repairs" ("phoneId","description","repairCost","status","startDate","completionDate","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 'Fix hinge and replace inner display', 280, 'IN_PROGRESS', now() - interval '2 days', NULL, 'Waiting for display part', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[6]]
      );
      console.log(`  ✓ Repair #${repair2Result[0].id}: Hinge repair for Galaxy Z Fold 5 (IN_PROGRESS)`);

      // Repair 3: For Galaxy S23 (completed)
      const repair3Result = await manager.query(
        `
        INSERT INTO "repairs" ("phoneId","description","repairCost","status","startDate","completionDate","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 'Battery replacement', 80, 'COMPLETED', now() - interval '1 day', now(), 'New battery installed', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[5]]
      );
      console.log(`  ✓ Repair #${repair3Result[0].id}: Battery replacement for Galaxy S23 (COMPLETED)`);

      // Update phone totalCost and status after repair completion
      await manager.query(
        `UPDATE "phones" SET "totalCost" = "totalCost" + 80, "status" = 'READY_FOR_SALE' WHERE id = $1`,
        [phoneIds[5]]
      );

      console.log('\n💰 Creating sample sales...');

      // Sale 1: iPhone 15 Pro - CASH sale
      const sale1Result = await manager.query(
        `
        INSERT INTO "sales" ("phoneId","customerId","salePrice","saleDate","paymentType","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, NULL, 1100, now() - interval '1 day', 'CASH', 'PAID', 1100, 'Cash sale, customer very happy', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[0]]
      );
      console.log(`  ✓ Sale #${sale1Result[0].id}: iPhone 15 Pro sold for $1100 (CASH) - Profit: $250`);

      // Update phone status to SOLD
      await manager.query(`UPDATE "phones" SET "status" = 'SOLD' WHERE id = $1`, [phoneIds[0]]);

      // Sale 2: iPhone 14 Pro Max (repaired) - PAY_LATER with partial payment
      const sale2Result = await manager.query(
        `
        INSERT INTO "sales" ("phoneId","customerId","salePrice","saleDate","paymentType","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 1, 1350, now() - interval '12 hours', 'PAY_LATER', 'PARTIAL', 800, 'Regular customer, good payment history', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[2]]
      );
      console.log(`  ✓ Sale #${sale2Result[0].id}: iPhone 14 Pro Max sold to John Doe for $1350 (PAY_LATER, paid $800) - Profit: $250, Remaining: $550`);

      // Update phone status to SOLD
      await manager.query(`UPDATE "phones" SET "status" = 'SOLD' WHERE id = $1`, [phoneIds[2]]);

      // Sale 3: Galaxy S23 (repaired) - CASH sale
      const sale3Result = await manager.query(
        `
        INSERT INTO "sales" ("phoneId","customerId","salePrice","saleDate","paymentType","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 4, 900, now(), 'CASH', 'PAID', 900, 'Cash only customer', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[5]]
      );
      console.log(`  ✓ Sale #${sale3Result[0].id}: Galaxy S23 sold to Sara Mahmudova for $900 (CASH) - Profit: $220`);

      // Update phone status to SOLD
      await manager.query(`UPDATE "phones" SET "status" = 'SOLD' WHERE id = $1`, [phoneIds[5]]);

      // Sale 4: Galaxy S24 Ultra - PAY_LATER with no payment yet
      const sale4Result = await manager.query(
        `
        INSERT INTO "sales" ("phoneId","customerId","salePrice","saleDate","paymentType","paymentStatus","paidAmount","notes","isActive","createdAt","updatedAt")
        VALUES ($1, 3, 1350, now(), 'PAY_LATER', 'UNPAID', 0, 'Customer will pay next week', true, now(), now())
        RETURNING id;
      `,
        [phoneIds[3]]
      );
      console.log(`  ✓ Sale #${sale4Result[0].id}: Galaxy S24 Ultra sold to Ali Karimov for $1350 (PAY_LATER, UNPAID) - Expected profit: $350`);

      // Update phone status to SOLD
      await manager.query(`UPDATE "phones" SET "status" = 'SOLD' WHERE id = $1`, [phoneIds[3]]);
    });

    console.log('\n✅ Seed completed successfully!\n');
    console.log('📝 Test Credentials:');
    console.log('  Owner:      username: owner       password: owner123');
    console.log('  Manager:    username: manager1    password: manager123');
    console.log('  Cashier:    username: cashier1    password: cashier123');
    console.log('  Technician: username: technician1 password: tech123\n');

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
