import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { EnvironmentVariables } from '../../env.validation';

@Injectable()
export class DatabasePoolService implements OnApplicationShutdown {
  private readonly logger = new Logger(DatabasePoolService.name);
  readonly pool: Pool;
  private closing?: Promise<void>;
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.pool = new Pool({
      connectionString: this.config.get('DATABASE_URL', { infer: true }),
      max: this.config.get('DB_POOL_MAX', { infer: true }),
      connectionTimeoutMillis: this.config.get('DB_CONNECTION_TIMEOUT_MS', {
        infer: true,
      }),
      query_timeout: this.config.get('DB_CONNECTION_TIMEOUT_MS', {
        infer: true,
      }),
    });

    this.pool.on('error', () => {
      this.logger.error('Unexpected error on an idle database connection');
    });
  }

  close(): Promise<void> {
    this.closing ??= this.pool.end();
    return this.closing;
  }
  onApplicationShutdown(): Promise<void> {
    return this.close();
  }
}
