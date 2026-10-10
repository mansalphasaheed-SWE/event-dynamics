# Database permissions foundation

## Responsibilities

This checkpoint implements Kernel Design sections 5.1 and 13.1-13.2, HLD sections 7.3 and 5.3, and Technology Stack section 3. It does not prove tenant isolation. RLS, tenant context, table-specific grants and production pool sizing remain future work.

| Identity | Responsibility and current access |
|---|---|
| event_dynamics_admin | Bootstrap administration only; never an application connection |
| event_dynamics_migrator | LOGIN, CONNECT; owns kernel/outbox and creates application objects there |
| event_dynamics_runtime | LOGIN, CONNECT; USAGE on kernel/outbox; no object creation or table grants |
| event_dynamics_dispatcher | Separate LOGIN and credential; CONNECT and USAGE on outbox only |
| event_dynamics_retention | Separate LOGIN and credential; CONNECT only |

All four non-administrator roles have NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION and NOBYPASSRLS, and no role memberships. Runtime/service identities own no objects. PUBLIC has no database or public/kernel/outbox schema privileges. Database TEMP and CREATE are denied to all four roles. System catalogs remain accessible under PostgreSQL's normal rules; connect-only refers to application capabilities.

Migrations must connect directly as the migrator. Object ownership follows the creating identity, not the schema owner. Never run application migrations as administrator. No blanket existing/future table or sequence grants are installed. Migrator defaults revoke PUBLIC routine EXECUTE and type USAGE globally; later migrations must explicitly grant reviewed object access. The checkpoint audit intentionally rejects application-object grants until that later work updates its expectations.

## Ordered setup

Run PowerShell from the repository root. Start the existing Compose service normally; do not remove its volume. Copy the whole SQL directory so relative audit includes resolve:

```powershell
docker compose cp ./scripts/database event_dynamics_dev:/tmp/event-dynamics-database
```

Execute each required file separately, replacing FILE.sql:

```powershell
docker compose exec -T event_dynamics_dev psql -X -v ON_ERROR_STOP=1 -U event_dynamics_admin -d event_dynamics_dev -f /tmp/event-dynamics-database/FILE.sql
```

For a fresh database, execute in this order, all as administrator:

1. bootstrap.sql - migrator and explicit CONNECT.
2. 002-schemas.sql - migrator-owned kernel/outbox.
3. 003-runtime-role.sql - runtime and explicit CONNECT.
4. 004-runtime-schema-access.sql - runtime schema usage.
5. 005-service-roles.sql - dispatcher and retention, explicit CONNECT.
6. 006-permission-foundation.sql - effective privilege hardening and transactional audit.
7. verify-permissions.sql - independent read-only audit.

Scripts stop on errors. Creation scripts deliberately fail on existing roles/schemas. Do not run them blindly again. The hardening script is repeatable and fails/rolls back on incorrect ownership, elevated attributes, memberships or unexpected object/default grants rather than silently accepting them.

For an existing installation, inspect roles, schemas, memberships, object ownership and defaults first (`\du`, `\dn+`, `\dp`, `\ddp`). Skip successful creation steps. If both service roles are absent, execute 005 then 006; if both exist, execute only 006 after inspection. If only one exists, stop and reconcile the partial state explicitly: do not drop roles or rotate credentials to rerun 005. In this project's development database, all six steps are now complete.

Assign passwords only to newly created identities using an interactive administrator session:

```powershell
docker compose exec event_dynamics_dev psql -X -U event_dynamics_admin -d event_dynamics_dev
```

```text
\password event_dynamics_migrator
\password event_dynamics_runtime
\password event_dynamics_dispatcher
\password event_dynamics_retention
```

Use a different credential per role; skip already assigned passwords. Existing migrator/runtime passwords were preserved. New development dispatcher/retention credentials were generated separately and saved in the Git-ignored `.env.database-services` file. Do not copy its contents into documentation, logs, SQL or commits. That file is not automatically loaded into the API.

## Executable verification

Requires Python 3 and a running Docker engine; no additional Python packages or API database integration.

