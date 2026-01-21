/**
 * Tenant configuration module for @xalatechnologies/enterprise
 *
 * Provides tenant-specific configuration including:
 * - Theme configuration (colors, fonts, logos)
 * - Feature toggles per tenant
 * - Localization settings
 * - Branding configuration
 * - Remote configuration loading
 *
 * @example
 * ```tsx
 * import {
 *   TenantConfigProvider,
 *   useTenantConfig,
 *   useTenantTheme
 * } from '@xalatechnologies/enterprise/tenant-config';
 *
 * // In your app root
 * <TenantConfigProvider config={{
 *   tenantId: 'kommune-123',
 *   config: {
 *     tenantId: 'kommune-123',
 *     theme: { primaryColor: '#0066cc' },
 *     features: { bookings: true }
 *   }
 * }}>
 *   <App />
 * </TenantConfigProvider>
 *
 * // In your components
 * function MyComponent() {
 *   const { isFeatureEnabled, branding } = useTenantConfig();
 *   const theme = useTenantTheme();
 *
 *   return (
 *     <div style={{ color: theme?.primaryColor }}>
 *       <h1>{branding?.name}</h1>
 *       {isFeatureEnabled('bookings') && <BookingSection />}
 *     </div>
 *   );
 * }
 * ```
 */

export {
  TenantConfigProvider,
  useTenantConfig,
  useTenantId,
  useTenantTheme,
  useTenantFeature,
  type TenantConfigProviderProps,
} from './TenantConfigProvider';

export type {
  TenantConfig,
  TenantConfigProviderConfig,
  TenantConfigContextValue,
  TenantTheme,
  TenantFeatures,
  TenantLocalization,
  TenantBranding,
} from './types';
