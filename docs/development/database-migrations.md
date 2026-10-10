# Database Migrations

Provisioning and migrations have different jobs. The ordered scripts in
`scripts/database/` create the four restricted identities, establish schema
ownership and foundational permissions. Run those only according to the
[permissions guide](database-permissions.md). They are **not** recorded as
Drizzle migrations and must not be replayed on an existing installation.

After provisioning, `pnpm db:migrate` applies reviewed application changes
from `apps/api/drizzle/`. Its history is `kernel.__drizzle_migrations`, owned
by `event_dynamics_migrator`. The committed journal currently has no
application migrations; no business table is created by this checkpoint.

## Credentials and execution

Use the existing `event_dynamics_migrator` password established during
provisioning. Supply `MIGRATION_DATABASE_URL` to the migration process from
an ignored local secret file or a secret manager. Do not put it in the API's
`.env`, `DATABASE_URL`, committed SQL, or this guide. For local development it
targets `127.0.0.1:5433/event_dynamics_dev`. The runner requires the migrator
username and never falls back to runtime or administrator credentials.

From the repository root, after provisioning and with that setting in the
process environment:

```powershell
pnpm db:migrate
```

The command runs outside Nest startup. It checks the role, obtains a
session-level PostgreSQL advisory lock, applies pending journal entries in
order through `drizzle-orm@0.45.3`, and closes its connection. A competing
run fails while the lock is held. A failed migration exits nonzero and prints
a safe error without the connection URL. Do not start the API with the
migrator credential.

## Create and review a migration

`drizzle-kit@0.31.11` is pinned for the installed ORM and Node 22. Its
format uses SQL files and `drizzle/meta/_journal.json` (journal version 7).
See the official [migration execution](https://orm.drizzle.team/docs/drizzle-kit-migrate)
and [custom migration](https://orm.drizzle.team/docs/drizzle-kit-generate#custom-migrations)
guides, but check the pinned release before copying newer examples.
The empty schema module at `apps/api/src/infrastructure/database/schema.ts`
lets the current Kit release generate a custom SQL migration. From the
repository root:

```powershell
pnpm --filter api exec drizzle-kit generate --custom --name=describe_change
```

Write the SQL in the generated file under `apps/api/drizzle/`. Commit the SQL
and tool-managed metadata together. Review statements, object ownership,
grants, lock duration and rollback behavior before running `pnpm db:migrate`.
Hand-written SQL is required for RLS, partitioning and triggers; generated
migrations can be used later for straightforward tables once their Drizzle
schema is defined. Keep fixture migrations under `apps/api/test/fixtures/`;
they are never application migrations.

Run `pnpm db:migrate` against a disposable provisioned database first, then
against the intended development database with its separate migrator URL.
The existing database retains its passwords and data. Check history and
objects after application. Do not edit a migration that has already run:
Drizzle's applied history is based on ordered timestamps, and changing the
file would make environments disagree. If a migration fails, inspect the
safe SQLSTATE and database logs without disclosing credentials, correct the
unapplied file, and retry. If it already succeeded anywhere, create a new
forward corrective migration instead.

## Transaction and access boundary

In the installed `drizzle-orm@0.45.3` PostgreSQL migrator, creation of the
history schema/table happens before its transaction. **All pending SQL and
history inserts run in one transaction**; a failure rolls back the entire
pending batch, including earlier migrations in that same pending batch. A
newly created empty history table can remain. Do not
put statements that cannot run in a transaction in these migrations without
a separately reviewed workflow. The session advisory lock serializes the
whole run; Drizzle alone does not provide that lock.

The runner first verifies that the migrator owns `kernel` and `outbox` and
that any existing history table has the same owner. The pinned Drizzle ORM
issues a redundant `CREATE SCHEMA IF NOT EXISTS "kernel"` even when the schema
already exists; PostgreSQL requires database-level `CREATE` for it. The
runner skips only that statement after the ownership check, preserving the
migrator's restricted database privileges.
The exact statement and wrong-owner rejection are covered by disposable
PostgreSQL regression tests; keep those checks when upgrading Drizzle.

Only the migrator owns application schemas and migration-created objects.
Runtime, dispatcher and retention roles receive no history-table grants.
Their inability to modify it is tested on disposable PostgreSQL. Future
table-specific grants and RLS policies remain separate work.

## Verification

From the repository root with Docker available:

```powershell
pnpm --filter api test:integration
```

The migration integration suite provisions a fresh disposable PostgreSQL
18.6 container with generated credentials. It tests ordered application and
idempotence, failed-batch rollback, competing runs, migrator ownership and
history write denial for runtime, dispatcher and retention. It does not load
the development `.env` or touch the persistent Compose volume. The ordinary
unit test command does not run these container tests.

Execution result for this checkpoint: `pnpm lint`, `pnpm test` (41 tests),
`pnpm build`, and `pnpm --filter api test:integration` (8 tests in 2 files)
passed. The migration suite also exercised the root
`pnpm db:migrate` entry point against its disposable database and repeated
it to verify skipping. The command was run with generated test credentials;
the persistent development database remains **unverified** for migration
execution. Apply the first reviewed application migration there when ready.
No artificial application table was added, and no development credential was
read or changed.
