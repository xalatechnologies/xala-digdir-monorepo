/**
 * Feature flags module for @xalatechnologies/enterprise
 *
 * Provides feature flag functionality including:
 * - React context provider for feature flags
 * - Hooks for checking feature flags
 * - Support for remote feature flag services
 * - Context-based evaluation (user, tenant, roles)
 *
 * @example
 * ```tsx
 * import { FeatureFlagProvider, useFeatureFlags } from '@xalatechnologies/enterprise/feature-flags';
 *
 * // In your app root
 * <FeatureFlagProvider config={{ flags: { 'new-ui': true } }}>
 *   <App />
 * </FeatureFlagProvider>
 *
 * // In your components
 * function MyComponent() {
 *   const { isEnabled } = useFeatureFlags();
 *   return isEnabled('new-ui') ? <NewUI /> : <LegacyUI />;
 * }
 * ```
 */

export {
  FeatureFlagProvider,
  useFeatureFlags,
  useFeatureFlag,
  type FeatureFlagProviderProps,
} from './FeatureFlagProvider';

export type {
  FeatureFlag,
  FeatureFlagConfig,
  FeatureFlagContext,
  FeatureFlagContextValue,
} from './types';
