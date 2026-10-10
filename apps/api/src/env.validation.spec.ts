import { describe, expect, it } from 'vitest';

import { validate } from './env.validation';

const developmentUrl =
  'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev';

describe('environment validation', () => {
  it('requires DATABASE_URL while defaulting other settings', () => {
    expect(() => validate({})).toThrow('DATABASE_URL');
    expect(validate({ DATABASE_URL: developmentUrl })).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: developmentUrl,
      DB_POOL_MAX: 5,
      DB_CONNECTION_TIMEOUT_MS: 5000,
    });
  });

  it('accepts a different database host outside development', () => {
    expect(
      validate({
        NODE_ENV: 'production',
        PORT: '8080',
        DATABASE_URL: 'postgres://app:test-only@db.example:5432/app',
        DB_POOL_MAX: '20',
        DB_CONNECTION_TIMEOUT_MS: '30000',
      }),
    ).toMatchObject({
      PORT: 8080,
      DB_POOL_MAX: 20,
      DB_CONNECTION_TIMEOUT_MS: 30000,
    });
  });

  it('requires explicit pool settings in production', () => {
    const production = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://app:test-only@db.example:5432/app',
    };
    expect(() => validate(production)).toThrow('DB_POOL_MAX');
    expect(() => validate({ ...production, DB_POOL_MAX: '5' })).toThrow(
      'DB_CONNECTION_TIMEOUT_MS',
    );
  });

  it.each(['', 'staging'])('rejects invalid NODE_ENV: %j', (value) => {
    expect(() =>
      validate({ NODE_ENV: value, DATABASE_URL: developmentUrl }),
    ).toThrow('NODE_ENV must be development, test, or production');
  });

  it.each(['', ' ', 'hello', '0', '-1', '3000.5', '65536'])(
    'rejects invalid PORT: %j',
    (value) => {
      expect(() =>
        validate({ PORT: value, DATABASE_URL: developmentUrl }),
      ).toThrow('PORT must be an integer between 1 and 65535');
    },
  );

  it.each(['1', '65535'])('accepts boundary port %s', (value) => {
    expect(validate({ PORT: value, DATABASE_URL: developmentUrl }).PORT).toBe(
      Number(value),
    );
  });

  it.each([
    'https://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev',
    'postgresql://event_dynamics_admin:test-only@127.0.0.1:5433/event_dynamics_dev',
    'postgresql://event_dynamics_runtime:test-only@localhost:5433/event_dynamics_dev',
    'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5432/event_dynamics_dev',
    'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/other',
    'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev?host=remote.example',
    'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev?user=event_dynamics_admin',
    'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev#fragment',
  ])('rejects an unsuitable development database URL', (value) => {
    expect(() => validate({ DATABASE_URL: value })).toThrow('DATABASE_URL');
  });

  it.each(['', '0', '6', '1.5', '1e0', 'bad'])(
    'rejects invalid development DB_POOL_MAX: %j',
    (value) => {
      expect(() =>
        validate({ DATABASE_URL: developmentUrl, DB_POOL_MAX: value }),
      ).toThrow('DB_POOL_MAX');
    },
  );

  it.each(['', '0', '30001', '1.5', '1e3', 'bad'])(
    'rejects invalid DB_CONNECTION_TIMEOUT_MS: %j',
    (value) => {
      expect(() =>
        validate({
          DATABASE_URL: developmentUrl,
          DB_CONNECTION_TIMEOUT_MS: value,
        }),
      ).toThrow('DB_CONNECTION_TIMEOUT_MS');
    },
  );

  it('never includes supplied values in validation errors', () => {
    const sensitiveValue = 'example-secret-value';
    for (const config of [
      { PORT: sensitiveValue, DATABASE_URL: developmentUrl },
      {
        DATABASE_URL: `postgresql://event_dynamics_runtime:${sensitiveValue}@wrong:5433/event_dynamics_dev`,
      },
      { DATABASE_URL: developmentUrl, DB_POOL_MAX: sensitiveValue },
      {
        DATABASE_URL: developmentUrl,
        DB_CONNECTION_TIMEOUT_MS: sensitiveValue,
      },
    ]) {
      expect(() => validate(config)).not.toThrow(sensitiveValue);
    }
  });
});
