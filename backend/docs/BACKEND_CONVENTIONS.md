# Backend conventions and architecture overview

This document collects the structural rules, shared logic, and guardrails you need when using this backend as a template for future modules.

## Module layout and per-endpoint services
- Every domain keeps a `services/` folder with small, single-purpose service classes (e.g., `client-create`, `client-find-one`, `client-update`, etc.) so each endpoint has its own implementation file (`src/party/client/services/client-create.service.ts`, etc.).
- A higher-level service (e.g., `ClientService` in `src/party/client/services/client.service.ts`) aggregates them and exposes controller-friendly methods (`create`, `findAll`, `remove`, plus any custom finance helpers). Controllers stay thin and only delegate to this aggregator (`src/party/client/client.controller.ts`).
- Base services live alongside endpoint services to share common repository helpers and `isActive` filtering (`ClientBaseService`, `ProductBaseService`); reference existing base classes in `src/product/product/services/product-base.service.ts` to see how repositories and shared helpers are injected once for the whole module.
- DTO definitions live in a `dto/` folder, entity definitions in `entities/`, shared helpers in `helper.ts`, and any batch/log submodules get their own subfolders (`product-batch`, `product-log`, etc.).
- Follow the existing order of controller routes: static/custom routes first (e.g., `/products-finance` before `/:id`), standard CRUD routes afterwards.

## Shared logic and utilities
- All entities extend `Extender` from `src/common/entities/common.entites.ts`, ensuring `id`, `createdAt`, `updatedAt`, `deletedAt`, and `isActive` exist on every table.
- Shared decorators/interceptors (e.g., `CurrentUser`, `ClsUserInterceptor`) feed the `AuditSubscriber` (`src/common/subscribers/audit.subscriber.ts`) to auto-fill `createdBy`/`updatedBy`/`deletedBy`.
- The pagination pipeline lives under `src/common/dtos/pagination-query.dto.ts` and `src/common/utils/pagination.util.ts`; every find-all service should import `PaginationQueryDto` and call `paginateAndFilter` with a base `isActive: true` filter.
- Global validation is enforced by `main.ts` (`ValidationPipe` with `whitelist`/`forbidNonWhitelisted`), so DTOs must declare every acceptable property.
- Utilities such as `basicAuthMiddleware`, `printEntities`, and others live in `src/common/utils`. Reuse them instead of reimplementing similar behavior.
- Error handling depends on `GlobalExceptionFilter` under `src/common/filters/global-exception.filter.ts`. It intercepts all thrown values, logs structured details, and returns a JSON body containing status, message, timestamp, and path rather than letting the framework emit a bare 500. All modules inherit this filter automatically through `APP_FILTER` in `app.module.ts`.

## Swagger and security
- Swagger setup occurs in `src/main.ts`: docs are protected by optional Basic Auth (`SWAGGER_PROTECT`, `SWAGGER_USER`, `SWAGGER_PASSWORD`) using `basicAuthMiddleware` from `src/common/utils/basic-auth-middleware.ts`.
- Document builder always registers a JWT bearer scheme so `/api/docs` hints at `Authorization: Bearer <token>`, and the `SwaggerModule.setup` call includes `persistAuthorization`.
- Static assets (uploads) and CORS rules are configured in `main.ts`; keep those hooks if you extend the backend.
- JWT secrets must be supplied via `JWT_SECRET` and `JWT_REFRESH_SECRET`; the app now throws on startup when they are missing so the fallback `'changeme'` can no longer be used.
- Tokens include a `tokenVersion` matched against `user.refreshTokenVersion` (see `src/auth/helper.ts` and `src/user/entities/user.entity.ts`). Use the `/api/auth/logout` endpoint (or increment that column during password changes) to invalidate existing refresh/access tokens server-side.

## Data exposure and soft-delete rules
- All controllers and services exclusively expose DTOs (see `src/party/client/helper.ts` for `ClientResult` and `ClientDeletedResult`, and `src/product/product/helper.ts` for `ProductView`). These helpers explicitly map entity fields and never include `isActive`, `deletedAt`, or audit fields in API responses.
- Reads always filter `isActive = true` (see `ClientFindOneService`, `ClientFindAllService`, and many other services under `src/**/services`).
- Soft delete operations set `isActive = false` and `deletedAt = new Date()` before returning a sanitized DTO (`ClientRemoveService`, `RawMaterialBatchRemoveService`, etc.).
- Never expose raw entity objects directly to controllers; always map through helper functions so the `isActive`/`deletedAt` fields stay internal.

## Folder structure guidelines for new modules
1. Create a `dto/` directory with explicit create/update shapes plus any paged/response DTOs used for Swagger documentation.
2. Place entities under `entities/`, using `Extender` or its derivatives so every table inherits auditing metadata.
3. Use a `services/` directory to host:
   - A base service (extends `Extender` repositories, contains shared repository getters like `getActiveXorThrow`).
   - Individual per-endpoint services (create, find-one, find-all, update, remove, any custom business operations).
   - The aggregate service that the controller injects (`*.service.ts`), which wires the sub-services and exposes public methods.
4. Put controller tests under the module root and service tests under the appropriate `services/` folder (matches existing `*.spec.ts` files).
5. Add helper files (`helper.ts`, `ingredient.types.ts`, etc.) to centralize DTO/result mapping logic outside controllers/services.

Keep this document up to date whenever you add or remove conventions so future AI assistants can rely on it.

## Seed & wipe rules
- `package.json` exposes `npm run db:wipe`, `db:seed`, and `db:reseed` (which runs wipe + seed). The wipe script drops and recreates the entire `public` schema (`backend/src/seed/wipe.ts`) so nothing remains except the DB structure before running migrations.
- Seeding runs `backend/src/seed/run-seed.ts`, which opens a transaction, inserts the core reference data (measurement conversions, lookup tables, etc.), and guards every block with `ON CONFLICT`/`WHERE NOT EXISTS` so the script is re-entrant.
- Every entity that needs bootstrap data must contribute its own block in `run-seed.ts` (or in a dedicated helper invoked from there) so adding a module means adding (or importing) a new seed section. Seed blocks should create at least 15 rows for the entity to keep development/testing data representative, and they must respect `isActive`/`deletedAt` semantics when inserting.
- The current user block seeds the admin account plus at least 14 worker personas (storekeeper, assembler, finance, etc.); subsequent calls to `db:seed` refresh their hashed passwords and keep them active.
- Always run `npm run db:reseed` after schema changes to ensure the new entity’s seed runs cleanly; keep the `wipe` + `seed` commands handy to rehydrate a fresh environment for future work.
