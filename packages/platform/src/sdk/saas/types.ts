/**
 * SaaS Admin Types - @xalatechnologies/platform/sdk/saas
 * 
 * Platform-wide SaaS administration types for tenant management,
 * subscription plans, feature flags, billing, and secrets.
 * 
 * These types are domain-agnostic and can be reused across projects.
 */

// =============================================================================
// Common Response Wrappers
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface SingleResponse<T> {
  data: T;
}

// =============================================================================
// Enums & Status Types
// =============================================================================

export type SaasTenantStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type PlanStatus = 'active' | 'inactive' | 'deprecated';
export type BillingPeriod = 'monthly' | 'yearly' | 'lifetime';
export type FeatureFlagType = 'boolean' | 'string' | 'number';
export type FeatureFlagCategory = 'module' | 'integration' | 'policy';
export type BillingStatus = 'paid' | 'due' | 'overdue' | 'cancelled';

// =============================================================================
// Seat Limits & Entitlements
// =============================================================================

export interface SeatLimits {
  maxUsers: number;
  maxOrganizations: number;
  maxListings: number;
  maxBookingsPerMonth: number;
  maxStorageMb: number;
}

export interface ModuleEntitlements {
  rating: boolean;
  recommendations: boolean;
  feedback: boolean;
  favorites: boolean;
  share: boolean;
  recurringBookings: boolean;
}

export interface IntegrationEntitlements {
  visma: boolean;
  rco: boolean;
  acos: boolean;
  outlook: boolean;
  vipps: boolean;
}

export interface FeatureEntitlements {
  customBranding: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  advancedReporting: boolean;
  prioritySupport: boolean;
}

export interface Entitlements {
  modules: ModuleEntitlements;
  integrations: IntegrationEntitlements;
  features: FeatureEntitlements;
}

// =============================================================================
// Tenant DTOs
// =============================================================================

export interface SaasTenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: SaasTenantStatus;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  licenseKeyFingerprint?: string;
  licenseKeyRotatedAt?: string;
  seatLimits: SeatLimits;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  usage?: TenantUsageStats;
}

export interface TenantUsageStats {
  usersCount: number;
  organizationsCount: number;
  listingsCount: number;
  bookingsThisMonth: number;
  storageMb: number;
}

export interface SaasTenantWithStats extends SaasTenant {
  usage: TenantUsageStats;
}

// =============================================================================
// Plan DTOs
// =============================================================================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  seatLimits: SeatLimits;
  entitlements: Entitlements;
  basePrice: number;
  currency: string;
  billingPeriod: BillingPeriod;
  trialDays: number;
  isPublic: boolean;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Feature Flags DTOs
// =============================================================================

export interface FeatureFlagCatalogItem {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FeatureFlagType;
  defaultValue: unknown;
  category: FeatureFlagCategory;
  status: 'active' | 'deprecated';
  metadata?: Record<string, unknown>;
}

export interface TenantFeatureFlag {
  flagKey: string;
  value: unknown;
  enabled: boolean;
  reason?: string;
  updatedAt: string;
  updatedBy?: string;
}

// =============================================================================
// Category Entitlements
// =============================================================================

export interface CategoryEntitlement {
  id: string;
  tenantId: string;
  organizationId?: string;
  categoryKey: string;
  enabled: boolean;
  restrictions?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Billing DTOs
// =============================================================================

export interface TenantInvoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  invoiceUrl?: string;
}

export interface TenantBillingSummary {
  tenantId: string;
  status: BillingStatus;
  currentPlan?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  nextBillingDate?: string;
  invoices: TenantInvoice[];
}

export interface BillingOverview {
  totalRevenue: number;
  monthlyRecurring: number;
  activeSubscriptions: number;
  overdueCount: number;
  currency: string;
}

// =============================================================================
// Secrets DTOs
// =============================================================================

export interface MaskedSecret {
  key: string;
  provider: string;
  isConfigured: boolean;
  maskedValue?: string;
  fingerprint?: string;
  lastRotatedAt?: string;
  updatedAt: string;
}

// =============================================================================
// License Key DTOs
// =============================================================================

