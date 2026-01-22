/**
 * @digilist/runtime - Environment Validation
 *
 * Validates and provides type-safe access to environment variables.
 */

// ============================================================================
// Environment Types
// ============================================================================

export interface ValidatedEnv {
  VITE_API_URL: string;
  VITE_PLATFORM_API_URL?: string;
  VITE_WS_URL?: string;
  VITE_TENANT_ID?: string;
  VITE_GOOGLE_MAPS_API_KEY?: string;
  VITE_ENABLE_MSW?: boolean;
  NODE_ENV: 'development' | 'production' | 'test';
  DEV: boolean;
  PROD: boolean;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate and extract environment variables
 */
export function validateEnv(env: Record<string, unknown>): ValidatedEnv {
  const apiUrl = env.VITE_API_URL as string;

  if (!apiUrl) {
    console.warn('[validateEnv] VITE_API_URL not set, using default');
  }

  return {
    VITE_API_URL: apiUrl || 'http://localhost:4000',
    VITE_PLATFORM_API_URL: env.VITE_PLATFORM_API_URL as string | undefined,
    VITE_WS_URL: env.VITE_WS_URL as string | undefined,
    VITE_TENANT_ID: env.VITE_TENANT_ID as string | undefined,
    VITE_GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY as string | undefined,
    VITE_ENABLE_MSW: env.VITE_ENABLE_MSW === 'true',
    NODE_ENV: (env.NODE_ENV as string || 'development') as 'development' | 'production' | 'test',
    DEV: env.DEV === true || env.MODE === 'development',
    PROD: env.PROD === true || env.MODE === 'production',
  };
}
