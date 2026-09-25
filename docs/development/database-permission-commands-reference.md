# Database Role Command Reference

For setup ordering and executable pass/fail checks, use the
[database permissions guide](database-permissions.md).
The examples below are manual inspection helpers, not the acceptance suite.

Replace `ROLE_NAME`, `FILE_NAME.sql` and `SCHEMA_NAME` with the relevant values.
Run PowerShell commands from the repository root.

## Copy a SQL File into the Container — PowerShell

```powershell
docker compose cp ./scripts/database/FILE_NAME.sql event_dynamics_dev:/tmp/FILE_NAME.sql
```

## Execute a SQL File as Administrator — PowerShell

```powershell
docker compose exec event_dynamics_dev psql -U event_dynamics_admin -d event_dynamics_dev -f /tmp/FILE_NAME.sql
```

## Open an Administrator Session — PowerShell

```powershell
docker compose exec event_dynamics_dev psql -U event_dynamics_admin -d event_dynamics_dev
```

## Set a Role’s Password — psql

```text
\password ROLE_NAME
```

## Inspect a Role’s Attributes — SQL in psql

```sql
SELECT
  rolname,
  rolcanlogin,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolreplication,
  rolbypassrls
FROM pg_roles
WHERE rolname = 'ROLE_NAME';
```

## Connect as a Role over TCP — PowerShell

```powershell
docker compose exec event_dynamics_dev psql -h 127.0.0.1 -p 5432 -U ROLE_NAME -d event_dynamics_dev -W
```

## Confirm the Database and Connected Identity — SQL in psql

```sql
SELECT current_database(), session_user, current_user;
```

## Inspect Schema Ownership — SQL in psql

```sql
SELECT
  nspname AS schema_name,
  pg_get_userbyid(nspowner) AS owner
FROM pg_namespace
WHERE nspname IN ('kernel', 'outbox')
ORDER BY nspname;
```

## Check a Role’s Database Permissions — SQL in psql

```sql
SELECT
  has_database_privilege(
    'ROLE_NAME', 'event_dynamics_dev', 'CONNECT'
  ) AS can_connect,
  has_database_privilege(
    'ROLE_NAME', 'event_dynamics_dev', 'CREATE'
  ) AS can_create_schemas;
```

## Check a Role’s Schema Permissions — SQL in psql

```sql
SELECT
  has_schema_privilege(
    'ROLE_NAME', 'SCHEMA_NAME', 'USAGE'
  ) AS can_use_schema,
  has_schema_privilege(
    'ROLE_NAME', 'SCHEMA_NAME', 'CREATE'
  ) AS can_create_objects;
```

## Test Table Creation and Undo the Probe — SQL in psql

Run as the role being tested, in a schema where it should have CREATE permission.

```sql
BEGIN;

CREATE TABLE SCHEMA_NAME.permission_probe (
  id integer PRIMARY KEY,
  message text NOT NULL
);

INSERT INTO SCHEMA_NAME.permission_probe (id, message)
VALUES (1, 'Permission check');

SELECT * FROM SCHEMA_NAME.permission_probe;

ROLLBACK;
```

## Exit psql — psql

```text
\q
```