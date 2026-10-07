import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const lockKey = '738470622072129';
const runner = resolve(import.meta.dirname, '../scripts/migrate.mjs');
const fixtures = resolve(import.meta.dirname, 'fixtures/migrations');

type CommandResult = { code: number | null; stdout: string; stderr: string };

function runMigration(
  url: string,
  fixture: string,
  entryPoint: 'runner' | 'root-script' = 'runner',
): Promise<CommandResult> {
  return new Promise((resolveResult, reject) => {
    const rootScript = entryPoint === 'root-script';
    const child = spawn(
      rootScript ? 'pnpm' : process.execPath,
      rootScript ? ['db:migrate'] : [runner],
      {
        cwd: resolve(import.meta.dirname, rootScript ? '../../..' : '..'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          MIGRATION_DATABASE_URL: url,
          MIGRATION_TEST_FOLDER: resolve(fixtures, fixture),
        },
        windowsHide: true,
        shell: rootScript && process.platform === 'win32',
      },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => resolveResult({ code, stdout, stderr }));
  });
}

describe('standalone database migrations', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let admin: Client;
  let migratorUrl: string;
  let runtimeUrl: string;
  let dispatcherUrl: string;
  let retentionUrl: string;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:18.6-bookworm')
      .withDatabase('event_dynamics_dev')
      .withUsername('event_dynamics_admin')
      .withPassword(randomBytes(24).toString('hex'))
      .start();
    admin = new Client({ connectionString: container.getConnectionUri() });
    await admin.connect();

    const roleUrls = new Map<string, string>();
    for (const role of [
      'event_dynamics_migrator',
      'event_dynamics_runtime',
      'event_dynamics_dispatcher',
      'event_dynamics_retention',
    ]) {
      const password = randomBytes(24).toString('hex');
      const statement = await admin.query<{ ddl: string }>(
        `SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L', $1::text, $2::text) AS ddl`,
        [role, password],
      );
      await admin.query(statement.rows[0].ddl);
      const url = new URL(container.getConnectionUri());
      url.username = role;
      url.password = password;
      roleUrls.set(role, url.toString());
    }
    migratorUrl = roleUrls.get('event_dynamics_migrator')!;
    runtimeUrl = roleUrls.get('event_dynamics_runtime')!;
    dispatcherUrl = roleUrls.get('event_dynamics_dispatcher')!;
    retentionUrl = roleUrls.get('event_dynamics_retention')!;

    await admin.query(
      'REVOKE CONNECT ON DATABASE event_dynamics_dev FROM PUBLIC',
    );
    await admin.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC');
    await admin.query(
      'GRANT CONNECT ON DATABASE event_dynamics_dev TO event_dynamics_migrator, event_dynamics_runtime, event_dynamics_dispatcher, event_dynamics_retention',
    );
    await admin.query(
      'CREATE SCHEMA kernel AUTHORIZATION event_dynamics_migrator',
    );
    await admin.query(
      'CREATE SCHEMA outbox AUTHORIZATION event_dynamics_migrator',
    );
    await admin.query('GRANT USAGE ON SCHEMA kernel TO event_dynamics_runtime');
    await admin.query(
      'GRANT USAGE ON SCHEMA outbox TO event_dynamics_dispatcher',
    );
  }, 120_000);

  afterAll(async () => {
    try {
      await admin?.end();
    } finally {
      await container?.stop();
    }
  }, 120_000);

  it('applies ordered migrations once, records history, and owns objects as migrator', async () => {
    const first = await runMigration(migratorUrl, 'success', 'root-script');
    expect(first).toMatchObject({ code: 0, stderr: '' });
    const objects = await admin.query<{
      relname: string;
      owner: string;
    }>(`SELECT c.relname, pg_get_userbyid(c.relowner) AS owner
       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'kernel' AND c.relname IN
       ('migration_fixture_first', 'migration_fixture_second', '__drizzle_migrations')
       ORDER BY c.relname`);
    expect(objects.rows).toEqual([
      { relname: '__drizzle_migrations', owner: 'event_dynamics_migrator' },
      { relname: 'migration_fixture_first', owner: 'event_dynamics_migrator' },
      { relname: 'migration_fixture_second', owner: 'event_dynamics_migrator' },
    ]);
    const history = await admin.query<{ count: string }>(
      'SELECT count(*) FROM kernel.__drizzle_migrations',
    );
    expect(history.rows[0].count).toBe('2');

    const second = await runMigration(migratorUrl, 'success', 'root-script');
    expect(second).toMatchObject({ code: 0, stderr: '' });
    const repeatedHistory = await admin.query<{ count: string }>(
      'SELECT count(*) FROM kernel.__drizzle_migrations',
    );
    expect(repeatedHistory.rows[0].count).toBe('2');
  });

  it('refuses a changed schema owner before the Drizzle schema exception', async () => {
    await admin.query('ALTER SCHEMA kernel OWNER TO event_dynamics_admin');
    try {
      const result = await runMigration(migratorUrl, 'success');
      expect(result.code).not.toBe(0);
      expect(result.stderr).toContain(
        'Database provisioning or ownership is invalid',
      );
    } finally {
      await admin.query('ALTER SCHEMA kernel OWNER TO event_dynamics_migrator');
    }
  });

  it('rolls back the whole pending batch when a migration fails', async () => {
    const result = await runMigration(migratorUrl, 'failure');
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('Database migration failed');
    expect(result.stderr).not.toContain(migratorUrl);
    const state = await admin.query<{
      count: string;
      pending: string | null;
      failed: string | null;
    }>(`SELECT (SELECT count(*) FROM kernel.__drizzle_migrations)::text AS count,
       to_regclass('kernel.migration_fixture_pending')::text AS pending,
       to_regclass('kernel.migration_fixture_failed')::text AS failed`);
    expect(state.rows[0]).toEqual({ count: '2', pending: null, failed: null });
  });

  it('rejects a competing run while the first owns the advisory lock', async () => {
    const first = runMigration(migratorUrl, 'concurrent');
    let locked = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const probe = await admin.query<{ acquired: boolean }>(
        'SELECT pg_try_advisory_lock($1::bigint) AS acquired',
        [lockKey],
      );
      if (!probe.rows[0].acquired) {
        locked = true;
        break;
      }
      await admin.query('SELECT pg_advisory_unlock($1::bigint)', [lockKey]);
      await delay(50);
    }
    expect(locked).toBe(true);
    const second = await runMigration(migratorUrl, 'concurrent');
    expect(second.code).not.toBe(0);
    expect(second.stderr).toContain(
      'Another database migration is already running',
    );
    expect((await first).code).toBe(0);
    const state = await admin.query<{ count: string; slow: string | null }>(
      `SELECT (SELECT count(*) FROM kernel.__drizzle_migrations)::text AS count,
       to_regclass('kernel.migration_fixture_slow')::text AS slow`,
    );
    expect(state.rows[0]).toEqual({
      count: '3',
      slow: 'kernel.migration_fixture_slow',
    });
  }, 30_000);

  it.each([
    ['runtime', () => runtimeUrl],
    ['dispatcher', () => dispatcherUrl],
    ['retention', () => retentionUrl],
  ])('denies migration-history changes as %s', async (_role, getUrl) => {
    const client = new Client({ connectionString: getUrl() });
    await client.connect();
    try {
      await expect(
        client.query('UPDATE kernel.__drizzle_migrations SET hash = hash'),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await client.end();
    }
  });
});
