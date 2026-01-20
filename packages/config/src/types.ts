/**
 * @xala/config - Types
 *
 * Centralized type definitions for application configuration
 */

// ============================================================================
// App Types
// ============================================================================

/**
 * Supported application types in the Xala/Digilist Platform
 */
export type AppType =
  | 'web'
  | 'minside'
  | 'backoffice'
  | 'saas-admin'
  | 'monitoring'
  | 'docs-learning';

/**
 * Supported locales
 */
export type SupportedLocale = 'nb' | 'en';

/**
 * Color scheme preference
 */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Theme identifier
 */
export type ThemeId = 'digilist' | 'altinn';

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Validated environment variables
 */
export interface EnvConfig {
  /** API base URL */
  apiUrl: string;

  /** WebSocket URL (optional) */
  wsUrl?: string;

  /** Tenant ID */
  tenantId: string;

  /** License key */
  licenseKey: string;

  /** Environment mode */
  mode: 'development' | 'staging' | 'production';

  /** Debug mode enabled */
  debug: boolean;

  /** Sentry DSN (optional) */
  sentryDsn?: string;
}

// ============================================================================
// App Profile Configuration
// ============================================================================

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Path to login page */
  loginPath: string;

  /** Enable debug logging */
  debug: boolean;

  /** Session check interval in ms */
  sessionCheckInterval: number;

  /** Require authentication for all routes */
  requireAuth: boolean;
}

/**
 * App profile - static configuration for each app
 */
export interface AppProfile {
  /** App identifier */
  appType: AppType;

  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Default port for development */
  defaultPort: number;

  /** Default locale */
  locale: SupportedLocale;

  /** Theme */
  theme: ThemeId;

  /** Color scheme */
  colorScheme: ColorScheme;

  /** Auth configuration */
  authConfig: AuthConfig;

  /** Feature flags (static defaults) */
  featureFlags: Record<string, boolean>;

  /** App-specific metadata */
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Runtime Configuration (passed to RuntimeProvider)
// ============================================================================

/**
 * Configuration passed to RuntimeProvider
 * Combines AppProfile with environment-specific values
 */
export interface RuntimeConfig {
  /** App type identifier */
  appType: AppType;

  /** API base URL */
  apiUrl: string;

  /** WebSocket URL */
  wsUrl?: string;

  /** Tenant ID */
  tenantId: string;

  /** License key */
  licenseKey: string;

  /** Locale */
  locale: SupportedLocale;

  /** Theme */
  theme: ThemeId;

  /** Color scheme */
  colorScheme: ColorScheme;

  /** Auth configuration */
  authConfig: AuthConfig;

  /** Feature flags */
  featureFlags?: Record<string, boolean>;

  /** Callbacks */
  onAuthError?: (error: Error) => void;
  onRealtimeDisconnect?: () => void;
}

// ============================================================================
// SDK Initialization Configuration
// ============================================================================

/**
 * Configuration for SDK initialization
 */
export interface SDKConfig {
  /** API base URL */
  baseUrl: string;

  /** Tenant ID */
  tenantId: string;

  /** License key */
  licenseKey: string;

  /** Custom headers */
  headers?: Record<string, string>;
}
