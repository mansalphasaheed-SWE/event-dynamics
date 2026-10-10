import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DatabasePoolService } from './database-pool.service';
import type { Database } from './database.provider';
import { DATABASE_TOKEN } from './database.tokens';

@Injectable()
export class DatabaseStartupService implements OnApplicationBootstrap {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly database: Database,
    private readonly poolService: DatabasePoolService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.database.execute(sql`select 1`);
    } catch {
      try {
        await this.poolService.close();
      } catch {
        throw new Error('Database startup check and pool cleanup failed');
      }

      throw new Error('Database startup check failed');
    }
  }
}
