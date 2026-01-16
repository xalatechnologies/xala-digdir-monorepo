/**
 * SaaS Admin Zod Schemas
 * Validation schemas for SaaS platform administration domain
 */
import { z } from 'zod';

// =============================================================================
// Enums
// =============================================================================

/**
 * Tenant Status Enum (SaaS context)
 */
export const SaasTenantStatusSchema = z.enum(['active', 'suspended', 'pending', 'deleted']);
export type SaasTenantStatus = z.infer<typeof SaasTenantStatusSchema>;

/**
 * Plan Status Enum
 */
export const PlanStatusSchema = z.enum(['active', 'inactive', 'deprecated']);
export type PlanStatus = z.infer<typeof PlanStatusSchema>;

/**
 * Billing Period Enum
 */
export const BillingPeriodSchema = z.enum(['monthly', 'yearly', 'one_time']);
export type BillingPeriod = z.infer<typeof BillingPeriodSchema>;

/**
 * Feature Flag Type Enum
 */
export const FeatureFlagTypeSchema = z.enum(['boolean', 'string', 'number']);
export type FeatureFlagType = z.infer<typeof FeatureFlagTypeSchema>;

/**
 * Feature Flag Category Enum
 */
export const FeatureFlagCategorySchema = z.enum(['module', 'integration', 'policy']);
export type FeatureFlagCategory = z.infer<typeof FeatureFlagCategorySchema>;

// =============================================================================
// Seat Limits
// =============================================================================

/**
 * Seat Limits Schema
 * Defines the resource limits for a tenant subscription
 */
export const SeatLimitsSchema = z.object({
  maxUsers: z.number().int().nonnegative(),
  maxOrganizations: z.number().int().nonnegative(),
  maxListings: z.number().int().nonnegative(),
  maxBookingsPerMonth: z.number().int().nonnegative(),
  maxStorageMb: z.number().int().nonnegative(),
});

export type SeatLimits = z.infer<typeof SeatLimitsSchema>;

/**
 * Partial Seat Limits Schema (for updates)
 */
export const PartialSeatLimitsSchema = SeatLimitsSchema.partial();
export type PartialSeatLimits = z.infer<typeof PartialSeatLimitsSchema>;

// =============================================================================
// Entitlements
// =============================================================================

/**
 * Module Entitlements Schema
 * Controls access to feature modules
 */
export const ModuleEntitlementsSchema = z.object({
  rating: z.boolean().default(false),
  recommendations: z.boolean().default(false),
  feedback: z.boolean().default(true),
  favorites: z.boolean().default(true),
  share: z.boolean().default(true),
  recurringBookings: z.boolean().default(false),
});

export type ModuleEntitlements = z.infer<typeof ModuleEntitlementsSchema>;

/**
 * Integration Entitlements Schema
 * Controls access to third-party integrations
 */
export const IntegrationEntitlementsSchema = z.object({
  visma: z.boolean().default(false),
  rco: z.boolean().default(false),
  acos: z.boolean().default(false),
  outlook: z.boolean().default(false),
  vipps: z.boolean().default(false),
});

export type IntegrationEntitlements = z.infer<typeof IntegrationEntitlementsSchema>;

/**
 * Feature Entitlements Schema
 * Controls access to premium features
 */
export const FeatureEntitlementsSchema = z.object({
  customBranding: z.boolean().default(false),
  advancedReporting: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
});

export type FeatureEntitlements = z.infer<typeof FeatureEntitlementsSchema>;

/**
 * Combined Entitlements Schema
 */
export const EntitlementsSchema = z.object({
  modules: ModuleEntitlementsSchema.default({}),
  integrations: IntegrationEntitlementsSchema.default({}),
  features: FeatureEntitlementsSchema.default({}),
});

export type Entitlements = z.infer<typeof EntitlementsSchema>;

// =============================================================================
// Tenant Schemas
// =============================================================================

/**
 * Full SaaS Tenant Schema
 */
export const SaasTenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').max(100),
  domain: z.string().max(255).optional().nullable(),
  status: SaasTenantStatusSchema.default('active'),
  subscriptionPlanId: z.string().uuid().optional().nullable(),
  licenseKeyHash: z.string().optional().nullable(),
  licenseKeyRotatedAt: z.coerce.date().optional().nullable(),
  seatLimits: SeatLimitsSchema.optional().nullable(),
  brandingVersionId: z.string().uuid().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SaasTenant = z.infer<typeof SaasTenantSchema>;

