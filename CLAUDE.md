# TechNova Phone Shop POS System

## Project Overview

A comprehensive Point-of-Sale system for phone shops with complete lifecycle management from purchase through repair to sale, including customer credit/debt tracking and financial analytics.

**Business Domain:**
- Phone inventory lifecycle (purchase → repair → sale)
- Customer debt/credit tracking (pay-later transactions)
- Supplier credit management
- Profit and cost analysis
- Worker salary management
- Comprehensive reporting and analytics

**Tech Stack:**
- Backend: NestJS 11, TypeORM, PostgreSQL 16
- Frontend: React 19, Vite 7, TailwindCSS 4, ShadcnUI, Redux Toolkit
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

**Architecture:**
- Facade pattern: Main service delegates to sub-services (`PhoneCreateService`, `PhoneFindService`)
- One module per feature: `PhonesModule`, `PurchasesModule`, `SalesModule`
- File naming: kebab-case (`phone.service.ts`), PascalCase for classes (`PhoneService`)

**Entities:**
- Extend `Extender` base (provides id, timestamps, soft delete, isActive)
- Use `PaymentExtender` for entities with amount field
- Always use TypeORM decorators
- Enable soft delete for financial records

**Migrations:**
- ⚠️ NEVER use `synchronize: true` in production
- Generate migrations for schema changes: `npm run migration:generate`
- Name format: `YYYYMMDDHHMMSS-DescriptiveName.ts`

**DTOs & Validation:**
- Use class-validator: `@IsString()`, `@IsNumber()`, `@IsEnum()`
- Swagger docs: `@ApiProperty()` with examples
- Separate DTOs for create, update, response

**Controllers & Services:**
- Thin controllers (delegate to services)
- Business logic in services only
- Use guards: `@UseGuards(JwtRoleGuard)`
- Dependency injection for testability

**Testing:**
- Unit tests for services (mock repositories)
- E2E tests for critical flows
- Target >80% coverage on business logic

### Frontend (React)

**Structure:**
```
src/
├── api/          # RTK Query endpoints (one per entity)
├── app/          # Pages (feature-based folders)
├── components/   # Reusable UI (ui/, features/, layouts/)
├── store/        # Redux slices
├── interfaces/   # TypeScript types (match backend DTOs)
└── hooks/        # Custom hooks
```

**State Management:**
- RTK Query for ALL API calls (caching, auto-retry)
- Redux Toolkit for global state
- Local state (useState) for UI-only state
- Define endpoints in `src/api/{entity}/index.ts`

**Forms & Styling:**
- React Hook Form + Zod validation
- TailwindCSS utility classes (mobile-first)
- ShadcnUI components
- Use `cn()` for conditional classes

**Routing & Performance:**
- React Router 7 with lazy loading
- Protected routes with role-based access
- Memoize with useMemo/useCallback
- React.memo for pure components

**TypeScript:**
- Strict mode enabled
- Match backend DTOs exactly
- No `any` types (use `unknown` if needed)

---

## Core Business Patterns

### 1. Role-Based Access Control
**Hierarchy:** OWNER (4) → MANAGER (3) → CASHIER (2) → TECHNICIAN (1)
- Backend: `@UseGuards(JwtRoleGuard)` with role hierarchy check
- Frontend: `<ProtectedRoute allowedRoles={['OWNER', 'MANAGER']}>`

### 2. Phone Lifecycle
```
Purchase → IN_STOCK → IN_REPAIR → READY_FOR_SALE → SOLD → (RETURNED)
```
**Status Enum:** `IN_STOCK | IN_REPAIR | READY_FOR_SALE | SOLD | RETURNED`

### 3. Financial Calculations
- **Total Cost:** `purchasePrice + sum(repairCosts)`
- **Profit:** `salePrice - totalCost`
- **Customer Balance:** Show debt and credit separately (do NOT auto-net)

### 4. Payment Application (FIFO)
1. Fetch unpaid/partial transactions (oldest first)
2. Apply payment to oldest transaction
3. If remainder exists, apply to next transaction
4. Update balances and payment status

### 5. Audit Trail
All financial records auto-populate:
- `createdBy`, `updatedBy`, `deletedBy` (via AuditSubscriber)
- Timestamps for all actions

### 6. Barcode Generation
- Format: `PH{timestamp}{random}`
- Generated on purchase
- Use for inventory tracking and labels

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

## Key Implementation Patterns

