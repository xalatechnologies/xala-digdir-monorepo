/**
 * Drizzle ORM Database Schema
 * 
 * RE-EXPORTS from @digilist/database-schema package (single source of truth)
 * Plus additional tables that are still being migrated.
 * 
 * @see packages/database-schema for the canonical schema definitions
 */

// ============================================================================
// RE-EXPORT FROM @digilist/database-schema (SINGLE SOURCE OF TRUTH)
// ============================================================================

// Schema definitions
export {
  platformSchema,
  domainSchema,
  saasSchema,
  complianceSchema,
  monitoringSchema,
} from '@digilist/database-schema';

// Core tables
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

// Domain tables  
export {
  rentalObjects,
  listings,
  bookings,
  allocations,
  blocks,
  seasonalLeases,
  type RentalObject,
  type NewRentalObject,
  type Listing,
  type NewListing,
  type Booking,
  type NewBooking,
  type Allocation,
  type NewAllocation,
  type Block,
  type NewBlock,
  type SeasonalLease,
  type NewSeasonalLease,
} from '@digilist/database-schema';

// Platform tables
export {
  sessions,
  orgMemberships,
  accessGrants,
  permissionAssignments,
  caseHandlerScopes,
  type Session,
  type NewSession,
  type OrgMembership,
  type NewOrgMembership,
  type AccessGrant,
  type NewAccessGrant,
  type PermissionAssignment,
  type NewPermissionAssignment,
  type CaseHandlerScope,
  type NewCaseHandlerScope,
} from '@digilist/database-schema';

// SaaS tables (entitlements)
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

// ============================================================================
// REMAINING TABLES (from legacy file)
// ============================================================================

export {
  // Plans & Subscriptions
  plans,
  subscriptions,
  categoryEntitlements,
  usage,
  
  // Feature Flags (note: catalog, not featureFlags)
  featureFlagsCatalog,
  tenantFeatureFlags,
  orgFeatureFlags,
  
  // Favorites
  favorites,
  
  // Alerts & Incidents
  alerts,
  incidents,
  
  // Messaging
  conversations,
  messages,
  
  // Availability
  seasons,
  seasonApplications,
  priorityRules,
  
  // Allocations & Blocks (now in database-schema package, but keep legacy for backward compat)
  // allocations, blocks, seasonalLeases - moved to @digilist/database-schema
  
  // Amenities
  amenities,
  amenityGroups,
  rentalObjectAmenities,
  
  // Addons
  addons,
  rentalObjectAddons,
  bookingAddons,
  
  // Categories
  categories,
  
  // Branding
  brandingTokens,
  brandingVersions,
  
  // Notification
  notificationPreferences,
  
  // Types
  type Plan,
  type NewPlan,
  type Subscription,
  type NewSubscription,
} from './index.legacy';

// Re-export custody tables from separate file
export * from './custody';

// Re-export modules from separate file  
export * from './modules';

// Re-export policy from separate file
export * from './policy';

// Re-export files from separate file
export * from './files';

// Re-export gdpr-requests from separate file
export * from './gdpr-requests';

// Re-export notification-preferences from separate file
export * from './notification-preferences';

// Re-export rental-domain from separate file (constants and types)
export * from './rental-domain';
