/**
 * Drizzle ORM Database Schema for Platform API
 *
 * RE-EXPORTS from @xalatechnologies/platform-schema package (platform tables ONLY)
 * NO domain-specific tables - those stay in @digilist/database-schema
 *
 * @see packages/platform-schema for the canonical platform schema definitions
 */

// ============================================================================
// RE-EXPORT FROM @xalatechnologies/platform-schema (PLATFORM TABLES ONLY)
// ============================================================================

// Schema definitions (platform schemas only - NO domainSchema)
export {
  platformSchema,
  saasSchema,
  complianceSchema,
  monitoringSchema,
} from '@xalatechnologies/platform-schema';

// Core platform tables
export {
  tenants,
  organizations,
  users,
  type Tenant,
  type NewTenant,
  type Organization,
  type NewOrganization,
  type User,
  type NewUser,
} from '@xalatechnologies/platform-schema';

// Platform session and auth tables
export {
  sessions,
  orgMemberships,
  permissionAssignments,
  caseHandlerScopes,
  authDemoTokens,
  type Session,
  type NewSession,
  type OrgMembership,
  type NewOrgMembership,
  type PermissionAssignment,
  type NewPermissionAssignment,
  type CaseHandlerScope,
  type NewCaseHandlerScope,
  type AuthDemoToken,
  type NewAuthDemoToken,
} from '@xalatechnologies/platform-schema';

// SaaS tables (entitlements, policies)
export {
  planEntitlements,
  tenantEntitlementOverrides,
  integrationConfigs,
  routePolicies,
  navPolicies,
  globalKillSwitches,
  entitlementAuditLog,
} from '@xalatechnologies/platform-schema';

// Compliance tables
export {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
} from '@xalatechnologies/platform-schema';
