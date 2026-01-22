/**
 * Entitlements Schema
 *
 * NOTE: The entitlements tables (planEntitlements, tenantEntitlementOverrides,
 * integrationConfigs, routePolicies, navPolicies, globalKillSwitches,
 * entitlementAuditLog) are NOT yet defined in @digilist/database-schema.
 *
 * These tables need to be created in packages/schema/src/saas/ when the
 * SaaS entitlements feature is implemented.
 *
 * For now, this file is empty to prevent import errors.
 */

// Re-export saasSchema for local use
export { saasSchema } from '@digilist/database-schema';
