import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: import.meta.dirname,
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
      module: {
        type: 'es6',
      },
    }),
  ],
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.integration-spec.ts'],
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
