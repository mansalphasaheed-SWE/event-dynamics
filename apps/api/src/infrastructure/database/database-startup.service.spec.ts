import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { DatabasePoolService } from './database-pool.service';
import { DatabaseStartupService } from './database-startup.service';
import { DATABASE_TOKEN } from './database.tokens';

async function createStartupService() {
  const database = { execute: vi.fn() };
  const poolService = { close: vi.fn().mockResolvedValue(undefined) };

  const moduleRef = await Test.createTestingModule({
    providers: [
      DatabaseStartupService,
      { provide: DATABASE_TOKEN, useValue: database },
      { provide: DatabasePoolService, useValue: poolService },
    ],
  }).compile();

  return {
    startup: moduleRef.get(DatabaseStartupService),
    database,
    poolService,
  };
}

describe('DatabaseStartupService', () => {
  it('allows startup when the query succeeds', async () => {
    const { startup, database, poolService } = await createStartupService();
    database.execute.mockResolvedValue(undefined);

    await expect(startup.onApplicationBootstrap()).resolves.toBeUndefined();

    expect(database.execute).toHaveBeenCalledOnce();
    expect(poolService.close).not.toHaveBeenCalled();
  });

  it('closes the pool and gives a safe error when the query fails', async () => {
    const { startup, database, poolService } = await createStartupService();
    database.execute.mockRejectedValue(new Error('password=secret'));

    await expect(startup.onApplicationBootstrap()).rejects.toThrow(
      /^Database startup check failed$/,
    );

    expect(poolService.close).toHaveBeenCalledOnce();
  });
});
