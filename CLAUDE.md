# Phone Shop POS System - Development Guide

## Project Overview

A comprehensive POS system for phone shops that manages:
- Phone inventory (purchase, repair, sale lifecycle)
- Customer debt/credit tracking (pay-later transactions)
- Profit and cost analysis
- Worker payment management

**Tech Stack:**
- Backend: NestJS 11, TypeORM, PostgreSQL 16
- Frontend: React 19, Vite 7, TailwindCSS 4, ShadcnUI
- Infrastructure: Docker, GitHub Actions

---

## Development Commands

### Backend (`/backend`)
```bash
# Development
npm run start:dev          # Start with hot-reload (nodemon)
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run db:wipe            # Clear all data
npm run db:seed            # Seed test data
npm run db:reseed          # Wipe + seed
npm run migration:generate -- src/migrations/MigrationName  # Generate migration
npm run migration:run      # Run pending migrations
npm run migration:revert   # Revert last migration

# Testing
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests

# Code Quality
npm run lint               # ESLint check
npm run lint:fix           # Auto-fix issues
```

### Frontend (`/frontend`)
```bash
# Development
npm run dev                # Start Vite dev server
npm run build              # Production build
npm run preview            # Preview production build

# Code Quality
npm run typecheck          # TypeScript check
npm run lint               # ESLint check
```

### Docker
```bash
docker compose up          # Start all services
docker compose down        # Stop all services
docker compose build       # Rebuild images
./deploy.sh                # Deploy (production)
```

---

## Code Style Guidelines

### Backend (NestJS)

**1. Module Organization**
- Use facade pattern with specialized sub-services
- Example: `PhoneService` delegates to `PhoneCreateService`, `PhoneFindService`, etc.
- Each feature gets its own module: `PhonesModule`, `PurchasesModule`, `SalesModule`

**2. File Naming**
- kebab-case for files: `phone.service.ts`, `purchase.controller.ts`
- PascalCase for classes: `PhoneService`, `PurchaseController`
- DTOs suffix: `CreatePhoneDto`, `UpdatePhoneDto`
- Entities suffix: `Phone`, `Purchase` (extend base entities)

**3. Entity Design**
- Extend `Extender` base class (provides id, createdAt, updatedAt, deletedAt, isActive)
- Use `PaymentExtender` for entities with amount field
- Always use TypeORM decorators: `@Entity()`, `@Column()`, `@ManyToOne()`, etc.
- Enable soft delete with `@DeleteDateColumn()`

**4. Migrations**
- NEVER use `synchronize: true` in production
- Generate migrations for all schema changes
- Name format: `YYYYMMDDHHMMSS-DescriptiveName.ts`
- Always test migration up AND down (revert)

**5. DTOs & Validation**
- Use class-validator decorators: `@IsString()`, `@IsNumber()`, `@IsEnum()`
- Use class-transformer: `@Type()`, `@Transform()`
- Swagger documentation: `@ApiProperty()` with examples
- Separate DTOs for create, update, and response

**6. Services**
- Use dependency injection for all dependencies
- Services should be testable (inject repositories, not hardcode)
- Business logic in services, NOT controllers
- Use TypeORM QueryBuilder for complex queries

**7. Controllers**
- Thin controllers: delegate to services
- Use proper HTTP methods: GET, POST, PATCH, DELETE
- Use guards for authorization: `@UseGuards(JwtRoleGuard)`
- Use decorators for params: `@Body()`, `@Param()`, `@Query()`, `@CurrentUser()`

**8. Error Handling**
- Throw HttpException with proper status codes
- Use built-in exceptions: `NotFoundException`, `BadRequestException`, etc.
- Global exception filter handles formatting

**9. Testing**
- Write tests BEFORE moving to next feature
- Unit tests for services (mock repositories)
- E2E tests for critical flows (purchase → repair → sale)
- Aim for >80% coverage on business logic

### Frontend (React)

**1. Component Organization**
```
src/
├── api/              # RTK Query endpoints (one file per entity)
├── app/              # Page components (feature-based folders)
├── components/       # Reusable UI components
│   ├── ui/           # ShadcnUI base components
│   ├── features/     # Feature-specific components (PhoneCard, PurchaseForm)
│   └── layouts/      # Layout wrappers
├── hooks/            # Custom hooks (usePhone, usePurchase)
├── store/            # Redux slices (one per entity)
├── interfaces/       # TypeScript types (match backend DTOs)
└── utils/            # Helper functions
```

