/**
 * @xala/config - Environment Schema
 *
 * Zod validation schema for environment variables.
 * Validates at startup to catch configuration errors early.
 */

import { z } from 'zod';
import type { EnvConfig } from './types';

// ============================================================================
// Zod Schema Definition
// ============================================================================

/**
 * Environment variable schema with validation and defaults
 */
export const envSchema = z.object({
  /**
   * API base URL (required)
   * @example "https://api.digilist.no"
   */
  VITE_API_URL: z
    .string()
    .url('VITE_API_URL must be a valid URL')
    .default('https://api.digilist.no'),

  /**
   * WebSocket URL (optional)
   * @example "wss://api.digilist.no/ws"
   */
  VITE_WS_URL: z
    .string()
    .url('VITE_WS_URL must be a valid URL')
    .optional(),

  /**
   * Tenant ID (required)
   * @example "f47ac10b-58cc-4372-a567-0e02b2c3d479"
   */
  VITE_TENANT_ID: z
    .string()
    .min(1, 'VITE_TENANT_ID is required')
    .default('default'),

  /**
   * License key (required for production)
   * @example "prod-key-abc123"
   */
  VITE_LICENSE_KEY: z
    .string()
    .default('dev-key'),

  /**
   * Sentry DSN for error tracking (optional)
   */
  VITE_SENTRY_DSN: z
    .string()
    .url('VITE_SENTRY_DSN must be a valid URL')
    .optional(),

  /**
   * Node environment mode
   */
  MODE: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  /**
   * Development mode flag
   */
  DEV: z
    .boolean()
    .or(z.string().transform((v) => v === 'true'))
    .default(true),
});

// Inferred type from schema
export type EnvSchemaType = z.infer<typeof envSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates environment variables and returns typed config
 *
 * @param env - Raw environment variables (import.meta.env)
 * @returns Validated EnvConfig
 * @throws ZodError if validation fails
 *
 * @example
 * ```typescript
 * const env = validateEnv(import.meta.env);
 * console.log(env.apiUrl); // Typed!
 * ```
 */
export function validateEnv(env: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.parse(env);

  return {
    apiUrl: parsed.VITE_API_URL,
    wsUrl: parsed.VITE_WS_URL,
    tenantId: parsed.VITE_TENANT_ID,
    licenseKey: parsed.VITE_LICENSE_KEY,
    sentryDsn: parsed.VITE_SENTRY_DSN,
    mode: parsed.MODE as EnvConfig['mode'],
    debug: parsed.DEV === true,
  };
}

/**
 * Safely validates environment variables, returning errors instead of throwing
 *
 * @param env - Raw environment variables
 * @returns Success with EnvConfig or failure with error messages
 *
 * @example
 * ```typescript
 * const result = safeValidateEnv(import.meta.env);
 * if (result.success) {
 *   console.log(result.data.apiUrl);
 * } else {
 *   console.error('Env errors:', result.errors);
 * }
 * ```
 */
export function safeValidateEnv(
  env: Record<string, unknown>
): { success: true; data: EnvConfig } | { success: false; errors: string[] } {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.errors.map(
      (e) => `${e.path.join('.')}: ${e.message}`
    );
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      apiUrl: result.data.VITE_API_URL,
      wsUrl: result.data.VITE_WS_URL,
      tenantId: result.data.VITE_TENANT_ID,
      licenseKey: result.data.VITE_LICENSE_KEY,
      sentryDsn: result.data.VITE_SENTRY_DSN,
      mode: result.data.MODE as EnvConfig['mode'],
      debug: result.data.DEV === true,
    },
  };
}

/**
 * Asserts environment is valid, throwing with helpful message if not
 *
 * @param env - Raw environment variables
 * @throws Error with formatted validation errors
 */
export function assertEnv(env: Record<string, unknown>): EnvConfig {
  const result = safeValidateEnv(env);

  if (!result.success) {
    const errorMsg = [
      'Invalid environment configuration:',
      ...result.errors.map((e) => `  - ${e}`),
      '',
      'Check your .env file or environment variables.',
    ].join('\n');

    throw new Error(errorMsg);
  }

  return result.data;
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Get default development environment config
 * Use for local development without .env file
 */
export function getDevEnvConfig(): EnvConfig {
  return {
    apiUrl: 'https://api.digilist.no',
    wsUrl: 'wss://api.digilist.no/ws',
    tenantId: 'default',
    licenseKey: 'dev-key',
    mode: 'development',
    debug: true,
  };
}

/**
 * Merge environment with defaults
 * Useful for partial env configs
 */
export function mergeWithDefaults(
  partial: Partial<EnvConfig>
): EnvConfig {
  const defaults = getDevEnvConfig();
  return { ...defaults, ...partial };
}
