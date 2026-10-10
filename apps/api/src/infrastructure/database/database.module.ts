import { Module } from '@nestjs/common';
import { DatabasePoolService } from './database-pool.service';
import { databaseProvider } from './database.provider';
import { DATABASE_TOKEN } from './database.tokens';
import { DatabaseStartupService } from './database-startup.service';
@Module({
  providers: [DatabasePoolService, databaseProvider, DatabaseStartupService],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
