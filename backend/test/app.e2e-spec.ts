import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from './../src/app.module';

type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

type ClientResult = {
  id: number;
  name: string;
};

type PaginationRes = {
  results: ClientResult[];
  page: number;
};

function extractAuthTokens(body: unknown): AuthTokens {
  return (body as { auth: AuthTokens }).auth;
}

function extractClient(body: unknown): ClientResult {
  return body as ClientResult;
}

function extractPagination(body: unknown): PaginationRes {
  return body as PaginationRes;
}

describe('API scenarios (e2e)', () => {
  let app: INestApplication;
  let server: request.SuperTest<request.Test>;
  let accessToken = '';
  let refreshToken = '';
  let createdClientId: number | null = null;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    const httpServer = app.getHttpServer() as Server;
    server = request(httpServer) as unknown as request.SuperTest<request.Test>;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth scenarios', () => {
    it('should log in successfully', async () => {
      const res = await server
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201);
      const tokens = extractAuthTokens(res.body);
      expect(tokens).toBeDefined();
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token;
    });

    it('should reject invalid credentials', async () => {
      await server
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' })
        .expect(401);
    });

    it('should refresh tokens', async () => {
      const res = await server
        .post('/api/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);
      const tokens = extractAuthTokens(res.body);
      expect(tokens.access_token).toBeDefined();
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token;
    });

    it('should invalidate tokens after logout', async () => {
      const previousRefresh = refreshToken;
      await server
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      await server
        .post('/api/auth/refresh')
        .send({ refresh_token: previousRefresh })
        .expect(401);

      const res = await server
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(201);
      const tokens = extractAuthTokens(res.body);
      accessToken = tokens.access_token;
      refreshToken = tokens.refresh_token;
    });
  });

  describe('Client module scenarios', () => {
    it('should forbid access without token', () => {
      return server.get('/api/client').expect(401);
    });

    it('should create a client', async () => {
      const phone = `+99890000${Date.now().toString().slice(-4)}`;
      const res = await server
        .post('/api/client')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Scenario Ltd', phone })
        .expect(201);
      const created = extractClient(res.body);
      expect(created.id).toBeDefined();
      expect(created.name).toBe('Scenario Ltd');
      createdClientId = created.id;
    });

    it('should reject duplicate phone numbers', () => {
      return server
        .post('/api/client')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Scenario Again', phone: '+998900000000' })
        .expect(400);
    });

    it('should list clients with pagination', async () => {
      const res = await server
        .get('/api/client')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, take: 5 })
        .expect(200);
      const payload = extractPagination(res.body);
      expect(Array.isArray(payload.results)).toBe(true);
      expect(payload.page).toBe(1);
    });

    it('should update a client', async () => {
      expect(createdClientId).not.toBeNull();
      await server
        .patch(`/api/client/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Scenario Updated' })
        .expect(200);
    });

    it('should delete a client (soft)', async () => {
      expect(createdClientId).not.toBeNull();
      await server
        .delete(`/api/client/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 404 for deleted clients', () => {
      expect(createdClientId).not.toBeNull();
      return server
        .get(`/api/client/${createdClientId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404)
        .then((res) => {
          expect(res.body).toMatchObject({
            statusCode: 404,
            error: 'Not Found',
          });
          const message = (res.body as { message: string }).message;
          expect(typeof message).toBe('string');
        });
    });
  });
});
