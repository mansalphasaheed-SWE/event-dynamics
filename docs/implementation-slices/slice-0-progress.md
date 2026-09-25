# Slice 0 Progress

## Objective

Establish the shared technical foundation required by later
Event Dynamics modules.

## Status

In progress. Local PostgreSQL and initial application configuration
are verified. The database role/permission checkpoint is complete: corrected
disposable PostgreSQL checks and existing development socket/TCP checks passed
for all four roles. Drizzle and host/API connectivity are separate next steps.

## Completed

- [x] Git repository initialized and GitHub repository created
- [x] pnpm workspace created
- [x] NestJS API scaffolded
- [x] Module boundary lint rules added
- [x] Vitest configured with SWC
- [x] Unit and E2E tests migrated to Vitest
- [x] Jest configuration and dependencies removed
- [x] GitHub Actions CI workflow configured and pushed
- [x] PostgreSQL Compose configuration prepared
- [x] Local environment file and example prepared
- [x] Database management scripts added
- [x] PostgreSQL startup and health verified
- [x] Database connection through psql inside the container verified
- [x] Data persistence across container recreation verified
- [x] Persistence probe table removed
- [x] Initial NODE_ENV and PORT validation implemented
- [x] API bootstrap uses the validated port
- [x] Configuration validation tests pass
- [x] Local lint, tests and API build pass
- [x] Runtime has USAGE but no CREATE permission on kernel and outbox

## Next

- [x] Implement all four roles and pass corrected disposable permission verification
- [x] Verify all four existing development TCP credentials and full permissions without rotation
- [ ] Begin Drizzle and node-postgres integration

## Remaining
- [ ] Integrate Drizzle ORM and node-postgres
- [ ] Add and validate application database configuration
- [ ] Verify the API connection through the published database port
- [ ] Establish the migration workflow
- [ ] Set up real PostgreSQL integration tests
- [ ] Implement money and time primitives
- [ ] Implement context, authority and authorization infrastructure
- [ ] Implement tenant-scoped repositories and row-level security
- [ ] Implement transaction runner and transactional audit
- [ ] Implement idempotency and replay handling
- [ ] Implement outbox, dispatcher and worker-effect handling
- [ ] Complete remaining kernel acceptance and operational checks

## Awaiting Verification

- [ ] First successful GitHub Actions CI run
  - Last confirmed status: waiting for a runner.

## Verification

| Check | Result |
|---|---|
| Local lint | Passed |
| Configuration, controller and E2E tests | Passed: 16 tests |
| API build | Passed |
| PostgreSQL startup and health | Passed |
| Database connection inside container | Passed |
| Persistence across container recreation | Passed |
| Corrected disposable role/permission suite | Passed: PostgreSQL 18.6 SCRAM TCP, type/column audit regressions and cleanup |
| Final development role/permission suite | Passed through separate socket and TCP logins for all four roles; probes removed |
| Dispatcher/retention development TCP authentication | Passed separately and in final full TCP suite |
| Migrator/runtime development TCP authentication | Passed with existing credentials; no rotation |
| API database connection | Not implemented |
| GitHub Actions CI | Successful run unconfirmed |
Detailed commands, scope and results: [database permissions](../development/database-permissions.md).
Table-specific grants and RLS/tenant isolation checks remain pending.

Role-permission sign-off does not require Drizzle or host/API integration.
No role-permission blockers remain. To repeat the login check locally (passwords are masked and unchanged):

```powershell
python -u scripts/database/verify-permissions.py --development --tcp --login-only --roles migrator runtime --prompt-passwords
```
