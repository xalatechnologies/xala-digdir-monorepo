/**
 * @xala/config - Types
 *
 * Generic type definitions for application configuration.
 * Platform-agnostic - domain-specific types should be defined in domain packages.
 *
 * This package uses a generic App Registry pattern to allow domain-specific
 * apps to be defined at runtime rather than hardcoded in the platform.
 */

// ============================================================================
// App Types (Generic/Platform)
// ============================================================================

/**
 * Generic app type - string-based for extensibility
 *
 * Domain-specific apps register their types at runtime.
 * For Digilist-specific types, see @digilist/runtime
 */
export type AppType = string;

/**
 * Supported locales
 */
export type SupportedLocale = 'nb' | 'en';

/**
 * Color scheme preference
 */
export type ColorScheme = 'light' | 'dark' | 'auto';

/**
 * Theme identifier (extensible)
 * Domain-specific themes should be defined in domain packages.
 */
export type ThemeId = string;

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
 * Domain-specific apps should register profiles using registerAppProfile()
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
 * Generic SDK initialization configuration
 * Domain SDKs may extend this with additional fields
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
