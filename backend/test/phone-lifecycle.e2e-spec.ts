import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Phone Lifecycle E2E', () => {
  let app: INestApplication;
  let authToken: string;
  let supplierId: number;
  let phoneId: number;
  let purchaseId: number;
  let repairId: number;
  let saleId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Login as owner
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        username: 'owner',
        password: 'owner123',
      });

    authToken = loginResponse.body.auth.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Flow: Purchase → Repair → Sale', () => {
    it('Step 1: Create supplier', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          companyName: 'Test Supplier E2E',
          phoneNumber: '+998901111111',
        })
        .expect(201);

      supplierId = response.body.id;
      expect(supplierId).toBeDefined();
    });

    it('Step 2: Create purchase (phone gets created automatically)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          supplierId,
          purchaseDate: '2026-02-13',
          paymentStatus: 'PAID',
          paidAmount: 800,
          phones: [
            {
              brand: 'Samsung',
              model: 'Galaxy S24',
              imei: 'E2E123456789012',
              color: 'Black',
              condition: 'NEW',
              purchasePrice: 800,
              notes: 'E2E Test Phone',
            },
          ],
        })
        .expect(201);

      purchaseId = response.body.id;
      phoneId = response.body.phones[0].id;

      expect(purchaseId).toBeDefined();
      expect(phoneId).toBeDefined();
      expect(response.body.phones[0].status).toBe('IN_STOCK');
    });

    it('Step 3: Get phone details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/phones/${phoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(phoneId);
      expect(response.body.status).toBe('IN_STOCK');
      expect(response.body.purchase.id).toBe(purchaseId);
    });

    it('Step 4: Create repair job', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/repairs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phoneId,
          description: 'Screen replacement - E2E Test',
          repairCost: 150,
          status: 'IN_PROGRESS',
        })
        .expect(201);

      repairId = response.body.id;
      expect(repairId).toBeDefined();
      expect(response.body.phone.status).toBe('IN_REPAIR');
    });

    it('Step 5: Complete repair', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/repairs/${repairId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
          notes: 'Repair completed successfully',
        })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
      expect(response.body.phone.status).toBe('READY_FOR_SALE');
      expect(Number(response.body.phone.totalCost)).toBe(950); // 800 + 150
    });

    it('Step 6: Verify phone is ready for sale', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/phones/available')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const testPhone = response.body.find((p) => p.id === phoneId);
      expect(testPhone).toBeDefined();
      expect(testPhone.status).toBe('READY_FOR_SALE');
    });

    it('Step 7: Create sale', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phoneId,
          salePrice: 1200,
          saleDate: '2026-02-13',
          paymentType: 'CASH',
          paidAmount: 1200,
        })
        .expect(201);

      saleId = response.body.id;
      expect(saleId).toBeDefined();
      expect(response.body.paymentStatus).toBe('PAID');
      expect(Number(response.body.profit)).toBe(250); // 1200 - 950
      expect(response.body.phone.status).toBe('SOLD');
    });

    it('Step 8: Verify phone history', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/phones/${phoneId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.purchase).toBeDefined();
      expect(response.body.repairs).toHaveLength(1);
      expect(response.body.sale).toBeDefined();
      expect(Number(response.body.totalCost)).toBe(950);
      expect(Number(response.body.sale.profit)).toBe(250);
    });

    it('Step 9: Verify phone cannot be sold again', async () => {
      await request(app.getHttpServer())
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phoneId,
          salePrice: 1000,
          saleDate: '2026-02-13',
          paymentType: 'CASH',
          paidAmount: 1000,
        })
        .expect(400);
    });

    it('Step 10: Verify sales report includes this sale', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/reports/sales?startDate=2026-02-13&endDate=2026-02-13')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.totalSales).toBeGreaterThan(0);
      expect(response.body.totalRevenue).toBeGreaterThan(0);
    });
  });

  describe('Error Cases', () => {
    it('should not allow repair on sold phone', async () => {
      await request(app.getHttpServer())
        .post('/api/repairs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          phoneId,
          description: 'Should fail',
          repairCost: 100,
        })
        .expect(400);
    });

    it('should not allow deletion of phone with sale', async () => {
      await request(app.getHttpServer())
        .delete(`/api/phones/${phoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
