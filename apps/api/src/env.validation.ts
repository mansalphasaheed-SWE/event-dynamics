//api/src/env.validation.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z
    .string()
    .regex(/^[0-9]+$/)
    .default('3000')
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535)),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => {
      switch (issue.path[0]) {
        case 'NODE_ENV':
          return 'NODE_ENV must be development, test, or production';
        case 'PORT':
          return 'PORT must be an integer between 1 and 65535';
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
