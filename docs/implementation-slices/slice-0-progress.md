# Slice 0 Progress

## Objective

Establish the shared technical foundation required by later
Event Dynamics modules.

## Status

In progress. The database role/permission checkpoint is complete: corrected
disposable PostgreSQL checks and existing development socket/TCP checks passed
for all four roles. The API's runtime Drizzle pool and startup connection
through the published development database port are verified. A separate
disposable PostgreSQL integration test also passes with a restricted runtime
role. Production database configuration remains pending.

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
- [x] Stable Drizzle ORM, node-postgres and pg types added at exact versions
- [x] Drizzle/node-postgres integration verified through the Nest-injected provider
- [x] Configuration validation tests pass
- [x] Runtime DATABASE_URL and pool settings validated; development defaults documented
- [x] Production configuration example added with explicit pool settings
- [x] One shared runtime pool and typed Drizzle provider registered in Nest
- [x] Drizzle startup query, failure cleanup and normal pool shutdown added
- [x] API startup connected to the development database through the published port
- [x] Separate disposable PostgreSQL API integration test uses a restricted runtime role
- [x] Local lint, tests and API build pass
- [x] Runtime has USAGE but no CREATE permission on kernel and outbox

## Remaining
- [ ] Select production database endpoint, secret delivery and pool budgets before deployment
- [ ] Establish the migration workflow
- [ ] Define and verify table-specific runtime grants as objects are introduced
- [ ] Implement transaction infrastructure
- [ ] Verify RLS and tenant isolation against real PostgreSQL
- [ ] Implement money and time primitives
- [ ] Implement context, authority and authorization infrastructure
- [ ] Implement tenant-scoped repositories
- [ ] Implement transactional audit
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
| Full API test suite | Passed locally on 2026-09-28: 41 tests in 5 files; disposable integration test runs separately |
| API build | Passed |
| PostgreSQL startup and health | Passed |
| Database connection inside container | Passed |
| Persistence across container recreation | Passed |
| API database configuration validation | Passed: development defaults, explicit production pool settings, and startup refusal for empty or malformed URLs |
| API database module and startup tests | Passed locally: shared pool identity, startup success/failure and cleanup, Nest shutdown |
| API runtime database startup | Passed against existing development PostgreSQL through 127.0.0.1:5433; Ctrl+C shutdown exited cleanly |
| API runtime database failure checks | Passed: incorrect password and unavailable local endpoint stopped startup with a generic error; no credentials printed |
| Disposable API database integration | Passed locally on 2026-09-28 against the final file: Nest-injected Drizzle queried `current_database()` and `current_user` as `event_dynamics_runtime` in `event_dynamics_dev`; pool closed; 1 test passed |
| Corrected disposable role/permission suite | Passed: PostgreSQL 18.6 SCRAM TCP, type/column audit regressions and cleanup |
| Final development role/permission suite | Passed through separate socket and TCP logins for all four roles; probes removed |
| Dispatcher/retention development TCP authentication | Passed separately and in final full TCP suite |
| Migrator/runtime development TCP authentication | Passed with existing credentials; no rotation |
| Production API database connection | Not configured or tested |
| GitHub Actions CI | Successful run unconfirmed |
Detailed commands, scope and results: [database permissions](../development/database-permissions.md).
Table-specific grants and RLS/tenant isolation checks remain pending.

Role-permission sign-off does not require Drizzle or host/API integration.
No role-permission blockers remain. To repeat the login check locally (passwords are masked and unchanged):

```powershell
python -u scripts/database/verify-permissions.py --development --tcp --login-only --roles migrator runtime --prompt-passwords
```
