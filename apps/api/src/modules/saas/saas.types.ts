/**
 * SaaS Admin Module Types
 * Type definitions for SaaS platform administration
 */
import { z } from 'zod';
import type {
  Tenant,
  Plan,
  Subscription,
  FeatureFlagCatalog,
  TenantFeatureFlag,
} from '../../database/schema';

// =============================================================================
// Seat Limits
// =============================================================================

export const SeatLimitsSchema = z.object({
  maxUsers: z.number().int().nonnegative(),
  maxOrganizations: z.number().int().nonnegative(),
  maxListings: z.number().int().nonnegative(),
  maxBookingsPerMonth: z.number().int().nonnegative(),
  maxStorageMb: z.number().int().nonnegative(),
});

export type SeatLimits = z.infer<typeof SeatLimitsSchema>;

// =============================================================================
// Entitlements
// =============================================================================

export const ModuleEntitlementsSchema = z.object({
  rating: z.boolean().default(false),
  recommendations: z.boolean().default(false),
  feedback: z.boolean().default(true),
  favorites: z.boolean().default(true),
  share: z.boolean().default(true),
  recurringBookings: z.boolean().default(false),
});

export const IntegrationEntitlementsSchema = z.object({
  visma: z.boolean().default(false),
  rco: z.boolean().default(false),
  acos: z.boolean().default(false),
  outlook: z.boolean().default(false),
  vipps: z.boolean().default(false),
});

export const FeatureEntitlementsSchema = z.object({
  customBranding: z.boolean().default(false),
  advancedReporting: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  prioritySupport: z.boolean().default(false),
});

export const EntitlementsSchema = z.object({
  modules: ModuleEntitlementsSchema.default({}),
  integrations: IntegrationEntitlementsSchema.default({}),
  features: FeatureEntitlementsSchema.default({}),
});

export type ModuleEntitlements = z.infer<typeof ModuleEntitlementsSchema>;
export type IntegrationEntitlements = z.infer<typeof IntegrationEntitlementsSchema>;
export type FeatureEntitlements = z.infer<typeof FeatureEntitlementsSchema>;
export type Entitlements = z.infer<typeof EntitlementsSchema>;

// =============================================================================
// Tenant Status
// =============================================================================

export const TenantStatusSchema = z.enum(['active', 'suspended', 'pending', 'deleted']);
export type TenantStatus = z.infer<typeof TenantStatusSchema>;

// =============================================================================
// Query Params
// =============================================================================

export const SaasTenantQuerySchema = z.object({
  status: TenantStatusSchema.optional(),
  planId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/** Input type (from request query) */
export type SaasTenantQueryInput = z.input<typeof SaasTenantQuerySchema>;

/** Output type (after validation with defaults applied) */
export type SaasTenantQueryParams = {
  status?: 'active' | 'suspended' | 'pending' | 'deleted';
  planId?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder: 'asc' | 'desc';
};

// =============================================================================
// Request DTOs
// =============================================================================

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

export const UpdateSaasTenantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().max(255).optional().nullable(),
  status: TenantStatusSchema.optional(),
  planId: z.string().uuid().optional().nullable(),
  seatLimits: SeatLimitsSchema.partial().optional(),
});

export type UpdateSaasTenantDTO = z.infer<typeof UpdateSaasTenantSchema>;

export const UpdateSeatLimitsSchema = z.object({
  seatLimits: SeatLimitsSchema.partial(),
});

export type UpdateSeatLimitsDTO = z.infer<typeof UpdateSeatLimitsSchema>;

export const UpdateFeatureFlagsSchema = z.object({
  flags: z.record(z.string(), z.boolean()),
  reason: z.string().optional(),
});

export type UpdateFeatureFlagsDTO = z.infer<typeof UpdateFeatureFlagsSchema>;

export const CreatePlanSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens').max(100).optional(),
  description: z.string().max(1000).optional(),
  basePrice: z.coerce.string(),
  billingPeriod: z.enum(['monthly', 'yearly']).default('monthly'),
  currency: z.string().max(3).default('NOK'),
  seatLimits: SeatLimitsSchema,
  entitlements: EntitlementsSchema.optional(),
  isActive: z.boolean().default(true),
});

/** Input type (before defaults are applied) */
export type CreatePlanInput = z.input<typeof CreatePlanSchema>;

/** Output type (after validation with defaults applied) */
export type CreatePlanDTO = z.infer<typeof CreatePlanSchema>;

// =============================================================================
// Response DTOs
// =============================================================================

export interface TenantDetailResponse {
  tenant: Tenant;
  subscription?: Subscription | null;
  plan?: Plan | null;
  featureFlags?: TenantFeatureFlag[];
  usage?: {
    currentUsers: number;
    currentOrganizations: number;
    currentListings: number;
    bookingsThisMonth: number;
    storageMb: number;
  };
}

export interface TenantListResponse {
  data: Tenant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PlanListResponse {
  data: Plan[];
  meta: {
    total: number;
  };
}

export interface FeatureFlagsCatalogResponse {
  data: FeatureFlagCatalog[];
  meta: {
    total: number;
  };
}

export interface LicenseKeyResponse {
  tenantId: string;
  maskedKey: string;
  rotatedAt: Date;
}

// =============================================================================
// Capability Projection
// =============================================================================

export interface SaasCapabilityProjection {
  role: string;
  level: 'saas';
  permissions: string[];
  allowedActions: {
    canCreateTenant: boolean;
    canManagePlans: boolean;
    canRotateLicenseKeys: boolean;
    canAccessBilling: boolean;
    canManageSecrets: boolean;
    canViewAuditLogs: boolean;
    canManageSupport: boolean;
  };
}

// =============================================================================
// Audit Event Types
// =============================================================================

export const SaasAuditActions = {
  TENANT_CREATED: 'saas.tenant.created',
  TENANT_UPDATED: 'saas.tenant.updated',
  TENANT_SUSPENDED: 'saas.tenant.suspended',
  TENANT_ACTIVATED: 'saas.tenant.activated',
  TENANT_DELETED: 'saas.tenant.deleted',
  PLAN_CREATED: 'saas.plan.created',
  PLAN_ASSIGNED: 'saas.tenant.plan_assigned',
  SEAT_LIMITS_UPDATED: 'saas.tenant.seat_limits_updated',
  FEATURE_FLAGS_UPDATED: 'saas.tenant.feature_flags_updated',
  LICENSE_KEY_ROTATED: 'saas.tenant.license_key_rotated',
  SECRET_UPDATED: 'saas.tenant.secret_updated',
  SECRET_ROTATED: 'saas.tenant.secret_rotated',
} as const;

export type SaasAuditAction = (typeof SaasAuditActions)[keyof typeof SaasAuditActions];
