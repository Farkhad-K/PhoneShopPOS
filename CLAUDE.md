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
