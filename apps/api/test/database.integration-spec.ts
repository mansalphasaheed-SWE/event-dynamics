import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { sql } from 'drizzle-orm';
import { Client } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DatabaseModule } from '../src/infrastructure/database/database.module';
import { DatabasePoolService } from '../src/infrastructure/database/database-pool.service';
import type { Database } from '../src/infrastructure/database/database.provider';
import { DATABASE_TOKEN } from '../src/infrastructure/database/database.tokens';

describe('API database integration', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let app: INestApplication | undefined;

  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    DB_CONNECTION_TIMEOUT_MS: process.env.DB_CONNECTION_TIMEOUT_MS,
  };

  beforeAll(async () => {
    const adminPassword = randomBytes(24).toString('hex');
    const runtimePassword = randomBytes(24).toString('hex');

    container = await new PostgreSqlContainer('postgres:18.6-bookworm')
      .withDatabase('event_dynamics_dev')
      .withUsername('event_dynamics_admin')
      .withPassword(adminPassword)
      .start();

    const admin = new Client({
      connectionString: container.getConnectionUri(),
    });
    await admin.connect();

    try {
      const statement = await admin.query<{ ddl: string }>(
        `SELECT format(
          'CREATE ROLE event_dynamics_runtime LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD %L',
          $1::text
        ) AS ddl`,
        [runtimePassword],
      );
      await admin.query(statement.rows[0].ddl);
      await admin.query(
        'REVOKE CONNECT ON DATABASE event_dynamics_dev FROM PUBLIC',
      );
      await admin.query(
        'GRANT CONNECT ON DATABASE event_dynamics_dev TO event_dynamics_runtime',
      );
    } finally {
      await admin.end();
    }

    const runtimeUrl = new URL(container.getConnectionUri());
    runtimeUrl.username = 'event_dynamics_runtime';
    runtimeUrl.password = runtimePassword;

    process.env.NODE_ENV = 'test';
    process.env.PORT = '3000';
    process.env.DATABASE_URL = runtimeUrl.toString();
    process.env.DB_POOL_MAX = '2';
    process.env.DB_CONNECTION_TIMEOUT_MS = '5000';

    // Import only after setting NODE_ENV=test, so AppModule ignores .env.
    const { AppModule } =
      (await import('../src/app.module')) as typeof import('../src/app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    try {
      await app?.close();
    } finally {
      try {
        await container?.stop();
      } finally {
        for (const [name, value] of Object.entries(previousEnv)) {
          if (value === undefined) delete process.env[name];
          else process.env[name] = value;
        }
      }
    }
  });

  it('queries PostgreSQL as the restricted runtime role and closes the pool', async () => {
    if (!app) throw new Error('Test application did not initialize');

    const database = app.get<Database>(DATABASE_TOKEN);
    const result = await database.execute(
      sql`select current_database() as database_name, current_user as role_name`,
    );

    expect(result.rows[0]).toEqual({
      database_name: 'event_dynamics_dev',
      role_name: 'event_dynamics_runtime',
    });

    const poolService = app
      .select(DatabaseModule)
      .get(DatabasePoolService, { strict: true });

    await app.close();
    app = undefined;

    expect(poolService.pool.totalCount).toBe(0);
  });
});