/**
 * Create SaaS Tenant DTO
 */
export const CreateSaasTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').max(100),
  domain: z.string().max(255).optional(),
  planId: z.string().uuid().optional(),
  seatLimits: SeatLimitsSchema.optional(),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(1).max(255),
});

export type CreateSaasTenantDTO = z.infer<typeof CreateSaasTenantSchema>;

/**
 * Update SaaS Tenant DTO
 */
export const UpdateSaasTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().max(255).optional().nullable(),
  status: SaasTenantStatusSchema.optional(),
  planId: z.string().uuid().optional().nullable(),
  seatLimits: PartialSeatLimitsSchema.optional(),
});

export type UpdateSaasTenantDTO = z.infer<typeof UpdateSaasTenantSchema>;

/**
 * SaaS Tenant Query Params
 */
export const SaasTenantQuerySchema = z.object({
  status: SaasTenantStatusSchema.optional(),
  planId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type SaasTenantQueryParams = z.infer<typeof SaasTenantQuerySchema>;

// =============================================================================
// Plan Schemas
// =============================================================================

/**
 * Full Plan Schema
 */
export const PlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  description: z.string().max(1000).optional().nullable(),
  seatLimits: SeatLimitsSchema,
  entitlements: EntitlementsSchema,
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).default('NOK'),
  billingPeriod: BillingPeriodSchema.default('monthly'),
  trialDays: z.number().int().nonnegative().default(0),
  isPublic: z.boolean().default(true),
  status: PlanStatusSchema.default('active'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Plan = z.infer<typeof PlanSchema>;

/**
 * Create Plan DTO
 */
export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').max(100).optional(),
  description: z.string().max(1000).optional(),
  seatLimits: SeatLimitsSchema,
  entitlements: EntitlementsSchema.optional(),
  basePrice: z.number().nonnegative(),
  currency: z.string().length(3).optional().default('NOK'),
  billingPeriod: BillingPeriodSchema.optional().default('monthly'),
  trialDays: z.number().int().nonnegative().optional().default(0),
  isPublic: z.boolean().optional().default(true),
});

export type CreatePlanDTO = z.infer<typeof CreatePlanSchema>;

/**
 * Update Plan DTO
 */
export const UpdatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
  seatLimits: PartialSeatLimitsSchema.optional(),
  entitlements: EntitlementsSchema.partial().optional(),
  basePrice: z.number().nonnegative().optional(),
  billingPeriod: BillingPeriodSchema.optional(),
  trialDays: z.number().int().nonnegative().optional(),
  isPublic: z.boolean().optional(),
  status: PlanStatusSchema.optional(),
});

export type UpdatePlanDTO = z.infer<typeof UpdatePlanSchema>;

/**
 * Plan Query Params
 */
export const PlanQuerySchema = z.object({
  status: PlanStatusSchema.optional(),
  isPublic: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type PlanQueryParams = z.infer<typeof PlanQuerySchema>;

// =============================================================================
// Feature Flags Schemas
// =============================================================================

/**
 * Feature Flag Catalog Entry Schema
 */
export const FeatureFlagCatalogSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1).max(100).regex(/^[a-z][a-z0-9_.]*$/, 'Key must start with lowercase letter and contain only lowercase letters, numbers, underscores, and dots'),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional().nullable(),
  type: FeatureFlagTypeSchema.default('boolean'),
  defaultValue: z.union([z.boolean(), z.string(), z.number()]).default(false),
  category: FeatureFlagCategorySchema.default('module'),
  status: z.enum(['active', 'deprecated']).default('active'),
  metadata: z.record(z.unknown()).optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FeatureFlagCatalogEntry = z.infer<typeof FeatureFlagCatalogSchema>;

/**
 * Tenant Feature Flag Override Schema
 */
export const TenantFeatureFlagSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  flagKey: z.string().min(1).max(100),
  value: z.union([z.boolean(), z.string(), z.number()]),
  reason: z.string().max(500).optional().nullable(),
  updatedBy: z.string().uuid().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TenantFeatureFlag = z.infer<typeof TenantFeatureFlagSchema>;

/**
 * Organization Feature Flag Override Schema
 */
export const OrgFeatureFlagSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  flagKey: z.string().min(1).max(100),
  value: z.union([z.boolean(), z.string(), z.number()]),
  reason: z.string().max(500).optional().nullable(),
  updatedBy: z.string().uuid().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type OrgFeatureFlag = z.infer<typeof OrgFeatureFlagSchema>;

/**
 * Update Feature Flags DTO
 */
export const UpdateFeatureFlagsSchema = z.object({
  flags: z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])),
  reason: z.string().max(500).optional(),
});

