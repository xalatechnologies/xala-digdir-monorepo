/**
 * Licensing Service
 * Business logic for license plan and tenant license management
 * Handles license assignment, status updates, and entitlement resolution
 */
import { eq, and, sql } from 'drizzle-orm';
import { Injectable, Inject } from '../../core/decorators';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from '../../core/errors/problem-details';
import {
  licensePlans,
  licenseEntitlements,
  tenantLicenses,
  type LicensePlan,
  type NewLicensePlan,
  type LicenseEntitlement,
  type NewLicenseEntitlement,
  type TenantLicense,
  type NewTenantLicense,
} from '../../database/schema';
import type { PaginatedResult } from '../../database/base.repository';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * License status enum
 */
export type LicenseStatus = 'active' | 'trial' | 'suspended' | 'expired' | 'none';

/**
 * License plan with entitlements
 */
export interface LicensePlanWithEntitlements extends LicensePlan {
  entitlements: LicenseEntitlement[];
}

/**
 * Tenant license with plan details
 */
export interface TenantLicenseWithPlan extends TenantLicense {
  plan: LicensePlan;
  entitlements: LicenseEntitlement[];
}

/**
 * Create license plan input
 */
export interface CreateLicensePlanInput {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  entitlements?: Array<{
    entitlementKey: string;
    enabled?: boolean;
    quotaLimit?: number | null;
    metadata?: Record<string, unknown>;
  }>;
}

/**
 * Update license plan input
 */
export interface UpdateLicensePlanInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Assign license input
 */
export interface AssignLicenseInput {
  tenantId: string;
  planCode: string;
  status?: LicenseStatus;
  validFrom?: Date;
  validUntil?: Date;
  trialEndsAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Update tenant license input
 */
export interface UpdateTenantLicenseInput {
  planCode?: string;
  status?: LicenseStatus;
  validFrom?: Date;
  validUntil?: Date;
  trialEndsAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * License plan query params
 */
export interface LicensePlanQueryParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * License plan projection DTO (screen-ready)
 */
export interface LicensePlanProjectionDTO {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  entitlements: Array<{
    key: string;
    enabled: boolean;
    quotaLimit: number | null;
    unlimited: boolean;
  }>;
  metadata: Record<string, unknown>;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canAssign: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    enabled: boolean;
    reason?: string;
  }>;
}

/**
 * Tenant license projection DTO (screen-ready)
 */
export interface TenantLicenseProjectionDTO {
  tenantId: string;
  status: LicenseStatus;
  planCode: string;
  planName: string;
  validFrom: string | null;
  validUntil: string | null;
  trialEndsAt: string | null;
  isTrialActive: boolean;
  isExpired: boolean;
  isSuspended: boolean;
  daysRemaining: number | null;
  entitlements: Record<string, {
    key: string;
    enabled: boolean;
    quotaLimit: number | null;
    unlimited: boolean;
  }>;
  permissions: {
    canUpgrade: boolean;
    canDowngrade: boolean;
    canCancel: boolean;
    canRenew: boolean;
  };
  availableActions: Array<{
    action: string;
    label: string;
    href?: string;
    enabled: boolean;
    reason?: string;
  }>;
}

// ============================================================================
// Service Implementation
// ============================================================================

@Injectable()
export class LicensingService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  // ==========================================================================
  // License Plan Methods
  // ==========================================================================