**2. Component Style**
- Use functional components only
- Use hooks (useState, useEffect, useCallback, useMemo)
- One component per file
- Export as default for pages, named exports for components

**3. State Management**
- Redux Toolkit for global state (auth, entities)
- RTK Query for server state (auto-caching, invalidation)
- Local state (useState) for UI-only state
- Redux Persist for auth state only

**4. API Integration**
- Use RTK Query for ALL API calls
- Define endpoints in `src/api/{entity}/index.ts`
- Tag-based cache invalidation
- Auto-retry with token refresh on 401

**5. Forms**
- React Hook Form for form state
- Zod for validation schemas
- ShadcnUI Form components for consistent styling
- Extract complex forms into separate components

**6. Styling**
- TailwindCSS utility classes (no custom CSS unless necessary)
- Use `cn()` helper from `@/lib/utils` for conditional classes
- Follow ShadcnUI component patterns
- Responsive: mobile-first approach

**7. Routing**
- React Router 7 with lazy loading
- Protected routes via `ProtectedRoute` wrapper
- Role-based route restrictions
- 404 catch-all route

**8. TypeScript**
- Strict mode enabled
- Define interfaces matching backend DTOs
- Use generics for reusable components
- No `any` types unless absolutely necessary

**9. Performance**
- Lazy load pages (React.lazy)
- Memoize expensive computations (useMemo)
- Memoize callbacks (useCallback)
- Use React.memo for pure components
- Optimize re-renders with proper dependencies

---

## Project-Specific Patterns

### 1. Role-Based Access Control

**Roles:** OWNER → MANAGER → CASHIER → TECHNICIAN

**Backend Guard Logic:**
```typescript
// In JwtRoleGuard
const roleHierarchy = {
  OWNER: 4,
  MANAGER: 3,
  CASHIER: 2,
  TECHNICIAN: 1
};

// Check if user role >= required role
if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
  throw new ForbiddenException();
}
```

**Frontend Route Protection:**
```typescript
<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>
  <ReportsPage />
</ProtectedRoute>
```

### 2. Phone Lifecycle Status

```typescript
enum PhoneStatus {
  IN_STOCK = 'IN_STOCK',           // Ready to sell (no repair needed)
  IN_REPAIR = 'IN_REPAIR',         // Currently being repaired
  READY_FOR_SALE = 'READY_FOR_SALE', // Repaired, ready to sell
  SOLD = 'SOLD',                   // Sold to customer
  RETURNED = 'RETURNED'            // Returned by customer (optional)
}
```

### 3. Financial Calculations

**Total Cost Formula:**
```typescript
totalCost = purchasePrice + sumOfRepairCosts
```

**Profit Formula:**
```typescript
profit = salePrice - totalCost
```

**Customer Balance:**
- Debt: Customer owes shop (unpaid/partial sales)
- Credit: Shop owes customer (unpaid/partial purchases)
- Show both separately, do NOT auto-net

### 4. Payment Application (FIFO)

When customer makes payment:
1. Fetch all unpaid/partially paid transactions (oldest first)
2. Apply payment to oldest transaction
3. If payment exceeds transaction balance, apply remainder to next transaction
4. Update balances and mark fully paid transactions

### 5. Audit Trail

All financial records include:
- `createdBy` (user who created)
- `updatedBy` (user who last updated)
- `deletedBy` (user who soft-deleted)
- Timestamps for all actions

Use `AuditSubscriber` (already configured) to auto-populate these fields.

### 6. Barcode Generation

For each phone:
- Generate unique barcode on purchase (format: `PH{timestamp}{random}`)
- Store barcode in `Phone.barcode` field
- Frontend: Use `react-barcode` or similar library to display/print
- Print labels for physical phone inventory

---

## Data Integrity Rules

1. **Cannot sell already sold phone:** Check `phone.status !== 'SOLD'` before creating sale
2. **Cannot delete financial records:** Use soft delete (`deletedAt`) with void reason
3. **Payment cannot exceed remaining balance:** Validate in service before applying
4. **Customer required for pay-later:** Enforce in DTO validation
5. **IMEI uniqueness:** Add unique constraint on IMEI (allow null for phones without IMEI)
6. **One payment per worker per month:** Unique constraint on (workerId, month, year)
7. **Cannot repair sold phone:** Validate phone status before creating repair
8. **Payment amount validation:** paidAmount cannot exceed transaction total

---

## Implementation Learnings & Best Practices

### 1. TypeORM Migration Workarounds

**Problem:** TypeORM migration CLI has issues with ts-node path resolution when using `src/` path aliases.