### 1. TypeORM Migrations
**Best Practice:** Use migrations, NEVER `synchronize: true` in production
- Generate: `npm run migration:generate -- src/migrations/Name`
- For complex SQL: Create direct SQL file and execute via DataSource
- Path alias issues: Use direct SQL migration when TypeORM CLI fails

### 2. Testing Patterns
**Unit Tests:** Mock repositories with `getRepositoryToken(Entity)`
**QueryBuilder Mock:**
```typescript
const mockQB = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockEntity], 1]),
};
jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB as any);
```

### 3. Payment FIFO Algorithm
```typescript
// Fetch unpaid transactions (oldest first)
// Apply payment to oldest first
// If remainder, continue to next transaction
// Update payment status accordingly
```

### 4. Transaction-Based Operations
Use `dataSource.transaction()` for multi-step operations that must succeed/fail together:
- Creating sale + updating phone status
- Applying payment + updating balances

### 5. Calculated vs Stored Fields
**Calculate:** Phone.totalCost, Sale.profit, Customer.balance
**Store:** Phone.status, Sale.paymentStatus, WorkerPayment.totalPaid

**Virtual Getters:**
```typescript
get profit(): number {
  return this.salePrice - this.phone.totalCost;
}
```

### 6. Unique Constraints with Soft Delete
```sql
CREATE UNIQUE INDEX idx_name ON table(column1, column2)
WHERE deleted_at IS NULL;
```

### 7. Optional Query Parameters
```typescript
// ❌ @Query('year', ParseIntPipe) year?: number
// ✅ @Query('year') year?: string
const yearNum = year ? parseInt(year, 10) : undefined;
```

### 8. Centralized Enums
Store all enums in `src/common/enums/enum.ts`:
- `UserRole`, `PhoneStatus`, `PaymentStatus`
- Single source of truth, type-safe

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
- [ ] Run migrations: `npm run migration:run`
- [ ] Update environment variables (secure secrets)
- [ ] Build: `npm run build` (backend & frontend)
- [ ] Deploy: `docker compose up -d` or `./deploy.sh`
- [ ] Verify: Health check and Swagger docs
- [ ] Seed initial admin user (one-time)
- [ ] Backup database

---

## Common Tasks

### Adding Backend Entity
1. Generate migration: `npm run migration:generate -- src/migrations/CreateEntity`
2. Create entity, DTOs, sub-services, facade service, controller, module
3. Add module to `app.module.ts`
4. Write unit tests
5. Run migration: `npm run migration:run`

### Adding Frontend Page
1. Create page in `src/app/{feature}/{page}.tsx`
2. Add route to `src/config/routes.tsx`
3. Create RTK Query endpoints in `src/api/{entity}/index.ts`
4. Add TypeScript interfaces in `src/interfaces/{entity}/index.d.ts`
5. Add to sidebar navigation

---

## Git Workflow

- **Branches:** `main` (production), `feature/{entity}-{action}`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `refactor:`)
- **PRs:** Required before merging to main

---

## Project Status

### Backend: ✅ COMPLETE (as of 2026-02-13)

**Implementation Status:**
- ✅ All 8 milestones completed
- ✅ 21/21 unit tests passing
- ✅ E2E test suite complete
- ✅ 100% requirements met (verified against `tz.txt`)
- ✅ Swagger API documentation at `/api/docs`

**Key Features:**
- Complete phone lifecycle (purchase → repair → sale)
- Customer debt/credit tracking with FIFO payment
- Supplier credit management
- Worker salary management (unique month/year payments)
- Comprehensive reporting and analytics
- Role-based access control (OWNER → MANAGER → CASHIER → TECHNICIAN)
- Audit trail and soft delete for all operations
- Barcode generation for phones
- Transaction-based operations for data integrity

**Documentation:**
- `backend/IMPLEMENTATION_STATUS.md` - Requirements verification
- `backend/backend-plan.md` - Implementation plan
- `tz.txt` - Original requirements specification

### Frontend: 🚧 IN PROGRESS (as of 2026-02-14)

**✅ Completed:**
- ✅ Rebranded from "ShadcnStore" to "TechNova"
- ✅ Removed demo apps (Mail, Tasks, Chat, Calendar)
- ✅ Restructured navigation for POS-specific features
- ✅ Connected dashboards to real backend endpoints
- ✅ Fixed API data fetching (removed all dummy data)
- ✅ Implemented user management with backend integration
- ✅ Created RTK Query endpoints for all entities
- ✅ Set up Redux store with proper state management
- ✅ Configured authentication flow with JWT
- ✅ Implemented protected routes and role-based access

