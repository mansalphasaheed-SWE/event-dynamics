//api/src/env.validation.ts
import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    PORT: z
      .string()
      .regex(/^[0-9]+$/)
      .default('3000')
      .transform(Number)
      .pipe(z.number().int().min(1).max(65535)),
    DATABASE_URL: z.url().refine(
      (value) => {
        try {
          const url = new URL(value);
          const protocol = url.protocol.toLowerCase();

          return (
            (protocol === 'postgres:' || protocol === 'postgresql:') &&
            url.username.length > 0 &&
            url.password.length > 0 &&
            url.hostname.length > 0 &&
            url.pathname.length > 1
          );
        } catch {
          return false;
        }
      },
      {
        message:
          'Expected a PostgreSQL URL with a username, password, host, and database name',
      },
    ),
    DB_POOL_MAX: z
      .string()
      .regex(/^[0-9]+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(20)),
    DB_CONNECTION_TIMEOUT_MS: z
      .string()
      .regex(/^[0-9]+$/)
      .transform(Number)
      .pipe(z.number().int().min(1).max(30000)),
  })
  .superRefine((settings, ctx) => {
    if (settings.NODE_ENV !== 'development') return;

    if (settings.DB_POOL_MAX > 5) {
      ctx.addIssue({
        code: 'custom',
        path: ['DB_POOL_MAX'],
        message: 'Development pool maximum must not exceed 5',
      });
    }

    let url: URL;
    try {
      url = new URL(settings.DATABASE_URL);
    } catch {
      return;
    }

    if (
      url.hostname !== '127.0.0.1' ||
      url.port !== '5433' ||
      url.pathname !== '/event_dynamics_dev' ||
      url.username !== 'event_dynamics_runtime' ||
      url.search !== '' ||
      url.hash !== ''
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message:
          'Development DATABASE_URL must use the runtime role and local database',
      });
    }
  });

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  // Local and test runs use modest defaults. Production must state its pool
  // budget and timeout explicitly for each deployed process.
  const input =
    config.NODE_ENV === 'production'
      ? config
      : {
          ...config,
          DB_POOL_MAX: config.DB_POOL_MAX ?? '5',
          DB_CONNECTION_TIMEOUT_MS: config.DB_CONNECTION_TIMEOUT_MS ?? '5000',
        };
  const result = envSchema.safeParse(input);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => {
      switch (issue.path[0]) {
        case 'NODE_ENV':
          return 'NODE_ENV must be development, test, or production';
        case 'PORT':
          return 'PORT must be an integer between 1 and 65535';
        case 'DATABASE_URL':
          return config.NODE_ENV === 'production'
            ? 'DATABASE_URL must be a PostgreSQL URL with username, password, host, and database'
            : 'DATABASE_URL must be a PostgreSQL URL using event_dynamics_runtime at 127.0.0.1:5433/event_dynamics_dev in development';
        case 'DB_POOL_MAX':
          return 'DB_POOL_MAX must be an integer between 1 and 20 (at most 5 in development)';
        case 'DB_CONNECTION_TIMEOUT_MS':
          return 'DB_CONNECTION_TIMEOUT_MS must be an integer between 1 and 30000';
        default:
          return 'An application setting is invalid';
      }
    });
    throw new Error(
      `Invalid environment configuration: ${[...new Set(messages)].join('; ')}`,
    );
  }

  return result.data;
}