**Solution:**
- Create direct SQL migration files when TypeORM CLI fails
- Execute migrations using DataSource directly:

```typescript
// run-worker-migration.ts
import { AppDataSource } from './typeorm.config';
import * as fs from 'fs';

async function runMigration() {
  await AppDataSource.initialize();
  const sql = fs.readFileSync('create-worker-tables.sql', 'utf8');
  await AppDataSource.query(sql);
  await AppDataSource.destroy();
}
```

**When to use:**
- Complex migrations with custom SQL
- When migration:generate fails due to path resolution
- For database-specific features not supported by TypeORM decorators

### 2. Testing with TypeORM Repositories

**Unit Test Pattern for Services:**

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: Repository<Entity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        {
          provide: getRepositoryToken(Entity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
    repository = module.get(getRepositoryToken(Entity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should test something', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(mockEntity);
    const result = await service.method();
    expect(result).toBeDefined();
  });
});
```

**QueryBuilder Mocking Pattern:**

```typescript
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockEntity], 1]),
  getOne: jest.fn().mockResolvedValue(mockEntity),
};

jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
```

**Jest Configuration for Path Aliases:**

```json
// package.json
{
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/$1"
    }
  }
}

// test/jest-e2e.json
{
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

### 3. Worker Payment Management Pattern

**Unique Constraint Implementation:**

```typescript
// SQL Migration
CREATE UNIQUE INDEX idx_worker_payment_month
ON worker_payments(worker_id, month, year)
WHERE deleted_at IS NULL;
```

**Service Validation:**

```typescript
async create(dto: CreateWorkerPaymentDto): Promise<WorkerPayment> {
  // Check for duplicate payment
  const existing = await this.repository.findOne({
    where: {
      workerId: dto.workerId,
      month: dto.month,
      year: dto.year,
    },
  });

  if (existing) {
    throw new BadRequestException(
      `Payment for ${dto.month}/${dto.year} already exists`
    );
  }

  // Auto-calculate total
  const totalPaid = dto.amount + (dto.bonus || 0) - (dto.deduction || 0);

  const payment = this.repository.create({
    ...dto,
    totalPaid,
  });

  return this.repository.save(payment);
}
```

### 4. Payment FIFO Algorithm Implementation

**Core Concept:** Apply payments to oldest transactions first

```typescript
async applyPayment(customerId: number, amount: number): Promise<void> {
  // 1. Get unpaid/partial transactions, oldest first
  const transactions = await this.getUnpaidTransactions(customerId);

  let remainingAmount = amount;

  for (const transaction of transactions) {
    if (remainingAmount <= 0) break;

    const amountToApply = Math.min(
      remainingAmount,
      transaction.remainingAmount
    );

    transaction.paidAmount += amountToApply;
    transaction.remainingAmount -= amountToApply;

    if (transaction.remainingAmount === 0) {
      transaction.paymentStatus = PaymentStatus.PAID;
    } else {
      transaction.paymentStatus = PaymentStatus.PARTIAL;
    }

    await this.repository.save(transaction);
    remainingAmount -= amountToApply;
  }
}
```

### 5. Optional Query Parameter Validation

**Problem:** `ParseIntPipe` fails on optional query parameters

**Solution:** Accept string and manually parse

```typescript
// ❌ This fails when parameter is not provided
@Query('year', ParseIntPipe) year?: number

// ✅ This works correctly
@Query('year') year?: string

// In service method:
const yearNumber = year ? parseInt(year, 10) : undefined;
```

### 6. Transaction-Based Operations

**Use Case:** When multiple database operations must succeed or fail together

```typescript
async createSale(dto: CreateSaleDto): Promise<Sale> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Create sale
    const sale = manager.create(Sale, dto);
    await manager.save(sale);

    // 2. Update phone status
    const phone = await manager.findOne(Phone, { where: { id: dto.phoneId } });
    phone.status = PhoneStatus.SOLD;
    phone.saleId = sale.id;
    await manager.save(phone);

    // 3. Return with relations
    return manager.findOne(Sale, {
      where: { id: sale.id },
      relations: ['phone', 'customer'],
    });
  });
}
```

### 7. Calculated Fields vs Stored Fields

**When to Calculate on Query:**
- Phone totalCost = purchasePrice + sum(repairs)
- Sale profit = salePrice - phone.totalCost
- Customer balance = sum(unpaid transactions)

**When to Store:**
- Sale.paymentStatus (updated on payment)
- Phone.status (updated on repair/sale)
- WorkerPayment.totalPaid (calculated once on creation)

**Pattern for Calculated Fields:**

```typescript
@Entity()
export class Sale {
  // Stored fields
  @Column() salePrice: number;

  // Relations
  @ManyToOne(() => Phone)
  phone: Phone;

  // Virtual getter (not stored in DB)
  get profit(): number {
    if (!this.phone) return 0;
    return this.salePrice - this.phone.totalCost;
  }
}
```

### 8. Enum Management

**Centralized Enum File:**

```typescript
// src/common/enums/enum.ts
export enum UserRole {
  OWNER = 'OWNER',         // Hierarchy: 4
  MANAGER = 'MANAGER',     // Hierarchy: 3
  CASHIER = 'CASHIER',     // Hierarchy: 2
  TECHNICIAN = 'TECHNICIAN' // Hierarchy: 1
}

export enum PhoneStatus {
  IN_STOCK = 'IN_STOCK',
  IN_REPAIR = 'IN_REPAIR',
  READY_FOR_SALE = 'READY_FOR_SALE',
  SOLD = 'SOLD',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID'
}
```

**Benefits:**
- Single source of truth
- Easy to maintain
- Type-safe across application
- No magic strings

### 9. Barcode Generation Utility

**Implementation:**

```typescript
// src/common/utils/barcode-generator.util.ts
export function generateBarcode(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  return `PH${timestamp}${random}`;
}
```

**Usage:**

```typescript
const phone = this.phoneRepository.create({
  ...dto,
  barcode: generateBarcode(),
});
```

### 10. E2E Test Structure

**Complete Workflow Testing:**

```typescript
describe('Phone Lifecycle E2E', () => {
  let app: INestApplication;
  let authToken: string;
  let phoneId: number;

  beforeAll(async () => {
    // Initialize app, login
  });

  it('Step 1: Create purchase', async () => {
    // Test purchase creation
    phoneId = response.body.phones[0].id;
  });

  it('Step 2: Create repair', async () => {
    // Use phoneId from previous test
  });

  it('Step 3: Complete repair', async () => {
    // Verify status changes
  });

  it('Step 4: Create sale', async () => {
    // Verify profit calculation
  });

  it('Step 5: Verify cannot sell again', async () => {
    // Test validation
  });
});
```

---

## Testing Strategy

### Backend Unit Tests
- **Services:** Mock repositories, test business logic
- **Controllers:** Mock services, test request/response handling
- **Guards:** Test role authorization logic

### Backend E2E Tests
- **Happy paths:** Purchase → Repair → Sale → Payment flow
- **Debt flow:** Partial payment sale → multiple payments → full payment
- **Credit flow:** Partial payment purchase → shop pays customer

### Frontend Tests (Phase 2 - future)
- Component tests: React Testing Library
- Integration tests: Mock API responses
- E2E tests: Playwright/Cypress for critical flows

---

## Environment Variables

### Backend `.env`
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<secure_password>
DB=phone_shop_db
JWT_SECRET=<generate_secure_secret>
JWT_EXPIRES=8h
JWT_REFRESH_SECRET=<generate_secure_secret>
JWT_REFRESH_EXPIRES=7d
CORS_ORIGIN=http://localhost:5173
PORT=5000
SWAGGER_USER=admin
SWAGGER_PASSWORD=<secure_password>
SWAGGER_PROTECT=true
```

### Frontend `.env`
```
VITE_BASE_URL=http://localhost:5000
VITE_APP_NAME="Phone Shop POS"
```

---

## Deployment Checklist

- [ ] Set `synchronize: false` in TypeORM config
- [ ] Run all migrations on production DB
- [ ] Update environment variables (secure secrets)
- [ ] Build backend: `npm run build`
- [ ] Build frontend: `npm run build`
- [ ] Run Docker Compose: `docker compose up -d`
- [ ] Verify health check: `curl http://localhost:4400/health`
- [ ] Seed initial admin user (one-time)
- [ ] Backup database before major changes

---

## Common Tasks

### Adding a New Entity
1. Create migration: `npm run migration:generate -- src/migrations/CreateEntityTable`
2. Create entity class in `src/{entity}/entities/{entity}.entity.ts`
3. Create DTOs: `create-{entity}.dto.ts`, `update-{entity}.dto.ts`
4. Create sub-services: `{entity}-create.service.ts`, `{entity}-find.service.ts`, etc.
5. Create facade service: `{entity}.service.ts`
6. Create controller: `{entity}.controller.ts`
7. Create module: `{entity}.module.ts`
8. Add module to `app.module.ts`
9. Write unit tests for service
10. Run migration: `npm run migration:run`

### Adding a New Page
1. Create page component in `src/app/{feature}/{page}.tsx`
2. Add route to `src/config/routes.tsx`
3. Add RTK Query endpoints in `src/api/{entity}/index.ts`
4. Create Redux slice if needed in `src/store/slices/{entity}Slice.ts`
5. Add navigation link to sidebar (`src/components/app-sidebar.tsx`)
6. Add TypeScript interfaces in `src/interfaces/{entity}/index.d.ts`

---

## Git Workflow

- `main` branch: production-ready code
- Feature branches: `feature/{entity}-{action}` (e.g., `feature/phones-crud`)
- Commit messages: Conventional Commits format
  - `feat: add phone purchase feature`
  - `fix: resolve debt calculation bug`
  - `refactor: extract payment logic to service`
- Pull requests: Required before merging to main
- CI/CD: Automatic deployment on merge to main

---

## Support & Resources

- NestJS Docs: https://docs.nestjs.com
- TypeORM Docs: https://typeorm.io
- React Docs: https://react.dev
- ShadcnUI: https://ui.shadcn.com
- Redux Toolkit: https://redux-toolkit.js.org
- TailwindCSS: https://tailwindcss.com

---

## Project Status

### Backend: ✅ COMPLETE (as of 2026-02-13)

**Implementation Status:**
- All 8 milestones completed
- 21/21 unit tests passing
- E2E test suite complete
- 100% requirements met (verified against `tz.txt`)

**Documentation:**
- **`backend/IMPLEMENTATION_STATUS.md`** - Detailed requirements verification mapping each requirement from tz.txt to implementation
- **`backend/backend-plan.md`** - Complete implementation plan with all milestones marked complete
- **`tz.txt`** - Original requirements specification
- **Swagger API** - Available at `/api/docs` when backend is running

**Key Features Implemented:**
- Complete phone lifecycle (purchase → repair → sale)
- Customer debt/credit tracking with FIFO payment
- Worker salary management with unique month/year payments
- Comprehensive reporting and analytics
- Role-based access control (OWNER > MANAGER > CASHIER > TECHNICIAN)
- Audit trail and soft delete
- Barcode generation for phones
- Transaction-based operations for data integrity

**Production Readiness:**
- ✅ All business logic implemented and tested
- ✅ Database migrations complete
- ✅ API documentation via Swagger
- ✅ Role-based security
- ✅ Error handling and validation
- ✅ Soft delete for financial records
- ✅ Audit trail for all operations

**Next Phase:** Frontend development

### Frontend: 📋 PENDING

Frontend development will begin after backend is deployed to staging environment.

**Planned Stack:**
- React 19 with TypeScript
- Vite 7 for build tooling
- TailwindCSS 4 for styling
- ShadcnUI for component library
- Redux Toolkit + RTK Query for state management
- React Router 7 for routing

---

## Quick Reference

### Backend Commands
```bash
npm run start:dev          # Development mode
npm run test              # Run unit tests (21 tests)
npm run test:e2e          # Run E2E tests
npm run db:reseed         # Reset database with seed data
npm run migration:run     # Run pending migrations
```

### Key Files
- `/backend/src/app.module.ts` - Main application module
- `/backend/src/*/entities/*.entity.ts` - Database entities
- `/backend/src/*/services/*.service.ts` - Business logic
- `/backend/src/*/dto/*.dto.ts` - Data transfer objects
- `/backend/src/migrations/*.ts` - Database migrations
- `/backend/test/*.e2e-spec.ts` - E2E tests

### Database Entities
1. **User** - System users with roles (OWNER, MANAGER, CASHIER, TECHNICIAN)
2. **Customer** - Customers for debt/credit tracking
3. **Supplier** - Suppliers for purchases (pay-later creates credit)
4. **Phone** - Inventory items with lifecycle tracking
5. **Purchase** - Phone purchase transactions
6. **Repair** - Repair records with costs
7. **Sale** - Phone sale transactions
8. **Payment** - Customer/supplier payment records
9. **Worker** - Employee records
10. **WorkerPayment** - Monthly salary payments

### Business Rules Summary
- Cannot sell already sold phone
- Cannot repair sold phone
- Customer required for pay-later transactions
- Payment amount cannot exceed remaining balance
- FIFO payment application (oldest first)
- Profit = salePrice - (purchasePrice + sum of repairs)
- Phone totalCost = purchasePrice + sum of repairs
- Unique constraint: one worker payment per month/year
- Soft delete for all financial records
