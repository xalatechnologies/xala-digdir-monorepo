/**
 * Feature flag types for @xalatechnologies/enterprise
 */

/**
 * Represents a single feature flag
 */
export interface FeatureFlag {
  /** Unique identifier for the feature flag */
  key: string;
  /** Whether the feature is enabled */
  enabled: boolean;
  /** Optional description of the feature */
  description?: string;
  /** Optional metadata for the feature */
  metadata?: Record<string, unknown>;
}

/**
 * Feature flag evaluation context
 */
export interface FeatureFlagContext {
  /** User ID for user-specific targeting */
  userId?: string;
  /** Tenant ID for tenant-specific targeting */
  tenantId?: string;
  /** User roles for role-based targeting */
  roles?: string[];
  /** Additional attributes for targeting rules */
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Configuration for the FeatureFlagProvider
 */
export interface FeatureFlagConfig {
  /** Initial feature flags to use */
  flags?: Record<string, boolean>;
  /** Evaluation context */
  context?: FeatureFlagContext;
  /** Optional remote feature flag service URL */
  remoteUrl?: string;
  /** Polling interval in milliseconds for remote flags */
  pollingInterval?: number;
  /** Callback when flags are updated */
  onFlagsUpdated?: (flags: Record<string, boolean>) => void;
}

/**
 * Feature flag context value exposed by the provider
 */
export interface FeatureFlagContextValue {
  /** Check if a feature flag is enabled */
  isEnabled: (key: string) => boolean;
  /** Get all feature flags */
  getFlags: () => Record<string, boolean>;
  /** Update feature flags programmatically */
  setFlags: (flags: Record<string, boolean>) => void;
  /** Check if flags are loading from remote */
  isLoading: boolean;
  /** Error if remote flag fetch failed */
  error: Error | null;
  /** Current evaluation context */
  context: FeatureFlagContext;
  /** Update the evaluation context */
  setContext: (context: FeatureFlagContext) => void;
}
