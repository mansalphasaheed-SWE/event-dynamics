import 'reflect-metadata';
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL =
  'postgresql://event_dynamics_runtime:test-only@127.0.0.1:5433/event_dynamics_dev';