export type UpdateFeatureFlagsDTO = z.infer<typeof UpdateFeatureFlagsSchema>;

/**
 * Feature Flags Query Params
 */
export const FeatureFlagsQuerySchema = z.object({
  category: FeatureFlagCategorySchema.optional(),
  status: z.enum(['active', 'deprecated']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type FeatureFlagsQueryParams = z.infer<typeof FeatureFlagsQuerySchema>;

// =============================================================================
// Seat Limits Schemas
// =============================================================================

/**
 * Update Seat Limits DTO
 */
export const UpdateSeatLimitsSchema = z.object({
  seatLimits: PartialSeatLimitsSchema,
  reason: z.string().max(500).optional(),
});

export type UpdateSeatLimitsDTO = z.infer<typeof UpdateSeatLimitsSchema>;

// =============================================================================
// License Key Schemas
// =============================================================================

/**
 * Rotate License Key Request Schema
 */
export const RotateLicenseKeySchema = z.object({
  reason: z.string().max(500).optional(),
  revokeExisting: z.boolean().optional().default(true),
});

export type RotateLicenseKeyDTO = z.infer<typeof RotateLicenseKeySchema>;

/**
 * Validate License Key Request Schema
 */
export const ValidateLicenseKeySchema = z.object({
  licenseKey: z.string().min(1).max(100),
});

export type ValidateLicenseKeyDTO = z.infer<typeof ValidateLicenseKeySchema>;

// =============================================================================
// Billing Schemas
// =============================================================================

/**
 * Billing Status Enum
 */
export const BillingStatusSchema = z.enum(['paid', 'pending', 'overdue', 'cancelled', 'trial']);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

/**
 * Billing Query Params
 */
export const BillingQuerySchema = z.object({
  status: BillingStatusSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type BillingQueryParams = z.infer<typeof BillingQuerySchema>;

// =============================================================================
// Category Entitlements Schemas
// =============================================================================

/**
 * Category Entitlement Schema
 */
export const CategoryEntitlementSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid().optional().nullable(),
  categoryKey: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  restrictions: z.record(z.unknown()).optional().nullable(),
  reason: z.string().max(500).optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CategoryEntitlement = z.infer<typeof CategoryEntitlementSchema>;

/**
 * Update Category Entitlements DTO
 */
export const UpdateCategoryEntitlementsSchema = z.object({
  categories: z.array(z.object({
    categoryKey: z.string().min(1).max(100),
    enabled: z.boolean(),
    restrictions: z.record(z.unknown()).optional(),
  })),
  reason: z.string().max(500).optional(),
});

export type UpdateCategoryEntitlementsDTO = z.infer<typeof UpdateCategoryEntitlementsSchema>;

// =============================================================================
// Tenant Suspension Schemas
// =============================================================================

/**
 * Suspend Tenant DTO
 */
export const SuspendTenantSchema = z.object({
  reason: z.string().min(1).max(500),
  notifyOwner: z.boolean().optional().default(true),
  scheduledReactivation: z.coerce.date().optional(),
});

export type SuspendTenantDTO = z.infer<typeof SuspendTenantSchema>;

/**
 * Reactivate Tenant DTO
 */
export const ReactivateTenantSchema = z.object({
  reason: z.string().max(500).optional(),
  notifyOwner: z.boolean().optional().default(true),
});

export type ReactivateTenantDTO = z.infer<typeof ReactivateTenantSchema>;

// =============================================================================
// ID Parameter Schemas
// =============================================================================

/**
 * Tenant ID Parameter Schema
 */
export const TenantIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type TenantIdParam = z.infer<typeof TenantIdParamSchema>;

/**
 * Plan ID Parameter Schema
 */
export const PlanIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type PlanIdParam = z.infer<typeof PlanIdParamSchema>;

/**
 * Flag Key Parameter Schema
 */
export const FlagKeyParamSchema = z.object({
  key: z.string().min(1).max(100),
});

export type FlagKeyParam = z.infer<typeof FlagKeyParamSchema>;
