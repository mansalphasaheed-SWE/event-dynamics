import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { DatabaseModule } from './database.module';
import { DatabasePoolService } from './database-pool.service';
import type { Database } from './database.provider';
import { DATABASE_TOKEN } from './database.tokens';

describe('DatabaseModule', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('resolves Drizzle using the pool owned by DatabasePoolService', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const database = moduleRef.get<Database>(DATABASE_TOKEN);
    const poolService = moduleRef
      .select(DatabaseModule)
      .get(DatabasePoolService, { strict: true });

    expect(database.$client).toBe(poolService.pool);
  });

  it('closes the pool when the application closes', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DATABASE_TOKEN)
      .useValue({ execute: vi.fn().mockResolvedValue(undefined) })
      .compile();

    const poolService = moduleRef
      .select(DatabaseModule)
      .get(DatabasePoolService, { strict: true });
    const end = vi.spyOn(poolService.pool, 'end');

    const app = moduleRef.createNestApplication();
    await app.init();
    await app.close();

    expect(end).toHaveBeenCalledOnce();
  });
});