  /**
   * Create a new license plan
   */
  async createLicensePlan(input: CreateLicensePlanInput, userId?: string): Promise<LicensePlanProjectionDTO> {
    // Check if code already exists
    const existing = await this.findPlanByCode(input.code);
    if (existing) {
      throw new ConflictError(`License plan with code '${input.code}' already exists`);
    }

    // Create the plan
    const planResult = await this.db
      .insert(licensePlans)
      .values({
        code: input.code,
        name: input.name,
        description: input.description,
        isActive: input.isActive ?? true,
        metadata: input.metadata ?? {},
      })
      .returning();

    const plan = planResult[0] as LicensePlan;

    // Create entitlements if provided
    let entitlements: LicenseEntitlement[] = [];
    if (input.entitlements && input.entitlements.length > 0) {
      const entitlementValues = input.entitlements.map((e) => ({
        planId: plan.id,
        entitlementKey: e.entitlementKey,
        enabled: e.enabled ?? true,
        quotaLimit: e.quotaLimit ?? null,
        metadata: e.metadata ?? {},
      }));

      entitlements = await this.db
        .insert(licenseEntitlements)
        .values(entitlementValues)
        .returning();
    }

    // Audit log the creation
    await this.logAudit(null, 'license_plan_created', 'license_plans', plan.id, {
      code: plan.code,
      name: plan.name,
      entitlementsCount: entitlements.length,
      userId,
    });

    this.adapters?.log?.info('License plan created', {
      planId: plan.id,
      code: plan.code,
    });

    return this.buildPlanProjectionDTO(plan, entitlements);
  }

