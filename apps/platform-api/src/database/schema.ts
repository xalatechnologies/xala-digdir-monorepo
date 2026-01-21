/**
 * Drizzle ORM Database Schema for Platform API
 *
 * RE-EXPORTS from @digilist/database-schema package (single source of truth)
 * ONLY platform-related tables - NO domain-specific tables
 *
 * @see packages/database-schema for the canonical schema definitions
 */

// ============================================================================
// RE-EXPORT FROM @digilist/database-schema (PLATFORM TABLES ONLY)
// ============================================================================

// Schema definitions
export {
  platformSchema,
  saasSchema,
  complianceSchema,
  monitoringSchema,
} from '@digilist/database-schema';

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
} from '@digilist/database-schema';

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
} from '@digilist/database-schema';

// SaaS tables (entitlements, policies)
export {
  planEntitlements,
  tenantEntitlementOverrides,
  integrationConfigs,
  routePolicies,
  navPolicies,
  globalKillSwitches,
  entitlementAuditLog,
} from '@digilist/database-schema';

// Compliance tables
export {
  auditLogs,
  type AuditLog,
  type NewAuditLog,
} from '@digilist/database-schema';
