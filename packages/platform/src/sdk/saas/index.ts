/**
 * @xalatechnologies/platform/sdk/saas
 * 
 * Platform-wide SaaS administration module.
 * Provides types, services, and hooks for tenant management,
 * subscription plans, feature flags, billing, and secrets.
 */

// Types
export * from './types';

// Service
export { saasService } from './service';

// Query Keys
export { saasQueryKeys } from './query-keys';

// Hooks
export {
  // Admin
  useSaasMe,
  // Tenants
  useSaasTenants,
  useSaasTenant,
  useCreateSaasTenant,
  useUpdateSaasTenant,
  useSuspendSaasTenant,
  useReactivateSaasTenant,
  // Seat Limits
  useUpdateSaasSeatLimits,
  // Feature Flags
  useSaasFeatureFlagsCatalog,
  useSaasTenantFlags,
  useUpdateSaasTenantFlags,
  // License Keys
  useRotateSaasLicenseKey,
  useValidateSaasLicenseKey,
  // Billing
  useSaasTenantBilling,
  useSaasBillingOverview,
  // Secrets
  useSaasTenantSecrets,
  useUpdateSaasTenantSecret,
  // Plans
  useSaasPlans,
  useSaasPlan,
  useCreateSaasPlan,
  useUpdateSaasPlan,
  // Categories
  useSaasTenantCategories,
  useUpdateSaasTenantCategories,
  // Scanners (Monitoring)
  useRunI18nScanner,
  useRunDesignSystemScanner,
  useRunWcagScanner,
  // Audit Log
  useAuditLog,
  useAuditStats,
  // Seed Generation
  useGenerateSeed,
  // User Management (Platform-wide)
  useUsers,
} from './hooks';
