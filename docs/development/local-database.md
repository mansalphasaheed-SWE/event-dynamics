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

The API also uses NODE_ENV and PORT, validated at startup.

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

## View Logs

```powershell
pnpm db:logs
```

This follows the database logs. Press Ctrl+C to stop following them;
the database continues running.

## Connection Details

For a database client running on Windows:

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
credentials, verified access and remaining connection checks.

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

Automated database integration tests will use separate, disposable
PostgreSQL containers through Testcontainers.