```powershell
python scripts/database/verify-permissions.py
python scripts/database/verify-permissions.py --development
```

The default creates a disposable postgres:18.6-bookworm container with no external network, no published port, and temporary memory-backed database storage. It enables SCRAM for container-loopback TCP, generates ephemeral credentials, and removes only its own container afterward. It tests fresh setup, seeded forward completion, repeatable hardening, and rejection of deliberate attribute/membership/ownership/PUBLIC/default-grant drift.

The development option performs no bootstrap or password changes. It opens separate local socket connections as each actual restricted login (not administrator SET ROLE impersonation). It creates unique migrator-owned probes, grants SELECT to runtime on those probes only, and removes them in a finally block. Do not run during schema changes. An abrupt process termination may require the migrator to remove the uniquely named permission_probe_* tables after inspection.

Both modes check identities, attributes, memberships, schema/database privileges, object ownership/defaults, migrator DDL, initial runtime SELECT denial, granted SELECT success, INSERT/ALTER/DROP denial, forbidden CREATE and role switching, dispatcher/retention restrictions, and final cleanup. Only SQLSTATE 42501 qualifies as an expected permission denial; unexpected success or other errors fail with a nonzero exit. Potentially destructive negative tests are enclosed in rolled-back transactions.

To repeat the existing development migrator/runtime TCP login check, run this from the repository root. It prompts without echo for the two existing passwords, makes no password changes and creates no objects:

```powershell
python -u scripts/database/verify-permissions.py --development --tcp --login-only --roles migrator runtime --prompt-passwords
```

Success prints one `PASS: development TCP login and identity` line per role and exits zero. An authentication or identity failure exits nonzero. Do not enter credentials in shell command arguments or paste them into chat.

To rerun the full suite using development TCP for all four roles, load the existing ignored service credentials and prompt for the missing migrator/runtime passwords:

```powershell
python -u scripts/database/verify-permissions.py --development --tcp --credentials-file .env.database-services --prompt-passwords
```

Process environment variables `ED_MIGRATOR_PASSWORD`, `ED_RUNTIME_PASSWORD`, `ED_DISPATCHER_PASSWORD` and `ED_RETENTION_PASSWORD` also work and take precedence over the credential file. The credential file format is one literal `KEY=value` per line, without shell quotes. Passwords travel on stdin to psql, not in command arguments; prompts are masked. The helper escapes psql metacommand special characters. Each Docker subprocess has a 60-second timeout.

To repeat only the existing service-role TCP checks:

```powershell
python -u scripts/database/verify-permissions.py --development --tcp --login-only --roles dispatcher retention --credentials-file .env.database-services
```

These TCP checks use container loopback port 5432. Host port 5433 and the API pool were checked later as a separate integration task; they were not prerequisites for closing the role-permission checkpoint.

## Audit correction and regression coverage

The late type/column audit originally expanded every NULL type ACL using PostgreSQL's standalone-type default ACL. That made the seeded upgrade fail on automatically generated table-row/array types, even though the table was migrator-owned and its row permissions were correct. The first correction filtered out all types with a relation or element reference. That was too broad: a separately declared composite type also has a relation reference.

The final audit checks ownership and explicit ACLs for every application type. It expands a NULL ACL only for independent types, includes standalone composites (`pg_class.relkind = 'c'`), and identifies generated arrays using the element type's `typarray` reference. It does not infer a forbidden standalone grant from a generated table-row/array type's NULL ACL. Table and column access checks remain intact. No role permissions, grants, schema ownership or passwords were loosened by this correction.

Regression checks now accept generated row/array types and private enum/composite types, and reject runtime enum grants, PUBLIC standalone-composite grants and column-level SELECT grants. The existing drift checks still reject elevated attributes, memberships, wrong schema ownership, PUBLIC schema access and broad default grants. These tests run inside rolled-back transactions on disposable PostgreSQL.

The correction affects the catalog audit used by `006-permission-foundation.sql` and the verification runner, including the seeded-upgrade acceptance result. Earlier successful behavioral probes remain historical evidence; they did not establish that the later type/column audit was correct. The prior false-positive run is superseded by the final successful disposable regression run reported below. Type USAGE is distinct from permission to read table rows; this checkpoint does not prove tenant isolation.

