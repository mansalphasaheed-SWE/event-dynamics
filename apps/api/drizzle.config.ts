import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema.ts',
  out: './drizzle',
  migrations: {
    schema: 'kernel',
    table: '__drizzle_migrations',
  },
});
