/**
 * @xala/config - Environment Schema Tests
 *
 * Tests for environment variable validation using Zod
 */
import { describe, it, expect } from 'vitest';
import {
  validateEnv,
  safeValidateEnv,
  assertEnv,
  getDevEnvConfig,
  mergeWithDefaults,
  envSchema,
} from '@xala/config';

describe('@xala/config env-schema', () => {
  describe('envSchema', () => {
    it('should parse valid environment variables', () => {
      const result = envSchema.safeParse({
        VITE_API_URL: 'https://api.example.com',
        VITE_TENANT_ID: 'test-tenant',
        VITE_LICENSE_KEY: 'test-key',
        MODE: 'development',
        DEV: true,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.VITE_API_URL).toBe('https://api.example.com');
        expect(result.data.VITE_TENANT_ID).toBe('test-tenant');
      }
    });

    it('should use defaults for optional fields', () => {
      const result = envSchema.safeParse({});

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.VITE_API_URL).toBe('https://api.digilist.no');
        expect(result.data.VITE_TENANT_ID).toBe('default');
        expect(result.data.VITE_LICENSE_KEY).toBe('dev-key');
        expect(result.data.MODE).toBe('development');
      }
    });

    it('should reject invalid URL for VITE_API_URL', () => {
      const result = envSchema.safeParse({
        VITE_API_URL: 'not-a-url',
      });

      expect(result.success).toBe(false);
    });

    it('should accept valid Sentry DSN', () => {
      const result = envSchema.safeParse({
        VITE_SENTRY_DSN: 'https://sentry.io/1234',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid Sentry DSN', () => {
      const result = envSchema.safeParse({
        VITE_SENTRY_DSN: 'not-a-url',
      });

      expect(result.success).toBe(false);
    });

    it('should accept all valid modes', () => {
      for (const mode of ['development', 'staging', 'production']) {
        const result = envSchema.safeParse({ MODE: mode });
        expect(result.success).toBe(true);
      }
    });

    it('should handle DEV as string "true"', () => {
      const result = envSchema.safeParse({
        DEV: 'true',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.DEV).toBe(true);
      }
    });
  });

  describe('validateEnv', () => {
    it('should return typed EnvConfig from valid input', () => {
      const env = validateEnv({
        VITE_API_URL: 'https://api.example.com',
        VITE_WS_URL: 'wss://api.example.com/ws',
        VITE_TENANT_ID: 'oslo-kommune',
        VITE_LICENSE_KEY: 'prod-key',
        MODE: 'production',
        DEV: false,
      });

      expect(env.apiUrl).toBe('https://api.example.com');
      expect(env.wsUrl).toBe('wss://api.example.com/ws');
      expect(env.tenantId).toBe('oslo-kommune');
      expect(env.licenseKey).toBe('prod-key');
      expect(env.mode).toBe('production');
      expect(env.debug).toBe(false);
    });

    it('should throw ZodError on invalid input', () => {
      expect(() =>
        validateEnv({
          VITE_API_URL: 'invalid-url',
        })
      ).toThrow();
    });

    it('should use defaults with empty input', () => {
      const env = validateEnv({});

      expect(env.apiUrl).toBe('https://api.digilist.no');
      expect(env.tenantId).toBe('default');
      expect(env.licenseKey).toBe('dev-key');
      expect(env.mode).toBe('development');
      expect(env.debug).toBe(true);
    });
  });

  describe('safeValidateEnv', () => {
    it('should return success with valid data', () => {
      const result = safeValidateEnv({
        VITE_API_URL: 'https://api.example.com',
        VITE_TENANT_ID: 'test-tenant',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.apiUrl).toBe('https://api.example.com');
        expect(result.data.tenantId).toBe('test-tenant');
      }
    });

    it('should return errors array on invalid data', () => {
      const result = safeValidateEnv({
        VITE_API_URL: 'not-a-url',
        VITE_SENTRY_DSN: 'also-not-a-url',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some((e) => e.includes('VITE_API_URL'))).toBe(true);
      }
    });
  });

  describe('assertEnv', () => {
    it('should return EnvConfig on valid input', () => {
      const env = assertEnv({
        VITE_API_URL: 'https://api.example.com',
      });

      expect(env.apiUrl).toBe('https://api.example.com');
    });

    it('should throw formatted error on invalid input', () => {
      expect(() =>
        assertEnv({
          VITE_API_URL: 'invalid-url',
        })
      ).toThrow('Invalid environment configuration');
    });

    it('should include helpful message in error', () => {
      try {
        assertEnv({
          VITE_API_URL: 'invalid-url',
        });
        expect.fail('Should have thrown');
      } catch (e) {
        const error = e as Error;
        expect(error.message).toContain('Check your .env file');
      }
    });
  });

  describe('getDevEnvConfig', () => {
    it('should return default development config', () => {
      const config = getDevEnvConfig();

      expect(config.apiUrl).toBe('https://api.digilist.no');
      expect(config.wsUrl).toBe('wss://api.digilist.no/ws');
      expect(config.tenantId).toBe('default');
      expect(config.licenseKey).toBe('dev-key');
      expect(config.mode).toBe('development');
      expect(config.debug).toBe(true);
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge partial config with defaults', () => {
      const config = mergeWithDefaults({
        apiUrl: 'https://custom-api.com',
        tenantId: 'custom-tenant',
      });

      expect(config.apiUrl).toBe('https://custom-api.com');
      expect(config.tenantId).toBe('custom-tenant');
      // Defaults preserved
      expect(config.wsUrl).toBe('wss://api.digilist.no/ws');
      expect(config.licenseKey).toBe('dev-key');
      expect(config.mode).toBe('development');
      expect(config.debug).toBe(true);
    });

    it('should override all fields when provided', () => {
      const config = mergeWithDefaults({
        apiUrl: 'https://custom-api.com',
        wsUrl: 'wss://custom-api.com/ws',
        tenantId: 'custom-tenant',
        licenseKey: 'custom-key',
        mode: 'production',
        debug: false,
      });

      expect(config.apiUrl).toBe('https://custom-api.com');
      expect(config.wsUrl).toBe('wss://custom-api.com/ws');
      expect(config.tenantId).toBe('custom-tenant');
      expect(config.licenseKey).toBe('custom-key');
      expect(config.mode).toBe('production');
      expect(config.debug).toBe(false);
    });

    it('should return defaults when called with empty object', () => {
      const config = mergeWithDefaults({});
      const defaults = getDevEnvConfig();

      expect(config).toEqual(defaults);
    });
  });
});
