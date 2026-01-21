/**
 * Tenant configuration types for @xalatechnologies/enterprise
 */

/**
 * Theme configuration for a tenant
 */
export interface TenantTheme {
  /** Primary color */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Accent color */
  accentColor?: string;
  /** Logo URL */
  logoUrl?: string;
  /** Favicon URL */
  faviconUrl?: string;
  /** Font family */
  fontFamily?: string;
  /** Color scheme preference */
  colorScheme?: 'light' | 'dark' | 'auto';
}

/**
 * Feature toggles for a tenant
 */
export interface TenantFeatures {
  /** Enable booking functionality */
  bookings?: boolean;
  /** Enable messaging functionality */
  messaging?: boolean;
  /** Enable notifications */
  notifications?: boolean;
  /** Enable reports */
  reports?: boolean;
  /** Enable integrations */
  integrations?: boolean;
  /** Custom feature flags */
  custom?: Record<string, boolean>;
}

/**
 * Localization settings for a tenant
 */
export interface TenantLocalization {
  /** Default locale */
  defaultLocale?: string;
  /** Supported locales */
  supportedLocales?: string[];
  /** Timezone */
  timezone?: string;
  /** Date format */
  dateFormat?: string;
  /** Time format */
  timeFormat?: string;
  /** Currency */
  currency?: string;
}

/**
 * Branding configuration for a tenant
 */
export interface TenantBranding {
  /** Organization name */
  name?: string;
  /** Tagline */
  tagline?: string;
  /** Contact email */
  contactEmail?: string;
  /** Support URL */
  supportUrl?: string;
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
  /** Terms of service URL */
  termsOfServiceUrl?: string;
}

/**
 * Complete tenant configuration
 */
export interface TenantConfig {
  /** Tenant identifier */
  tenantId: string;
  /** Tenant display name */
  name?: string;
  /** Theme configuration */
  theme?: TenantTheme;
  /** Feature toggles */
  features?: TenantFeatures;
  /** Localization settings */
  localization?: TenantLocalization;
  /** Branding configuration */
  branding?: TenantBranding;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration for the TenantConfigProvider
 */
export interface TenantConfigProviderConfig {
  /** Initial tenant configuration */
  config?: TenantConfig;
  /** Tenant ID to load configuration for */
  tenantId?: string;
  /** Remote URL to fetch tenant configuration */
  remoteUrl?: string;
  /** Cache duration in milliseconds */
  cacheDuration?: number;
  /** Callback when configuration is loaded */
  onConfigLoaded?: (config: TenantConfig) => void;
  /** Callback when configuration loading fails */
  onConfigError?: (error: Error) => void;
}

/**
 * Tenant config context value exposed by the provider
 */
export interface TenantConfigContextValue {
  /** Current tenant configuration */
  config: TenantConfig | null;
  /** Current tenant ID */
  tenantId: string | null;
  /** Whether configuration is loading */
  isLoading: boolean;
  /** Error if configuration loading failed */
  error: Error | null;
  /** Reload tenant configuration */
  reload: () => Promise<void>;
  /** Get a specific config value */
  getConfig: <T = unknown>(path: string, defaultValue?: T) => T;
  /** Check if a feature is enabled */
  isFeatureEnabled: (feature: string) => boolean;
  /** Get theme configuration */
  theme: TenantTheme | null;
  /** Get branding configuration */
  branding: TenantBranding | null;
  /** Get localization configuration */
  localization: TenantLocalization | null;
}
