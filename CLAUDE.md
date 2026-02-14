# TechNova Phone Shop POS System

Phone shop Point-of-Sale system: purchase → repair → sale lifecycle, customer debt/credit (FIFO payments), supplier management, worker salaries, financial reporting.

**Stack:** NestJS 11 + TypeORM + PostgreSQL 16 | React 19 + Vite 7 + TailwindCSS 4 + ShadcnUI + Redux Toolkit (RTK Query) | Docker

## Commands

### Backend (`/backend`)
```bash
npm run start:dev                                          # Dev server (hot-reload)
npm run build && npm run start:prod                        # Production
npm run test                                               # Unit tests
npm run test:e2e                                           # E2E tests
npm run lint:fix                                           # ESLint auto-fix
npm run db:reseed                                          # Wipe + seed DB
npm run migration:generate -- src/migrations/MigrationName # New migration
npm run migration:run                                      # Apply migrations
```

### Frontend (`/frontend`)
```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # Production build
npm run typecheck  # TypeScript strict check
npm run lint       # ESLint check
```

### Docker
```bash
docker compose up    # Start all (backend, frontend, postgres)
docker compose down  # Stop all
```

## Architecture

### Backend (`/backend/src/`)
- **Pattern:** Facade services — main service delegates to sub-services (`PhoneCreateService`, `PhoneFindService`)
- **Modules:** One per feature — `PhonesModule`, `PurchasesModule`, `SalesModule`, etc.
- **Entities (10):** User, Customer, Supplier, Phone, Purchase, Repair, Sale, Payment, Worker, WorkerPayment
- **Base classes:** `Extender` (id, timestamps, soft delete, isActive), `PaymentExtender` (adds amount)
- **Enums:** Centralized in `src/common/enums/enum.ts` — `Role`, `PhoneStatus`, `PaymentStatus`, `RepairStatus`
- **Auth:** JWT with refresh tokens, role hierarchy: OWNER(4) > MANAGER(3) > CASHIER(2) > TECHNICIAN(1)
- **Guard:** `@UseGuards(JwtRoleGuard)` — higher roles inherit lower role permissions
- **Audit:** `AuditSubscriber` auto-sets `createdBy`, `updatedBy`, `deletedBy`

### Frontend (`/frontend/src/`)
```
api/           # RTK Query endpoints — one file per entity (api/{entity}/index.ts)
app/           # Pages organized by feature (phones/, sales/, purchases/, etc.)
components/    # Reusable UI — layouts/, landing/, shared/, theme-customizer/
config/        # routes.tsx (React Router 7), sidebar navigation config
store/         # Redux store + slices (authSlice with persist)
interfaces/    # TypeScript types matching backend DTOs
hooks/         # Custom hooks
contexts/      # React contexts (sidebar, theme)
```

- **State:** RTK Query for API (caching, invalidation) | Redux Toolkit for auth | useState for UI-only
- **Forms:** React Hook Form + Zod validation
- **Styling:** TailwindCSS 4 utility classes + ShadcnUI + `cn()` for conditional classes
- **Routing:** React Router 7, lazy loading, `<ProtectedRoute allowedRoles={[...]}>` for RBAC
- **Root route:** `/` redirects to `/pos-dashboard`
- **Auth route:** `/auth/sign-in-3`

## Business Rules (Critical)

### Phone Lifecycle
```
Purchase → IN_STOCK → IN_REPAIR → READY_FOR_SALE → SOLD → (RETURNED)
```

### Financial Calculations
- **Total Cost:** `purchasePrice + sum(repairCosts)`
- **Profit:** `salePrice - totalCost`
- **Customer Balance:** Show debt and credit separately — do NOT auto-net

### Payment FIFO
1. Fetch unpaid/partial transactions oldest-first
2. Apply payment to oldest, carry remainder to next
3. Update payment status per transaction

### Data Integrity Constraints
- Cannot sell or repair a phone with status `SOLD`
- Customer required for pay-later sales (enforce in DTO)
- `paidAmount` cannot exceed remaining balance
- One worker payment per (workerId, month, year) — unique constraint
- Financial records use soft delete only (`deletedAt` + void reason)
- IMEI unique constraint (nullable for phones without IMEI)
- Barcode format: `PH{timestamp}{random}`, generated on purchase
- Multi-step ops use `dataSource.transaction()` (sale + status update, payment + balance update)

## Gotchas & Patterns

- **NEVER `synchronize: true` in production** — always use migrations
- **Unique constraints with soft delete** need partial index: `WHERE deleted_at IS NULL`
- **Optional query params:** Don't use `ParseIntPipe` on optional params — parse manually:
  ```typescript
  @Query('year') year?: string  // NOT @Query('year', ParseIntPipe) year?: number
  const yearNum = year ? parseInt(year, 10) : undefined;
  ```
- **Calculated vs stored:** Calculate `totalCost`, `profit`, `balance` at query time. Store `status`, `paymentStatus`
- **QueryBuilder mocks** in tests: chain `.mockReturnThis()` on each method, spy on `createQueryBuilder`
- **TypeORM CLI path alias issues:** Use direct SQL migration files when CLI fails to resolve paths
- **Thin controllers:** All business logic in services, controllers only delegate
- **DTOs:** Separate create/update/response DTOs, use `class-validator` + `@ApiProperty()` with examples

## Environment

### Backend `.env`
```
DB_HOST=localhost  DB_PORT=5432  DB_USER=postgres  DB_PASSWORD=<secret>
DB=phone_shop_db   PORT=5000   CORS_ORIGIN=http://localhost:5173
JWT_SECRET=<secret>  JWT_EXPIRES=8h  JWT_REFRESH_SECRET=<secret>  JWT_REFRESH_EXPIRES=7d
SWAGGER_USER=admin  SWAGGER_PASSWORD=<secret>  SWAGGER_PROTECT=true
```

### Frontend `.env`
```
VITE_BASE_URL=http://localhost:5000
VITE_APP_NAME="Phone Shop POS"
```

**Swagger docs:** `http://localhost:5000/api/docs`

## Adding New Features

### Backend Entity
1. `npm run migration:generate -- src/migrations/CreateEntity`
2. Create entity (extend `Extender`), DTOs, sub-services, facade service, controller, module
3. Register module in `app.module.ts`
4. `npm run migration:run`

### Frontend Page
1. Create page in `src/app/{feature}/{page}.tsx`
2. Add route to `src/config/routes.tsx`
3. Add RTK Query endpoints in `src/api/{entity}/index.ts`
4. Add interfaces in `src/interfaces/{entity}/index.d.ts`
5. Add to sidebar nav config

## Git Workflow

Branches: `main` (production), `feature/{entity}-{action}`, `refactor/{scope}`
Commits: Conventional — `feat:`, `fix:`, `refactor:`
PRs required before merging to main.

## Project Status

- **Backend:** Complete — all features implemented, tested, documented
- **Frontend:** In progress — core pages connected to API, auth working, dashboards live
- **Pending frontend work:** toast notifications (replace `alert()`), confirmation modals for destructive actions, TypeScript error fixes in some POS pages
