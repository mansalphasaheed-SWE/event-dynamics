import { describe, expect, it } from 'vitest';

import { validate } from './env.validation';

describe('environment validation', () => {
  it('uses defaults when settings are missing', () => {
    expect(validate({})).toEqual({
      NODE_ENV: 'development',
      PORT: 3000,
    });
  });

  it('accepts valid settings and converts the port to a number', () => {
    expect(
      validate({
        NODE_ENV: 'production',
        PORT: '8080',
      }),
    ).toEqual({
      NODE_ENV: 'production',
      PORT: 8080,
    });
  });

  it.each(['', 'staging'])('rejects invalid NODE_ENV: %j', (value) => {
    expect(() => validate({ NODE_ENV: value })).toThrow(
      'NODE_ENV must be development, test, or production',
    );
  });

  it.each(['', ' ', 'hello', '0', '-1', '3000.5', '65536'])(
    'rejects invalid PORT: %j',
    (value) => {
      expect(() => validate({ PORT: value })).toThrow(
        'PORT must be an integer between 1 and 65535',
      );
    },
  );

  it.each(['1', '65535'])('accepts boundary port %s', (value) => {
    expect(validate({ PORT: value }).PORT).toBe(Number(value));
  });

  it('does not include supplied values in error messages', () => {
    const sensitiveValue = 'example-secret-value';

    expect(() => validate({ PORT: sensitiveValue })).toThrow(
      'PORT must be an integer between 1 and 65535',
    );

    expect(() => validate({ PORT: sensitiveValue })).not.toThrow(
      sensitiveValue,
    );
  });
});
