import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const { Client } = pg;
const defaultFolder = fileURLToPath(new URL('../drizzle/', import.meta.url));
const lockKey = '738470622072129';

class SafeMigrationError extends Error {}

function migrationUrl() {
  const value = process.env.MIGRATION_DATABASE_URL;
  if (!value) throw new SafeMigrationError('MIGRATION_DATABASE_URL is required');

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new SafeMigrationError('MIGRATION_DATABASE_URL must be a PostgreSQL URL');
  }

  if (
    !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
    parsed.username !== 'event_dynamics_migrator' ||
    !parsed.password ||
    !parsed.hostname ||
    parsed.pathname.length < 2 ||
    parsed.search ||
    parsed.hash
  ) {
    throw new SafeMigrationError('MIGRATION_DATABASE_URL must identify the migrator and a database');
  }
  return value;
}

function migrationsFolder() {
  const fixture = process.env.MIGRATION_TEST_FOLDER;
  if (!fixture) return defaultFolder;
  if (process.env.NODE_ENV !== 'test') {
    throw new SafeMigrationError('MIGRATION_TEST_FOLDER is only available in test mode');
  }
  return resolve(fixture);
}

async function run() {
  const connectionString = migrationUrl();
  const folder = migrationsFolder();
  if (!existsSync(join(folder, 'meta', '_journal.json'))) {
    throw new SafeMigrationError('Migration journal is missing');
  }

  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 5000,
  });
  let connected = false;
  try {
    await client.connect();
    connected = true;

    const identity = await client.query('select session_user, current_user');
    if (
      identity.rows[0]?.session_user !== 'event_dynamics_migrator' ||
      identity.rows[0]?.current_user !== 'event_dynamics_migrator'
    ) {
      throw new SafeMigrationError('Migration connection is not the migrator role');
    }

    const foundation = await client.query(`
      SELECT
        (SELECT count(*)::integer FROM pg_namespace
         WHERE nspname IN ('kernel', 'outbox')
           AND nspowner = 'event_dynamics_migrator'::regrole) AS owned_schemas,
        (SELECT count(*)::integer FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'kernel'
           AND c.relname = '__drizzle_migrations'
           AND c.relowner <> 'event_dynamics_migrator'::regrole) AS wrong_history_owner
    `);
    if (
      foundation.rows[0]?.owned_schemas !== 2 ||
      foundation.rows[0]?.wrong_history_owner !== 0
    ) {
      throw new SafeMigrationError('Database provisioning or ownership is invalid');
    }

    // Drizzle ORM 0.45.3 always tries this even for an existing schema.
    // PostgreSQL requires database CREATE for it; provisioning deliberately
    // withholds that privilege from the migrator. Ownership was checked above.
    const query = client.query.bind(client);
    client.query = (statement, ...parameters) => {
      const sql = typeof statement === 'string' ? statement : statement?.text;
      if (sql === 'CREATE SCHEMA IF NOT EXISTS "kernel"') {
        return Promise.resolve({ rows: [], rowCount: 0 });
      }
      return query(statement, ...parameters);
    };

    const lock = await client.query(
      'select pg_try_advisory_lock($1::bigint) as acquired',
      [lockKey],
    );
    if (!lock.rows[0]?.acquired) {
      throw new SafeMigrationError('Another database migration is already running');
    }

    const db = drizzle({ client });
    await migrate(db, {
      migrationsFolder: folder,
      migrationsSchema: 'kernel',
      migrationsTable: '__drizzle_migrations',
    });
    process.stdout.write('Database migrations applied successfully.\n');
  } finally {
    if (connected) await client.end();
  }
}

try {
  await run();
} catch (error) {
  if (error instanceof SafeMigrationError) {
    process.stderr.write(`${error.message}\n`);
  } else {
    const source = error?.cause ?? error;
    const code =
      typeof source === 'object' &&
      source !== null &&
      'code' in source &&
      typeof source.code === 'string' &&
      /^[A-Z0-9]{5}$/.test(source.code)
        ? ` (SQLSTATE ${source.code})`
        : '';
    process.stderr.write(`Database migration failed${code}.\n`);
  }
  process.exitCode = 1;
}
