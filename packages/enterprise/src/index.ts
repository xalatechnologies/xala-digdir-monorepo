/**
 * @xalatechnologies/enterprise
 *
 * Enterprise features for Xala/Digilist applications including:
 * - Feature flags with context-based evaluation
 * - Offline capability with action queuing
 * - Tenant-specific configuration
 *
 * @example
 * ```tsx
 * import {
 *   FeatureFlagProvider,
 *   OfflineProvider,
 *   TenantConfigProvider
 * } from '@xalatechnologies/enterprise';
 *
 * // Or import specific modules
 * import { useFeatureFlags } from '@xalatechnologies/enterprise/feature-flags';
 * import { useOffline } from '@xalatechnologies/enterprise/offline';
 * import { useTenantConfig } from '@xalatechnologies/enterprise/tenant-config';
 * ```
 */

// Feature Flags
export {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  type FeatureFlagProviderProps,
} from './feature-flags';

export type {
  FeatureFlag,
  FeatureFlagConfig,
  FeatureFlagContext,
  FeatureFlagContextValue,
} from './feature-flags';

// Offline
export {
  OfflineProvider,
  useOffline,
  useIsOnline,
  type OfflineProviderProps,
} from './offline';

export type {
  ConnectionStatus,
  SyncStatus,
  QueuedAction,
  OfflineConfig,
  OfflineStorageConfig,
  OfflineContextValue,
  SyncResult,
} from './offline';

// Tenant Config
export {
  TenantConfigProvider,
  useTenantConfig,
  useTenantId,
  useTenantTheme,
  useTenantFeature,
  type TenantConfigProviderProps,
} from './tenant-config';

export type {
  TenantConfig,
  TenantConfigProviderConfig,
  TenantConfigContextValue,
  TenantTheme,
  TenantFeatures,
  TenantLocalization,
  TenantBranding,
} from './tenant-config';