export interface LicenseKeyResponse {
  tenantId: string;
  licenseKey: string;
  fingerprint: string;
  rotatedAt: string;
  expiresAt?: string;
}

// =============================================================================
// SaaS Admin Capabilities
// =============================================================================

export interface SaasAdminCapabilities {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  tenantCount: number;
  activeTenantCount: number;
  totalUsers: number;
  totalBookings: number;
}

// =============================================================================
// Request DTOs
// =============================================================================

export interface SaasTenantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SaasTenantStatus;
  planId?: string;
  sortBy?: 'name' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateSaasTenantRequest {
  name: string;
  slug?: string;
  domain?: string;
  planId?: string;
  settings?: Record<string, unknown>;
  seatLimits?: Partial<SeatLimits>;
}

export interface UpdateSaasTenantRequest {
  name?: string;
  slug?: string;
  domain?: string;
  planId?: string;
  settings?: Record<string, unknown>;
  status?: SaasTenantStatus;
}

export interface SuspendTenantRequest {
  reason?: string;
  notifyAdmins?: boolean;
}

export interface UpdateSeatLimitsRequest {
  maxUsers?: number;
  maxOrganizations?: number;
  maxListings?: number;
  maxBookingsPerMonth?: number;
  maxStorageMb?: number;
}

export interface UpdateFeatureFlagsRequest {
  flags: Record<string, {
    value: unknown;
    enabled: boolean;
    reason?: string;
  }>;
}

export interface PlanQueryParams {
  page?: number;
  limit?: number;
  status?: PlanStatus;
  isPublic?: boolean;
}

export interface CreatePlanRequest {
  name: string;
  slug?: string;
  description?: string;
  seatLimits: SeatLimits;
  entitlements: Entitlements;
  basePrice: number;
  currency?: string;
  billingPeriod: BillingPeriod;
  trialDays?: number;
  isPublic?: boolean;
}

export interface UpdatePlanRequest {
  name?: string;
  description?: string;
  seatLimits?: Partial<SeatLimits>;
  entitlements?: Partial<Entitlements>;
  basePrice?: number;
  trialDays?: number;
  isPublic?: boolean;
  status?: PlanStatus;
}

export interface FeatureFlagsQueryParams {
  category?: FeatureFlagCategory;
  status?: 'active' | 'deprecated';
}

export interface UpdateCategoryEntitlementsRequest {
  categories: Array<{
    categoryKey: string;
    enabled: boolean;
    restrictions?: Record<string, unknown>;
    reason?: string;
  }>;
}

export interface UpdateSecretRequest {
  value: string;
  rotateExisting?: boolean;
}

// =============================================================================
// Scanner Types (Monitoring)
// =============================================================================

export type ScannerType = 'i18n' | 'design-system' | 'wcag';

export interface ScannerResult {
  success: boolean;
  timestamp: string;
  scanner: ScannerType;
  summary: {
    total: number;
    errors: number;
    warnings: number;
  };
  details?: Array<{
    file?: string;
    line?: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

// =============================================================================
// Audit Log Types
// =============================================================================

export interface AuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  resourceType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  actorId?: string;
  actorEmail?: string;
  tenantId?: string;
  timestamp: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditStats {
  totalEvents: number;
  todayEvents: number;
  weekEvents: number;
  topActions: Array<{ action: string; count: number }>;
  topActors: Array<{ actorId: string; email?: string; count: number }>;
}

// =============================================================================
// Seed Generation Types
// =============================================================================

export type SeedEntityType = 
  | 'users'
  | 'organizations'
  | 'listings'
  | 'bookings'
  | 'reviews'
  | 'categories'
  | 'all';

export interface SeedGenerationConfig {
  count?: number;
  locale?: string;
  tenantId?: string;
  options?: Record<string, unknown>;
}

// =============================================================================
// User Management Types (Platform-wide admin)
// =============================================================================

export interface PlatformUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  tenantId?: string;
  organizationId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListResponse {
  data: PlatformUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  tenantId?: string;
  role?: string;
  status?: 'active' | 'suspended' | 'pending';
}