## Actual results - 2026-09-24

| Check | Target | Final result |
|---|---|---|
| Fresh setup, seeded forward completion and hardening rerun | Disposable PostgreSQL 18.6 | Passed against corrected files |
| Generated/standalone type and column-grant audit regressions | Disposable PostgreSQL 18.6 | Passed |
| Role attributes, ownership, memberships, effective privileges and default ACLs | Disposable PostgreSQL 18.6 | Passed |
| All four real restricted-role SCRAM TCP connections | Disposable PostgreSQL 18.6 | Passed |
| Migrator creation, runtime initial read denial, SELECT-only grant, INSERT/ALTER/DROP/CREATE and role-switch denials | Disposable PostgreSQL 18.6 | Passed |
| Dispatcher outbox-only schema usage; retention connect-only; denied kernel access and object creation | Disposable PostgreSQL 18.6 | Passed |
| Probe cleanup, final audit and removal of the disposable container | Disposable PostgreSQL 18.6 | Passed; no persistent volumes used |
| Corrected full permission suite | Existing development database, separate socket logins | Passed; probes removed and final audit passed |
| Corrected full permission suite, all four existing credentials | Existing development database, container-loopback TCP | Passed; real logins, all permission probes, cleanup and final audit |
| Existing dispatcher/retention credential authentication | Development container-loopback TCP | Passed separately and in the final full TCP suite |
| Existing migrator/runtime credential authentication | Development container-loopback TCP | Passed using the existing credentials identified by the user; no rotation |
| Host port 5433 / API connectivity | Windows host / future API integration | Pending separately; not part of role-permission sign-off |

Docker Desktop was initially stopped; it was started and the final disposable checks ran successfully outside the filesystem sandbox after Docker pipe/config access was denied inside it. No existing credentials were rotated and the development volume was not deleted. Migrator/runtime credentials were initially unavailable in environment configuration; the user subsequently identified their existing local credential file, and both were used successfully without printing secrets. That pre-existing file is now explicitly Git-ignored and its contents were not changed. Dispatcher/retention credentials came from the existing ignored service credential file. Administrator credentials were not substituted for restricted-role credentials.

Local lint, 16 tests and API build passed in the preceding implementation run; this follow-up changes only verification and documentation and does not claim another application test run. GitHub CI status remains unconfirmed and unchanged.

The role/permission checkpoint is complete: the corrected disposable suite and the existing development socket and TCP suites all passed. No checkpoint verification blockers remain. Drizzle/node-postgres and host/API connectivity were separate follow-up work, now verified below. Table-specific grants, RLS/isolation tests, production pool sizing, dispatcher/pg-boss and retention operations remain separate future work; implementing Drizzle was not required to close this checkpoint.

## API integration follow-up - 2026-09-28

The API connected through host port 5433 using its existing runtime credential,
completed a Drizzle startup query, and closed cleanly on Ctrl+C. Incorrect
credentials and an unavailable endpoint stopped startup with a generic error.
A separate Testcontainers PostgreSQL 18.6 test passed with generated credentials:
Nest-injected Drizzle reported `event_dynamics_dev` and
`event_dynamics_runtime`, then the pool closed. This supersedes the pending
host/API row in the historical 2026-09-24 results table. It does not add
table-specific grants or establish tenant isolation.

## Official references checked

- [PostgreSQL 18 role membership](https://www.postgresql.org/docs/18/role-membership.html)
- [PostgreSQL 18 default privileges](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html)
- [PostgreSQL 18 psql](https://www.postgresql.org/docs/18/app-psql.html)
- [Docker container run](https://docs.docker.com/reference/cli/docker/container/run/)
- [Docker Compose run and port behavior](https://docs.docker.com/reference/cli/docker/compose/run/)

- [PostgreSQL 18 type catalog](https://www.postgresql.org/docs/18/catalog-pg-type.html)
- [PostgreSQL 18 privileges](https://www.postgresql.org/docs/18/ddl-priv.html)
