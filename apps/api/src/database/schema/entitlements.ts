/**
 * Entitlements Schema
 * Re-exported from @digilist/database-schema package (single source of truth)
 * 
 * DO NOT define tables here - use the package instead.
 * This file exists only for backward compatibility.
 */

export {
  planEntitlements,
  tenantEntitlementOverrides,
  integrationConfigs,
  routePolicies,
  navPolicies,
  globalKillSwitches,
  entitlementAuditLog,
} from '@digilist/database-schema/entitlements';

// Re-export saasSchema for local use
export { saasSchema } from '@digilist/database-schema';