  /**
   * Get license plan by ID
   */
  async findPlanById(id: string): Promise<LicensePlanWithEntitlements | null> {
    const planResults = await this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.id, id))
      .limit(1);

    const plan = planResults[0] as LicensePlan | undefined;
    if (!plan) {
      return null;
    }

    const entitlements = await this.db
      .select()
      .from(licenseEntitlements)
      .where(eq(licenseEntitlements.planId, plan.id));

    return { ...plan, entitlements };
  }

  /**
   * Get license plan by ID or throw
   */
  async findPlanByIdOrFail(id: string): Promise<LicensePlanWithEntitlements> {
    const plan = await this.findPlanById(id);
    if (!plan) {
      throw new NotFoundError('LicensePlan', id);
    }
    return plan;
  }

  /**
   * Get license plan by code
   */
  async findPlanByCode(code: string): Promise<LicensePlanWithEntitlements | null> {
    const planResults = await this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.code, code))
      .limit(1);

    const plan = planResults[0] as LicensePlan | undefined;
    if (!plan) {
      return null;
    }

    const entitlements = await this.db
      .select()
      .from(licenseEntitlements)
      .where(eq(licenseEntitlements.planId, plan.id));

    return { ...plan, entitlements };
  }

  /**
   * Get license plan by code or throw
   */
  async findPlanByCodeOrFail(code: string): Promise<LicensePlanWithEntitlements> {
    const plan = await this.findPlanByCode(code);
    if (!plan) {
      throw new NotFoundError('LicensePlan', code);
    }
    return plan;
  }

  /**
   * List all license plans
   */
  async findAllPlans(params: LicensePlanQueryParams = {}): Promise<PaginatedResult<LicensePlanProjectionDTO>> {
    const { page = 1, limit = 20, isActive } = params;
    const skip = (page - 1) * limit;

    // Build query conditions
    let whereClause;
    if (isActive !== undefined) {
      whereClause = eq(licensePlans.isActive, isActive);
    }

    // Get count
    let countQuery = this.db.select({ count: sql<number>`count(*)` }).from(licensePlans);
    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);

    // Get plans
    let dataQuery = this.db.select().from(licensePlans);
    if (whereClause) {
      dataQuery = dataQuery.where(whereClause);
    }
    const plans = await dataQuery.limit(limit).offset(skip);

    // Get entitlements for each plan
    const projectedPlans: LicensePlanProjectionDTO[] = [];
    for (const plan of plans) {
      const entitlements = await this.db
        .select()
        .from(licenseEntitlements)
        .where(eq(licenseEntitlements.planId, plan.id));

      projectedPlans.push(this.buildPlanProjectionDTO(plan, entitlements));
    }

    const totalPages = Math.ceil(total / limit);

    return {
      data: projectedPlans,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * List active license plans
   */
  async findActivePlans(): Promise<LicensePlanProjectionDTO[]> {
    const result = await this.findAllPlans({ isActive: true, limit: 100 });
    return result.data;
  }

  /**
   * Update license plan
   */
  async updatePlan(id: string, input: UpdateLicensePlanInput, userId?: string): Promise<LicensePlanProjectionDTO> {
    const existing = await this.findPlanByIdOrFail(id);

    const updateData: Partial<LicensePlan> = {
      ...input,
      updatedAt: new Date(),
    };

    const result = await this.db
      .update(licensePlans)
      .set(updateData)
      .where(eq(licensePlans.id, id))
      .returning();

    const plan = result[0] as LicensePlan;

    // Audit log
    await this.logAudit(null, 'license_plan_updated', 'license_plans', plan.id, {
      code: plan.code,
      changes: Object.keys(input),
      userId,
    });

    this.adapters?.log?.info('License plan updated', {
      planId: plan.id,
      code: plan.code,
      changes: Object.keys(input),
    });

    return this.buildPlanProjectionDTO(plan, existing.entitlements);
  }

  /**
   * Add entitlement to plan
   */
  async addEntitlement(
    planId: string,
    entitlement: {
      entitlementKey: string;
      enabled?: boolean;
      quotaLimit?: number | null;
      metadata?: Record<string, unknown>;
    },
    userId?: string
  ): Promise<LicenseEntitlement> {
    // Verify plan exists
    await this.findPlanByIdOrFail(planId);

    // Check if entitlement already exists
    const existingResults = await this.db
      .select()
      .from(licenseEntitlements)
      .where(
        and(
          eq(licenseEntitlements.planId, planId),
          eq(licenseEntitlements.entitlementKey, entitlement.entitlementKey)
        )
      )
      .limit(1);

    if (existingResults[0]) {
      throw new ConflictError(
        `Entitlement '${entitlement.entitlementKey}' already exists for this plan`
      );
    }

    const result = await this.db
      .insert(licenseEntitlements)
      .values({
        planId,
        entitlementKey: entitlement.entitlementKey,
        enabled: entitlement.enabled ?? true,
        quotaLimit: entitlement.quotaLimit ?? null,
        metadata: entitlement.metadata ?? {},
      })
      .returning();

    const created = result[0] as LicenseEntitlement;

    // Audit log
    await this.logAudit(null, 'license_entitlement_added', 'license_entitlements', created.id, {
      planId,
      entitlementKey: entitlement.entitlementKey,
      userId,
    });

    return created;
  }

  /**
   * Update entitlement
   */
  async updateEntitlement(
    entitlementId: string,
    input: { enabled?: boolean; quotaLimit?: number | null; metadata?: Record<string, unknown> },
    userId?: string
  ): Promise<LicenseEntitlement> {
    const result = await this.db
      .update(licenseEntitlements)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(licenseEntitlements.id, entitlementId))
      .returning();

    if (!result[0]) {
      throw new NotFoundError('LicenseEntitlement', entitlementId);
    }

    const entitlement = result[0] as LicenseEntitlement;

    // Audit log
    await this.logAudit(null, 'license_entitlement_updated', 'license_entitlements', entitlementId, {
      changes: Object.keys(input),
      userId,
    });

    return entitlement;
  }

  /**
   * Remove entitlement from plan
   */
  async removeEntitlement(entitlementId: string, userId?: string): Promise<void> {
    const result = await this.db
      .delete(licenseEntitlements)
      .where(eq(licenseEntitlements.id, entitlementId))
      .returning();

    if (!result[0]) {
      throw new NotFoundError('LicenseEntitlement', entitlementId);
    }

    // Audit log
    await this.logAudit(null, 'license_entitlement_removed', 'license_entitlements', entitlementId, {
      userId,
    });
  }

  // ==========================================================================
  // Tenant License Methods
  // ==========================================================================

  /**
   * Assign license to tenant
   */
  async assignLicense(input: AssignLicenseInput, userId?: string): Promise<TenantLicenseProjectionDTO> {
    // Get the plan
    const plan = await this.findPlanByCodeOrFail(input.planCode);
    if (!plan.isActive) {
      throw new BadRequestError(`License plan '${input.planCode}' is not active`);
    }

    // Check if tenant already has a license
    const existingLicense = await this.findTenantLicense(input.tenantId);
    if (existingLicense) {
      throw new ConflictError(`Tenant '${input.tenantId}' already has a license assigned`);
    }

    // Create the tenant license
    const result = await this.db
      .insert(tenantLicenses)
      .values({
        tenantId: input.tenantId,
        planId: plan.id,
        status: input.status || 'active',
        validFrom: input.validFrom || new Date(),
        validUntil: input.validUntil || null,
        trialEndsAt: input.trialEndsAt || null,
        metadata: input.metadata || {},
      })
      .returning();

    const license = result[0] as TenantLicense;

    // Invalidate capabilities cache
    await this.adapters?.cache?.delete(`capabilities:${input.tenantId}`);

    // Audit log
    await this.logAudit(input.tenantId, 'license_assigned', 'tenant_licenses', license.id, {
      planCode: input.planCode,
      status: license.status,
      userId,
    });

    this.adapters?.log?.info('License assigned to tenant', {
      tenantId: input.tenantId,
      planCode: input.planCode,
      licenseId: license.id,
    });

    return this.buildTenantLicenseProjectionDTO({
      ...license,
      plan,
      entitlements: plan.entitlements,
    });
  }

  /**
   * Get tenant license
   */
  async findTenantLicense(tenantId: string): Promise<TenantLicenseWithPlan | null> {
    const licenseResults = await this.db
      .select()
      .from(tenantLicenses)
      .where(eq(tenantLicenses.tenantId, tenantId))
      .limit(1);

    const license = licenseResults[0] as TenantLicense | undefined;
    if (!license) {
      return null;
    }

    const planResults = await this.db
      .select()
      .from(licensePlans)
      .where(eq(licensePlans.id, license.planId))
      .limit(1);

    const plan = planResults[0] as LicensePlan;
    if (!plan) {
      return null;
    }

    const entitlements = await this.db
      .select()
      .from(licenseEntitlements)
      .where(eq(licenseEntitlements.planId, plan.id));

    return { ...license, plan, entitlements };
  }

  /**
   * Get tenant license or throw
   */
  async findTenantLicenseOrFail(tenantId: string): Promise<TenantLicenseWithPlan> {
    const license = await this.findTenantLicense(tenantId);
    if (!license) {
      throw new NotFoundError('TenantLicense', tenantId);
    }
    return license;
  }

  /**
   * Get tenant license as projection DTO
   */
  async getTenantLicenseProjection(tenantId: string): Promise<TenantLicenseProjectionDTO> {
    // Try cache first
    const cached = await this.adapters?.cache?.get(`license:${tenantId}`) as TenantLicenseProjectionDTO | null;
    if (cached) {
      return cached;
    }

    const license = await this.findTenantLicense(tenantId);

    if (!license) {
      // Return default free plan projection
      return this.buildDefaultLicenseProjection(tenantId);
    }

    const dto = this.buildTenantLicenseProjectionDTO(license);

    // Cache the result
    await this.adapters?.cache?.set(`license:${tenantId}`, dto, 300);

    return dto;
  }

  /**
   * Update tenant license
   */
  async updateTenantLicense(
    tenantId: string,
    input: UpdateTenantLicenseInput,
    userId?: string
  ): Promise<TenantLicenseProjectionDTO> {
    const existing = await this.findTenantLicenseOrFail(tenantId);

    // If changing plan, get the new plan
    let plan = existing.plan;
    let entitlements = existing.entitlements;

    if (input.planCode && input.planCode !== existing.plan.code) {
      const newPlan = await this.findPlanByCodeOrFail(input.planCode);
      if (!newPlan.isActive) {
        throw new BadRequestError(`License plan '${input.planCode}' is not active`);
      }
      plan = newPlan;
      entitlements = newPlan.entitlements;
    }

    const updateData: Partial<TenantLicense> = {
      planId: plan.id,
      status: input.status,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      trialEndsAt: input.trialEndsAt,
      metadata: input.metadata,
      updatedAt: new Date(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const result = await this.db
      .update(tenantLicenses)
      .set(updateData)
      .where(eq(tenantLicenses.tenantId, tenantId))
      .returning();

    const license = result[0] as TenantLicense;

    // Invalidate caches
    await this.adapters?.cache?.delete(`license:${tenantId}`);
    await this.adapters?.cache?.delete(`capabilities:${tenantId}`);

    // Audit log
    await this.logAudit(tenantId, 'license_updated', 'tenant_licenses', license.id, {
      changes: Object.keys(input),
      previousStatus: existing.status,
      newStatus: license.status,
      userId,
    });

    this.adapters?.log?.info('Tenant license updated', {
      tenantId,
      changes: Object.keys(input),
    });

    return this.buildTenantLicenseProjectionDTO({
      ...license,
      plan,
      entitlements,
    });
  }

  /**
   * Update license status
   */
  async updateLicenseStatus(
    tenantId: string,
    status: LicenseStatus,
    userId?: string
  ): Promise<TenantLicenseProjectionDTO> {
    return this.updateTenantLicense(tenantId, { status }, userId);
  }

  /**
   * Suspend tenant license
   */
  async suspendLicense(tenantId: string, reason?: string, userId?: string): Promise<TenantLicenseProjectionDTO> {
    const license = await this.findTenantLicenseOrFail(tenantId);

    if (license.status === 'suspended') {
      throw new BadRequestError('License is already suspended');
    }

    const result = await this.updateLicenseStatus(tenantId, 'suspended', userId);

    // Audit log with reason
    await this.logAudit(tenantId, 'license_suspended', 'tenant_licenses', license.id, {
      reason,
      previousStatus: license.status,
      userId,
    });

    this.adapters?.log?.warn('Tenant license suspended', { tenantId, reason });

    return result;
  }

  /**
   * Reactivate suspended license
   */
  async reactivateLicense(tenantId: string, userId?: string): Promise<TenantLicenseProjectionDTO> {
    const license = await this.findTenantLicenseOrFail(tenantId);

    if (license.status !== 'suspended') {
      throw new BadRequestError('License is not suspended');
    }

    // Check if license is still valid
    const now = new Date();
    let newStatus: LicenseStatus = 'active';

    if (license.validUntil && new Date(license.validUntil) < now) {
      newStatus = 'expired';
    } else if (license.trialEndsAt && new Date(license.trialEndsAt) >= now) {
      newStatus = 'trial';
    }

    const result = await this.updateLicenseStatus(tenantId, newStatus, userId);

    // Audit log
    await this.logAudit(tenantId, 'license_reactivated', 'tenant_licenses', license.id, {
      newStatus,
      userId,
    });

    this.adapters?.log?.info('Tenant license reactivated', { tenantId, newStatus });

    return result;
  }

  /**
   * Remove license from tenant
   */
  async removeLicense(tenantId: string, userId?: string): Promise<void> {
    const license = await this.findTenantLicenseOrFail(tenantId);

    await this.db
      .delete(tenantLicenses)
      .where(eq(tenantLicenses.tenantId, tenantId));

    // Invalidate caches
    await this.adapters?.cache?.delete(`license:${tenantId}`);
    await this.adapters?.cache?.delete(`capabilities:${tenantId}`);

    // Audit log
    await this.logAudit(tenantId, 'license_removed', 'tenant_licenses', license.id, {
      planCode: license.plan.code,
      userId,
    });

    this.adapters?.log?.warn('Tenant license removed', { tenantId });
  }

  // ==========================================================================
  // License Status and Verification Methods
  // ==========================================================================

  /**
   * Compute current license status from license data
   */
  computeLicenseStatus(license: TenantLicenseWithPlan): LicenseStatus {
    const now = new Date();

    // Check explicit suspended status first
    if (license.status === 'suspended') {
      return 'suspended';
    }

    // Check if expired
    if (license.validUntil && new Date(license.validUntil) < now) {
      return 'expired';
    }

    // Check if in trial
    if (license.trialEndsAt) {
      if (new Date(license.trialEndsAt) >= now) {
        return 'trial';
      }
      // Trial ended, check if paid plan exists
      if (!license.validUntil) {
        return 'expired';
      }
    }

    // Check explicit status
    if (license.status === 'trial') {
      return 'trial';
    }

    if (license.status === 'expired') {
      return 'expired';
    }

    return 'active';
  }

  /**
   * Verify license is valid (not expired or suspended)
   */
  async verifyLicenseValid(tenantId: string): Promise<{ valid: boolean; status: LicenseStatus; reason?: string }> {
    const license = await this.findTenantLicense(tenantId);

    if (!license) {
      // No license = free plan, which is valid
      return { valid: true, status: 'none', reason: 'Using free plan' };
    }

    const status = this.computeLicenseStatus(license);

    if (status === 'suspended') {
      return { valid: false, status, reason: 'License is suspended' };
    }

    if (status === 'expired') {
      return { valid: false, status, reason: 'License has expired' };
    }

    return { valid: true, status };
  }

  /**
   * Check if tenant has specific entitlement
   */
  async hasTenantEntitlement(tenantId: string, entitlementKey: string): Promise<boolean> {
    const license = await this.findTenantLicense(tenantId);

    if (!license) {
      // Check default entitlements for free plan
      const defaultEntitlements = ['modules.listings', 'modules.bookings', 'modules.users'];
      return defaultEntitlements.includes(entitlementKey);
    }

    // Verify license is valid
    const status = this.computeLicenseStatus(license);
    if (status === 'expired' || status === 'suspended') {
      return false;
    }

    // Check entitlements
    const entitlement = license.entitlements.find((e) => e.entitlementKey === entitlementKey);
    return entitlement?.enabled ?? false;
  }

  /**
   * Get all entitlements for tenant
   */
  async getTenantEntitlements(tenantId: string): Promise<Record<string, { enabled: boolean; quotaLimit: number | null }>> {
    const license = await this.findTenantLicense(tenantId);

    if (!license) {
      // Return default free plan entitlements
      return {
        'modules.listings': { enabled: true, quotaLimit: 5 },
        'modules.bookings': { enabled: true, quotaLimit: 10 },
        'modules.users': { enabled: true, quotaLimit: 3 },
      };
    }

    const entitlements: Record<string, { enabled: boolean; quotaLimit: number | null }> = {};
    for (const e of license.entitlements) {
      entitlements[e.entitlementKey] = {
        enabled: e.enabled,
        quotaLimit: e.quotaLimit,
      };
    }

    return entitlements;
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Build license plan projection DTO
   */
  private buildPlanProjectionDTO(
    plan: LicensePlan,
    entitlements: LicenseEntitlement[]
  ): LicensePlanProjectionDTO {
    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      isActive: plan.isActive,
      metadata: (plan.metadata as Record<string, unknown>) || {},
      entitlements: entitlements.map((e) => ({
        key: e.entitlementKey,
        enabled: e.enabled,
        quotaLimit: e.quotaLimit,
        unlimited: e.quotaLimit === null,
      })),
      permissions: {
        canEdit: true,
        canDelete: !plan.isActive, // Can only delete inactive plans
        canAssign: plan.isActive,
      },
      availableActions: [
        {
          action: 'edit',
          label: 'Edit Plan',
          enabled: true,
        },
        {
          action: 'toggle_active',
          label: plan.isActive ? 'Deactivate' : 'Activate',
          enabled: true,
        },
        {
          action: 'delete',
          label: 'Delete Plan',
          enabled: !plan.isActive,
          reason: plan.isActive ? 'Cannot delete active plan' : undefined,
        },
      ],
    };
  }

  /**
   * Build tenant license projection DTO
   */
  private buildTenantLicenseProjectionDTO(license: TenantLicenseWithPlan): TenantLicenseProjectionDTO {
    const status = this.computeLicenseStatus(license);

    // Calculate days remaining
    let daysRemaining: number | null = null;
    const endDate = license.validUntil || license.trialEndsAt;
    if (endDate) {
      const now = new Date();
      const end = new Date(endDate);
      const diffTime = end.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Build entitlements record
    const entitlements: Record<string, { key: string; enabled: boolean; quotaLimit: number | null; unlimited: boolean }> = {};
    for (const e of license.entitlements) {
      entitlements[e.entitlementKey] = {
        key: e.entitlementKey,
        enabled: e.enabled,
        quotaLimit: e.quotaLimit,
        unlimited: e.quotaLimit === null,
      };
    }

    const isExpired = status === 'expired';
    const isSuspended = status === 'suspended';
    const isTrial = status === 'trial';

    return {
      tenantId: license.tenantId,
      status,
      planCode: license.plan.code,
      planName: license.plan.name,
      validFrom: license.validFrom?.toISOString() || null,
      validUntil: license.validUntil?.toISOString() || null,
      trialEndsAt: license.trialEndsAt?.toISOString() || null,
      isTrialActive: isTrial,
      isExpired,
      isSuspended,
      daysRemaining,
      entitlements,
      permissions: {
        canUpgrade: !isSuspended,
        canDowngrade: !isSuspended && !isExpired,
        canCancel: !isSuspended && !isExpired,
        canRenew: isExpired,
      },
      availableActions: this.buildTenantLicenseActions(status, isTrial, license.plan.code),
    };
  }

  /**
   * Build default license projection for tenants without a license
   */
  private buildDefaultLicenseProjection(tenantId: string): TenantLicenseProjectionDTO {
    return {
      tenantId,
      status: 'none',
      planCode: 'free',
      planName: 'Free Plan',
      validFrom: null,
      validUntil: null,
      trialEndsAt: null,
      isTrialActive: false,
      isExpired: false,
      isSuspended: false,
      daysRemaining: null,
      entitlements: {
        'modules.listings': { key: 'modules.listings', enabled: true, quotaLimit: 5, unlimited: false },
        'modules.bookings': { key: 'modules.bookings', enabled: true, quotaLimit: 10, unlimited: false },
        'modules.users': { key: 'modules.users', enabled: true, quotaLimit: 3, unlimited: false },
      },
      permissions: {
        canUpgrade: true,
        canDowngrade: false,
        canCancel: false,
        canRenew: false,
      },
      availableActions: [
        {
          action: 'upgrade_plan',
          label: 'Upgrade Plan',
          href: '/settings/billing/plans',
          enabled: true,
        },
        {
          action: 'view_plans',
          label: 'View Available Plans',
          href: '/settings/billing/plans',
          enabled: true,
        },
      ],
    };
  }

  /**
   * Build available actions for tenant license
   */
  private buildTenantLicenseActions(
    status: LicenseStatus,
    isTrial: boolean,
    planCode: string
  ): TenantLicenseProjectionDTO['availableActions'] {
    const actions: TenantLicenseProjectionDTO['availableActions'] = [];

    // Upgrade action
    if (status !== 'suspended') {
      actions.push({
        action: 'upgrade_plan',
        label: 'Upgrade Plan',
        href: '/settings/billing/plans',
        enabled: true,
      });
    }

    // Trial-specific actions
    if (isTrial) {
      actions.push({
        action: 'convert_to_paid',
        label: 'Convert to Paid Plan',
        href: '/settings/billing/subscribe',
        enabled: true,
      });
    }

    // Renew action for expired licenses
    if (status === 'expired') {
      actions.push({
        action: 'renew_license',
        label: 'Renew License',
        href: '/settings/billing/renew',
        enabled: true,
      });
    }

    // Contact support for suspended
    if (status === 'suspended') {
      actions.push({
        action: 'contact_support',
        label: 'Contact Support',
        href: '/support',
        enabled: true,
        reason: 'License is suspended',
      });
    }

    // View usage
    actions.push({
      action: 'view_usage',
      label: 'View Usage',
      href: '/settings/usage',
      enabled: true,
    });

    // Manage billing (if not on free plan)
    if (planCode !== 'free' && status !== 'none') {
      actions.push({
        action: 'manage_billing',
        label: 'Manage Billing',
        href: '/settings/billing',
        enabled: status !== 'suspended',
        reason: status === 'suspended' ? 'License is suspended' : undefined,
      });
    }

    return actions;
  }

  /**
   * Log audit event
   */
  private async logAudit(
    tenantId: string | null,
    action: string,
    resource: string,
    resourceId: string | null,
    metadata: Record<string, unknown>
  ): Promise<void> {
    try {
      if (this.adapters?.audit) {
        await this.adapters.audit.log({
          tenantId,
          action,
          resource,
          resourceId,
          metadata,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      // Log but don't throw - audit failure shouldn't break the operation
      this.adapters?.log?.error('Failed to log audit event', {
        tenantId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