**Current Navigation Structure:**
- **Main Dashboards:** Sales Dashboard, Inventory Dashboard, POS Dashboard
- **Inventory Group:** Phones, Purchases, Repairs
- **Transactions Group:** Sales, Customers
- **Management Group:** Workers, Reports, Users
- **Pages:** Landing, Auth, Settings, etc.

**📋 Remaining Work:**
- Component prop type mismatches (dashboard components)
- Toast notification system (replace `alert()` calls)
- Pre-existing TypeScript errors in some POS pages
- Enhanced form validation and error handling
- Confirmation modals for destructive actions

**Documentation:**
- `frontend/RESTRUCTURING_SUMMARY.md` - Rebranding and restructuring details
- `frontend/DASHBOARD_FIX_SUMMARY.md` - API integration fixes

---

## Quick Reference

### Commands
**Backend:**
```bash
npm run start:dev     # Dev mode with hot-reload
npm run test          # Unit tests (21 tests)
npm run test:e2e      # E2E tests
npm run db:reseed     # Reset DB with seed data
npm run migration:run # Apply migrations
```

**Frontend:**
```bash
npm run dev           # Vite dev server
npm run build         # Production build
npm run typecheck     # TypeScript check
```

### Database Entities (10)
1. **User** - System users with roles
2. **Customer** - Debt/credit tracking
3. **Supplier** - Purchase suppliers
4. **Phone** - Inventory with lifecycle
5. **Purchase** - Purchase transactions
6. **Repair** - Repair records
7. **Sale** - Sale transactions
8. **Payment** - Payment records
9. **Worker** - Employees
10. **WorkerPayment** - Monthly salaries

### Critical Business Rules
- ⚠️ Cannot sell/repair already sold phone
- ⚠️ Customer required for pay-later
- ⚠️ Payment ≤ remaining balance
- ⚠️ FIFO payment application
- ⚠️ One worker payment per month/year
- ⚠️ Soft delete for financial records
- **Profit:** `salePrice - (purchasePrice + repairs)`
- **Total Cost:** `purchasePrice + sum(repairs)`

### API Documentation
- **Swagger:** `http://localhost:5000/api/docs` (when backend running)
- **Main Endpoints:** `/api/phones`, `/api/sales`, `/api/purchases`, `/api/repairs`, `/api/reports`

### Documentation Files
- `backend/IMPLEMENTATION_STATUS.md` - Requirements verification
- `backend/backend-plan.md` - Implementation plan
- `frontend/RESTRUCTURING_SUMMARY.md` - Frontend restructuring
- `frontend/DASHBOARD_FIX_SUMMARY.md` - Dashboard API fixes
- `tz.txt` - Original requirements

---

## Recent Changes (2026-02-14)

### ✅ Frontend Restructuring Complete
- Rebranded from "ShadcnStore" → "TechNova"
- Removed demo apps (Mail, Tasks, Chat, Calendar)
- Restructured sidebar navigation for POS features
- Updated landing page, navbar, footer with TechNova branding
- Changed default route from `/pos-dashboard` to `/` (Landing)

### ✅ Dashboard API Integration
- Connected Sales Dashboard to `/api/sales` endpoint
- Connected Inventory Dashboard to `/api/reports/dashboard` endpoint
- Fixed POS Dashboard to use `useGetDashboardStatsQuery()`
- Removed all hardcoded dummy data
- Fixed TypeScript interfaces to match backend DTOs
- Eliminated all 404 API errors

### ✅ Users Management Integration
- Created RTK Query endpoints for users CRUD
- Connected Users page to backend API
- Added loading/error states
- Implemented create/update/delete functionality

### 📋 Pending Work
- Fix component prop types in dashboard child components
- Add toast notification system (replace `alert()`)
- Fix pre-existing TypeScript errors in some POS pages
- Add confirmation modals for destructive actions
- Implement edit dialog for Users page

---

## Support & Resources

- **NestJS:** https://docs.nestjs.com
- **TypeORM:** https://typeorm.io
- **React:** https://react.dev
- **ShadcnUI:** https://ui.shadcn.com
- **Redux Toolkit:** https://redux-toolkit.js.org
- **TailwindCSS:** https://tailwindcss.com
