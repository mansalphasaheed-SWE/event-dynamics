//src/infrastructure/database/database.provider.ts
import type { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabasePoolService } from './database-pool.service';
import { DATABASE_TOKEN } from './database.tokens';

export type Database = ReturnType<typeof drizzle>;

export const databaseProvider: Provider<Database> = {
  provide: DATABASE_TOKEN,
  inject: [DatabasePoolService],
  useFactory: (poolService: DatabasePoolService): Database =>
    drizzle({ client: poolService.pool }),
};
