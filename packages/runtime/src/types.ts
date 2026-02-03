/**
 * @xala/runtime - Types
 *
 * Shared types for RuntimeProvider configuration
 */

import type { ReactNode } from 'react';
import type { QueryClient } from '@tanstack/react-query';

// ============================================================================
// App Configuration
// ============================================================================

export type AppType =
  | 'web'
  | 'minside'
  | 'backoffice'
  | 'saas-admin'
  | 'monitoring'
  | 'docs-learning';

export type SupportedLocale = 'nb' | 'en';

export type ColorScheme = 'light' | 'dark' | 'auto';

export type ThemeId = 'digilist' | 'digdir' | 'altinn' | 'uutilsynet' | 'portal';

// ============================================================================
// Runtime Configuration
// ============================================================================

export interface RuntimeConfig {
  /** Required: App identification */
  appType: AppType;

  /** SDK: API base URL */
  apiUrl: string;

  /** SDK: WebSocket URL (optional, for realtime features) */
  wsUrl?: string;

  /** SDK: Tenant ID */
  tenantId?: string;

  /** SDK: License key */
  licenseKey?: string;

  /** Localization: Initial locale */
  locale?: SupportedLocale;

  /** Theme: Theme ID */
  theme?: ThemeId;

  /** Theme: Color scheme preference */
  colorScheme?: ColorScheme;

  /** Auth: Custom auth configuration */
  authConfig?: AuthConfig;

  /** Feature flags (static) */
  featureFlags?: Record<string, boolean>;

  /** Callbacks */
  onAuthError?: (error: Error) => void;
  onRealtimeDisconnect?: () => void;
}

export interface AuthConfig {
  loginPath?: string;
  debug?: boolean;
  sessionCheckInterval?: number;
}

// ============================================================================
// Create Runtime Options (for testing/Storybook)
// ============================================================================

export interface CreateRuntimeOptions extends Partial<RuntimeConfig> {
  /** Mock user for testing */
  mockUser?: MockUser | null;

  /** Mock session data */
  mockSession?: MockSession;

  /** Mock capabilities */
  mockCapabilities?: string[];

  /** Mock organizations */
  mockOrganizations?: MockOrganization[];

  /** Override QueryClient */
  queryClient?: QueryClient;

  /** Skip auth provider (for isolated testing) */
  skipAuth?: boolean;

  /** Skip realtime provider */
  skipRealtime?: boolean;

  /** Skip i18n provider */
  skipI18n?: boolean;
}

export interface MockUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface MockSession {
  accessToken?: string;
  expiresAt?: Date;
}

export interface MockOrganization {
  id: string;
  name: string;
  role?: string;
}

// ============================================================================
// Runtime Instance (returned by createRuntime)
// ============================================================================

export interface RuntimeInstance {
  /** Provider component to wrap your app/component */
  Provider: React.FC<{ children: ReactNode }>;

  /** QueryClient instance (for direct access in tests) */
  queryClient: QueryClient;

  /** Mock user if provided */
  mockUser: MockUser | null;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface LocalizationContext {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
}

export interface SDKContext {
  queryClient: QueryClient;
  isOnline: boolean;
  apiUrl: string;
}

export interface RBACContext {
  hasCapability: (cap: string) => boolean;
  hasAnyCapability: (caps: string[]) => boolean;
  hasAllCapabilities: (caps: string[]) => boolean;
  effectiveRole: string | null;
  isAdmin: boolean;
  isCaseHandler: boolean;
}

export interface FeatureFlagsContext {
  isEnabled: (flag: string) => boolean;
  getVariant: <T>(flag: string, defaultValue: T) => T;
  flags: Record<string, boolean>;
}

export interface TenantContext {
  tenantId: string | null;
  tenantName: string | null;
  accountType: 'personal' | 'organization';
  selectedOrganization: MockOrganization | null;
  organizations: MockOrganization[];
  switchToPersonal: () => void;
  switchToOrganization: (orgId: string) => void;
}

export interface NotificationCenterContext {
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  isOpen: boolean;
  unreadCount: number;
}

export interface ToastContext {
  showToast: (message: string, variant?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}
