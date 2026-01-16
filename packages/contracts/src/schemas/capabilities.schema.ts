/**
 * Capabilities Schemas
 *
 * Contract definitions for the capabilities system.
 */
import { z } from 'zod';

// =============================================================================
// Capability Types
// =============================================================================

export const CapabilitySchema = z.string().startsWith('CAP_');
export type Capability = z.infer<typeof CapabilitySchema>;

// =============================================================================
// UI Hints
// =============================================================================

export const UIHintsSchema = z.object({
  showAdminNav: z.boolean().optional(),
  showReports: z.boolean().optional(),
  showAudit: z.boolean().optional(),
  showIntegrations: z.boolean().optional(),
  showSettings: z.boolean().optional(),
  showSeasons: z.boolean().optional(),
});

export type UIHints = z.infer<typeof UIHintsSchema>;

// =============================================================================
// Feature Flags
// =============================================================================

export const FeatureFlagsSchema = z.record(z.boolean());
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

// =============================================================================
// Capabilities Response
// =============================================================================

export const CapabilitiesResponseSchema = z.object({
  role: z.string(),
  effectiveRole: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  capabilities: z.array(CapabilitySchema).optional(),
  featureFlags: FeatureFlagsSchema,
  uiHints: UIHintsSchema.optional(),
  organizationScopes: z.array(z.string()).optional(),
});

export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponseSchema>;

// =============================================================================
// Capability Constants
// =============================================================================

export const CAPABILITIES = {
  // Dashboard
  DASHBOARD_VIEW: 'CAP_DASHBOARD_VIEW',
  
  // Rental Objects
  RENTAL_OBJECT_VIEW: 'CAP_RENTAL_OBJECT_VIEW',
  RENTAL_OBJECT_CREATE: 'CAP_RENTAL_OBJECT_CREATE',
  RENTAL_OBJECT_EDIT: 'CAP_RENTAL_OBJECT_EDIT',
  RENTAL_OBJECT_DELETE: 'CAP_RENTAL_OBJECT_DELETE',
  RENTAL_OBJECT_PUBLISH: 'CAP_RENTAL_OBJECT_PUBLISH',
  
  // Bookings
  BOOKING_VIEW: 'CAP_BOOKING_VIEW',
  BOOKING_CREATE: 'CAP_BOOKING_CREATE',
  BOOKING_EDIT: 'CAP_BOOKING_EDIT',
  BOOKING_CANCEL: 'CAP_BOOKING_CANCEL',
  BOOKING_APPROVE: 'CAP_BOOKING_APPROVE',
  
  // Users
  USER_VIEW: 'CAP_USER_VIEW',
  USER_CREATE: 'CAP_USER_CREATE',
  USER_EDIT: 'CAP_USER_EDIT',
  USER_DELETE: 'CAP_USER_DELETE',
  USER_ADMIN: 'CAP_USER_ADMIN',
  
  // Organizations
  ORG_VIEW: 'CAP_ORG_VIEW',
  ORG_CREATE: 'CAP_ORG_CREATE',
  ORG_EDIT: 'CAP_ORG_EDIT',
  ORG_DELETE: 'CAP_ORG_DELETE',
  
  // Reports
  REPORTS_VIEW: 'CAP_REPORTS_VIEW',
  REPORTS_EXPORT: 'CAP_REPORTS_EXPORT',
  
  // Audit
  AUDIT_VIEW: 'CAP_AUDIT_VIEW',
  
  // Settings
  SETTINGS_VIEW: 'CAP_SETTINGS_VIEW',
  SETTINGS_EDIT: 'CAP_SETTINGS_EDIT',
  
  // Integrations
  INTEGRATIONS_VIEW: 'CAP_INTEGRATIONS_VIEW',
  INTEGRATIONS_MANAGE: 'CAP_INTEGRATIONS_MANAGE',
  
  // GDPR
  GDPR_DATA_REQUEST: 'CAP_GDPR_DATA_REQUEST',
  GDPR_DATA_EXPORT: 'CAP_GDPR_DATA_EXPORT',
  GDPR_DATA_DELETE: 'CAP_GDPR_DATA_DELETE',
  
  // Profile
  PROFILE_VIEW: 'CAP_PROFILE_VIEW',
  PROFILE_EDIT: 'CAP_PROFILE_EDIT',
} as const;

export type CapabilityKey = keyof typeof CAPABILITIES;
