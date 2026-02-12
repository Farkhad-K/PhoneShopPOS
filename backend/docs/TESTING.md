# Testing strategy

This backend relies on carefully constructed automated suites instead of manual checks. When building or extending modules, keep these rules in mind so every controller/service gets the same safety net going forward.

## 1. Baseline: End-to-end (E2E) coverage
- Use Nest’s testing utilities together with `supertest` inside `test/e2e/`. Each suite boots the real `AppModule`, runs against the controllers/guards/interceptors exactly as they run in production, and issues HTTP requests through `supertest`.
- Target **200–500 realistic scenarios** by parameterizing tests: keep an array of request definitions (payload, headers, expected status/message) and loop through them, letting Jest report which scenario failed. Scenarios should exercise:
  * Happy and unhappy paths for each CRUD endpoint (valid DTO vs missing fields, auth failure, unauthorized roles, unique constraints, soft delete semantics).
  * Business flows such as finance reporting, assembler stock movements, transaction reversal, and payment/debt linking.
  * Global behaviors (e.g., the new global exception filter returns structured error bodies, pagination filters always respect `isActive`, Swagger-protected routes respond 401 without credentials).
- Guard the database state by running `npm run db:reseed` before the suite (or at least before each test file) so tests run against the same seeded data. Where unique scenarios need specific fixtures, add them via seed helpers or within the test `beforeAll`.
- `test/app.e2e-spec.ts` demonstrates the preferred format: log in through `/api/auth/login`, store tokens (and refresh them), and run sequential scenarios that cover auth, guard enforcement, CRUD flows, and soft-delete validation. New modules should follow this pattern, keeping tokens/ids in shared variables and testing both happy and failure cases.

## 2. Integration coverage for services
- For critical service logic (auth token rotation, financial calculations, stock adjustments), add Jest tests under `test/` or module-specific `services/*.spec.ts` files.
- Use TypeORM’s `TestingModule` helper with `TypeOrmModule.forRoot` pointed to an in-memory or disposable Postgres (via Docker/local). Seed the minimum tables the service needs.
- When services call external APIs, mock those dependencies but assert the service still handles validation failures, retries, and error translation (so the global exception filter scenario is exercised).

## 3. Scenario matrix docging
- Add a `<module>-scenarios.md` next to each module’s folder (or extend `backend/docs/TESTING.md`) listing each planned scenario, required inputs, and failure expectations. This keeps the 200–500 tests manageable and traceable.
- Re-run the matrix whenever you add/modify endpoints; each new module must add at least one scenario per exported route, plus the auth and pagination cases described above.

## 4. Automate & keep fast
- Keep scenario data-driven: store JSON fixtures that describe method, endpoint, query/body, expected status, and message so extending the suite only requires adding rows.
- Limit suite runtime by splitting true end-to-end flows from faster service-focused tests; you can still reuse the same JSON scenario data across both types by running the requests via `supertest`.

## Next time you scaffold a module
1. `docs/TESTING.md`: list the new scenarios the module will cover and reference shared fixtures if applicable.
2. `test/e2e/<module>.spec.ts`: extend the parameterized scenario array with the new module’s endpoints; reuse helper functions for login tokens and pagination queries.
3. `test/services/<module>/*.spec.ts`: add integration tests for complex service logic, especially anything touching finance, stock, or auth flows.

Following this ensures the backend never lands in a gap where a new endpoint ships without the hundreds of real-world cases you expect.
