# Local Database Development Guide

## Purpose

Run a persistent PostgreSQL database for local Event Dynamics development.

The API currently runs on the host machine. PostgreSQL runs inside Docker.

## Prerequisites

- Docker Desktop installed and running.
- Node.js and pnpm versions matching the root package.json.
- Project dependencies installed.

Run the commands below from the repository root unless stated otherwise.

## Environment Configuration

Copy `.env.example` to `.env` and supply your local values.

The database settings are:

| Variable | Purpose |
|---|---|
| POSTGRES_USER | Initial database administrator username |
| POSTGRES_PASSWORD | Initial administrator password |
| POSTGRES_DB | Initial database name |

The current setup uses:

- Username: `event_dynamics_admin`
- Database: `event_dynamics_dev`

Keep `.env` out of Git. Commit `.env.example` with placeholders only.

These PostgreSQL variables initialize an empty data volume. Changing them
later does not automatically change existing database users, passwords,
or databases.

The API validates these settings at startup:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test` or `production` |
| `PORT` | API listening port; local example uses `3000` |
| `DATABASE_URL` | PostgreSQL connection for `event_dynamics_runtime` |
| `DB_POOL_MAX` | Maximum connections in the API runtime pool |
| `DB_CONNECTION_TIMEOUT_MS` | Finite connection and query timeout in milliseconds |

The development `DATABASE_URL` must use `event_dynamics_runtime` at
`127.0.0.1:5433/event_dynamics_dev`.
Development URLs do not accept query parameters or fragments; `pg`
can use query parameters to override connection details such as the
host or user after the URL is validated.
Keep its real password in the ignored `.env` file, not in `.env.example`.
The migrator has a different credential and owns application schemas and
migration-created objects; it is for migration commands, never the API pool.
The administrator is for bootstrap work only. Dispatcher and retention
credentials are separate and are not loaded into the API configuration.
The API currently loads `.env`; `.env.local` is not loaded automatically.

The development pool defaults to a maximum of 5 connections and a
5,000 ms connection timeout. Development allows 1–5 connections;
other environments allow 1–20. The validated timeout range is
1–30,000 ms. The API creates one runtime pool, uses this timeout for
connection and query attempts, and runs `select 1` through Drizzle
before reporting successful startup. If the check fails, startup stops
and the pool is closed. The pool also closes during normal Nest shutdown.

For production, start from `.env.production.example` and supply a real
runtime URL through deployment secrets. Production requires explicit
`DB_POOL_MAX` and `DB_CONNECTION_TIMEOUT_MS`; no local URL or credential
is suitable. The example's 5 connections and 5,000 ms timeout are
provisional per-process values, not a capacity finding. Before deploying,
budget the maximum connections across all API pools, workers and replicas,
leave headroom for administration, and size each pool from measured
transaction concurrency as required by HLD section 5.3. The production
database endpoint, credentials, replica counts and final pool budgets
have not yet been selected or tested.

## Start the Database

```powershell
pnpm db:up
```

On the first run, Docker downloads the configured PostgreSQL image and
initializes the database.

The container runs in the background after startup.

Check its status:

```powershell
docker compose ps
```

Wait until the status reports `healthy`.

## Start the API

With PostgreSQL healthy and the runtime `DATABASE_URL` set in `.env`, run
this from the repository root:

```powershell
pnpm --filter api start
```

Successful startup confirms that the API's runtime credentials connect
through host port `5433`. Press Ctrl+C to stop the API. A failed startup
reports a generic database check error without printing the URL or password.

## View Logs

```powershell
pnpm db:logs
```

This follows the database logs. Press Ctrl+C to stop following them;
the database continues running.

## Connection Details

For an administrator database client running on Windows:

| Setting | Value |
|---|---|
| Host | 127.0.0.1 |
| Port | 5433 |
| Database | event_dynamics_dev |
| Username | event_dynamics_admin |
| Password | The value in your local .env |

The port mapping is `127.0.0.1:5433:5432`:

- 5433 is the port exposed on your computer.
- 5432 is PostgreSQL's port inside the container.

The administrator account is for local setup and administration.
Restricted migrator, runtime, dispatcher and retention accounts are established.
See the [database permissions guide](database-permissions.md) for ordered setup,
role responsibilities, credentials and permission verification.

## Connect Inside the Container

The container includes the psql command-line client:

```powershell
docker compose exec event_dynamics_dev psql -U event_dynamics_admin -d event_dynamics_dev
```

Adjust the username and database name if your local values differ.

Confirm the connection:

```sql
SELECT current_database(), current_user;
```

Exit psql:

```text
\q
```

This connects inside the container. It does not verify the published
Windows port or the API's database connection.

## Stop the Database

```powershell
pnpm db:down
```

This stops and removes the Compose container and its network.
The named database volume remains.

Start it again with `pnpm db:up`.

## Persistent Storage

The Compose file declares the named volume `postgres_data`, mounted
at `/var/lib/postgresql` for PostgreSQL 18.

Docker normally prefixes the volume name with the Compose project name.

The volume stores database data independently of the container.
Removing and recreating the container with the same volume preserves
that data.

Removing the volume deletes the local database data. Do not add the
volumes-removal option to the routine db:down script.

## Persistence Verification

The following check has been completed successfully:

1. Created an ordinary persistence_probe table.
2. Inserted and read a recognizable row.
3. Removed the container using db:down, retaining the named volume.
4. Recreated the container using db:up.
5. Reconnected and confirmed that the row remained.
6. Dropped the probe table.

## Troubleshooting

- If the container is unhealthy, inspect its logs.
- If startup reports a port conflict, check whether another process
  uses host port 5433.
- If credentials were changed after initialization, remember that the
  existing volume retains the original database credentials.
- If startup stalls, capture the actual error before assuming a
  network problem.

## Test Databases

This persistent database is for manual local development.

Run the isolated API integration test from the repository root with
`pnpm --filter api test:integration`. It starts a disposable PostgreSQL
18.6 container through Testcontainers, creates a restricted runtime role,
and checks `current_database()` and `current_user` through Nest-injected
Drizzle. It uses generated test credentials and explicit test settings;
it does not load the development `.env` or touch the Compose volume.
The ordinary `pnpm test` command excludes this integration test.
