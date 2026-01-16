/**
 * SaaS Admin Service
 * Business logic for SaaS platform administration
 */
import { Injectable, Inject } from '../../core/decorators';
import { validate } from '../../core/validation/zod-pipe';
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../core/errors/problem-details';
import {
  SaasTenantQuerySchema,
  CreateSaasTenantSchema,
  UpdateSaasTenantSchema,
  UpdateSeatLimitsSchema,
  UpdateFeatureFlagsSchema,
  CreatePlanSchema,
  SaasAuditActions,
  type SaasTenantQueryParams,
  type CreateSaasTenantDTO,
  type UpdateSaasTenantDTO,
  type UpdateSeatLimitsDTO,
  type UpdateFeatureFlagsDTO,
  type CreatePlanInput,
  type TenantDetailResponse,
  type TenantListResponse,
  type PlanListResponse,
  type FeatureFlagsCatalogResponse,
  type LicenseKeyResponse,
  type SaasCapabilityProjection,
} from './saas.types';
import {
  isSaasRole,
  getCapabilityProjection,
  hasPermission,
  SaasRoles,
} from '../auth/rbac';
import type { Tenant, Plan } from '../../database/schema';
import type { PaginatedResult } from '../../database/base.repository';
import * as crypto from 'crypto';

@Injectable()
export class SaasService {
  constructor(
    @Inject('Adapters') private readonly adapters: any
  ) {}

  // ==========================================================================
  // Capability Projection
  // ==========================================================================

  /**
   * Get SaaS admin capabilities for the current user
   */
  async getCapabilities(userId: string, role: string): Promise<SaasCapabilityProjection> {
    if (!isSaasRole(role)) {
      throw new ForbiddenError('This endpoint is only available to SaaS administrators');
    }

    const projection = getCapabilityProjection(role);

    return {
      role: projection.role,
      level: 'saas',
      permissions: projection.permissions,
      allowedActions: {
        canCreateTenant: hasPermission(role, 'saas:tenants:create'),
        canManagePlans: hasPermission(role, 'saas:plans:*'),
        canRotateLicenseKeys: hasPermission(role, 'saas:tenants:*'),
        canAccessBilling: hasPermission(role, 'saas:billing:read'),
        canManageSecrets: hasPermission(role, 'saas:secrets:*'),
        canViewAuditLogs: hasPermission(role, 'saas:audit:read'),
        canManageSupport: hasPermission(role, 'saas:support:*'),
      },
    };
  }

  // ==========================================================================
  // Tenant Management
  // ==========================================================================

  /**
   * List all tenants with pagination and filtering
   */
  async listTenants(params: SaasTenantQueryParams): Promise<TenantListResponse> {
    const validated = validate(SaasTenantQuerySchema, params);
    const page = validated.page ?? 1;
    const limit = validated.limit ?? 20;
    const { status, planId, search, sortBy, sortOrder } = validated;

    // This would use a repository in a real implementation
    // For now, return a structured response
    const mockData: Tenant[] = [];
    const total = 0;

    this.adapters?.log?.info('SaaS: Listing tenants', {
      params: validated,
    });

    return {
      data: mockData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get tenant by ID with full details
   */
  async getTenantById(tenantId: string): Promise<TenantDetailResponse> {
    // This would use a repository in a real implementation
    const tenant = await this.findTenantById(tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    this.adapters?.log?.info('SaaS: Retrieved tenant details', { tenantId });

    return {
      tenant,
      subscription: null,
      plan: null,
      featureFlags: [],
      usage: {
        currentUsers: 0,
        currentOrganizations: 0,
        currentListings: 0,
        bookingsThisMonth: 0,
        storageMb: 0,
      },
    };
  }

  /**
   * Create a new tenant
   */
  async createTenant(
    data: CreateSaasTenantDTO,
    actorId: string
  ): Promise<TenantDetailResponse> {
    const validated = validate(CreateSaasTenantSchema, data);

    // Check slug availability
    const existingSlug = await this.isTenantSlugAvailable(validated.slug);
    if (!existingSlug) {
      throw new ConflictError(`Tenant slug '${validated.slug}' is already taken`);
    }

    // Generate license key
    const licenseKey = this.generateLicenseKey();
    const licenseKeyHash = this.hashLicenseKey(licenseKey);

    // Default seat limits
    const defaultSeatLimits = validated.seatLimits || {
      maxUsers: 5,
      maxOrganizations: 1,
      maxListings: 10,
      maxBookingsPerMonth: 100,
      maxStorageMb: 500,
    };

    // Create tenant (this would use a repository)
    const tenant: Tenant = {
      id: crypto.randomUUID(),
      name: validated.name,
      slug: validated.slug,
      domain: validated.domain || null,
      settings: {},
      status: 'active',
      subscriptionPlanId: validated.planId || null,
      licenseKeyHash,
      licenseKeyRotatedAt: new Date(),
      seatLimits: defaultSeatLimits,
      brandingVersionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Log audit event
    await this.logAuditEvent(
      SaasAuditActions.TENANT_CREATED,
      'tenant',
      tenant.id,
      actorId,
      { name: validated.name, slug: validated.slug }
    );

    this.adapters?.log?.info('SaaS: Tenant created', {
      tenantId: tenant.id,
      slug: validated.slug,
      actorId,
    });

    // Track analytics
    await this.adapters?.analytics?.track('saas_tenant_created', {
      tenantId: tenant.id,
      planId: validated.planId,
    });

    return {
      tenant,
      subscription: null,
      plan: null,
      featureFlags: [],
      usage: {
        currentUsers: 0,
        currentOrganizations: 0,
        currentListings: 0,
        bookingsThisMonth: 0,
        storageMb: 0,
      },
    };
  }

  /**
   * Update tenant details
   */
  async updateTenant(
    tenantId: string,
    data: UpdateSaasTenantDTO,
    actorId: string
  ): Promise<TenantDetailResponse> {
    const validated = validate(UpdateSaasTenantSchema, data);

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Check if status change to suspended
    if (validated.status === 'suspended' && tenant.status !== 'suspended') {
      await this.logAuditEvent(
        SaasAuditActions.TENANT_SUSPENDED,
        'tenant',
        tenantId,
        actorId,
        { previousStatus: tenant.status }
      );
    } else if (validated.status === 'active' && tenant.status === 'suspended') {
      await this.logAuditEvent(
        SaasAuditActions.TENANT_ACTIVATED,
        'tenant',
        tenantId,
        actorId,
        { previousStatus: tenant.status }
      );
    }

    // Apply updates
    const updatedTenant: Tenant = {
      ...tenant,
      name: validated.name ?? tenant.name,
      domain: validated.domain !== undefined ? validated.domain : tenant.domain,
      status: validated.status ?? tenant.status,
      subscriptionPlanId: validated.planId !== undefined ? validated.planId : tenant.subscriptionPlanId,
      seatLimits: validated.seatLimits
        ? { ...tenant.seatLimits as object, ...validated.seatLimits }
        : tenant.seatLimits,
      updatedAt: new Date(),
    };

    await this.logAuditEvent(
      SaasAuditActions.TENANT_UPDATED,
      'tenant',
      tenantId,
      actorId,
      { changes: Object.keys(validated) }
    );

    this.adapters?.log?.info('SaaS: Tenant updated', {
      tenantId,
      changes: Object.keys(validated),
      actorId,
    });

    return {
      tenant: updatedTenant,
      subscription: null,
      plan: null,
      featureFlags: [],
      usage: {
        currentUsers: 0,
        currentOrganizations: 0,
        currentListings: 0,
        bookingsThisMonth: 0,
        storageMb: 0,
      },
    };
  }

  /**
   * Suspend a tenant
   */
  async suspendTenant(tenantId: string, reason: string, actorId: string): Promise<TenantDetailResponse> {
    return this.updateTenant(
      tenantId,
      { status: 'suspended' },
      actorId
    );
  }

  /**
   * Activate a suspended tenant
   */
  async activateTenant(tenantId: string, actorId: string): Promise<TenantDetailResponse> {
    return this.updateTenant(
      tenantId,
      { status: 'active' },
      actorId
    );
  }

  // ==========================================================================
  // Seat Limits
  // ==========================================================================

  /**
   * Update tenant seat limits
   */
  async updateSeatLimits(
    tenantId: string,
    data: UpdateSeatLimitsDTO,
    actorId: string
  ): Promise<TenantDetailResponse> {
    const validated = validate(UpdateSeatLimitsSchema, data);

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    const currentLimits = tenant.seatLimits as object || {};
    const newLimits = { ...currentLimits, ...validated.seatLimits };

    await this.logAuditEvent(
      SaasAuditActions.SEAT_LIMITS_UPDATED,
      'tenant',
      tenantId,
      actorId,
      { previousLimits: currentLimits, newLimits }
    );

    this.adapters?.log?.info('SaaS: Seat limits updated', {
      tenantId,
      previousLimits: currentLimits,
      newLimits,
      actorId,
    });

    return this.getTenantById(tenantId);
  }

  // ==========================================================================
  // Feature Flags
  // ==========================================================================

  /**
   * Get feature flags catalog
   */
  async getFeatureFlagsCatalog(): Promise<FeatureFlagsCatalogResponse> {
    // This would use a repository in a real implementation
    return {
      data: [],
      meta: { total: 0 },
    };
  }

  /**
   * Update tenant feature flags
   */
  async updateTenantFeatureFlags(
    tenantId: string,
    data: UpdateFeatureFlagsDTO,
    actorId: string
  ): Promise<TenantDetailResponse> {
    const validated = validate(UpdateFeatureFlagsSchema, data);

    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    await this.logAuditEvent(
      SaasAuditActions.FEATURE_FLAGS_UPDATED,
      'tenant',
      tenantId,
      actorId,
      { flags: validated.flags, reason: validated.reason }
    );

    this.adapters?.log?.info('SaaS: Feature flags updated', {
      tenantId,
      flagsCount: Object.keys(validated.flags).length,
      actorId,
    });

    return this.getTenantById(tenantId);
  }

  // ==========================================================================
  // License Keys
  // ==========================================================================

  /**
   * Rotate tenant license key
   */
  async rotateLicenseKey(tenantId: string, actorId: string): Promise<LicenseKeyResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Generate new license key
    const newLicenseKey = this.generateLicenseKey();
    const newLicenseKeyHash = this.hashLicenseKey(newLicenseKey);
    const rotatedAt = new Date();

    // Update tenant (this would use a repository)
    // tenant.licenseKeyHash = newLicenseKeyHash;
    // tenant.licenseKeyRotatedAt = rotatedAt;

    await this.logAuditEvent(
      SaasAuditActions.LICENSE_KEY_ROTATED,
      'tenant',
      tenantId,
      actorId,
      { rotatedAt: rotatedAt.toISOString() }
    );

    this.adapters?.log?.info('SaaS: License key rotated', {
      tenantId,
      rotatedAt,
      actorId,
    });

    // Return masked key (only first and last 4 chars visible)
    const maskedKey = this.maskLicenseKey(newLicenseKey);

    return {
      tenantId,
      maskedKey,
      rotatedAt,
    };
  }

  // ==========================================================================
  // Plans
  // ==========================================================================

  /**
   * List all subscription plans
   */
  async listPlans(): Promise<PlanListResponse> {
    // This would use a repository in a real implementation
    return {
      data: [],
      meta: { total: 0 },
    };
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(data: CreatePlanInput, actorId: string): Promise<Plan> {
    const validated = validate(CreatePlanSchema, data);

    // Generate slug from name if not provided
    const slug = validated.slug || this.generateSlugFromName(validated.name);

    // Check slug availability
    const slugAvailable = await this.isPlanSlugAvailable(slug);
    if (!slugAvailable) {
      throw new ConflictError(`Plan slug '${slug}' is already taken`);
    }

    // Create plan (this would use a repository in a real implementation)
    const plan: Plan = {
      id: crypto.randomUUID(),
      name: validated.name,
      slug,
      description: validated.description || null,
      displayOrder: 0,
      basePrice: validated.basePrice,
      currency: validated.currency ?? 'NOK',
      billingPeriod: validated.billingPeriod ?? 'monthly',
      seatLimits: validated.seatLimits,
      entitlements: validated.entitlements || {},
      trialDays: 0,
      isPublic: true,
      status: validated.isActive !== false ? 'active' : 'inactive',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Log audit event
    await this.logAuditEvent(
      SaasAuditActions.PLAN_CREATED,
      'plan',
      plan.id,
      actorId,
      { name: plan.name, slug: plan.slug, basePrice: plan.basePrice, billingPeriod: plan.billingPeriod }
    );

    this.adapters?.log?.info('SaaS: Plan created', {
      planId: plan.id,
      slug: plan.slug,
      actorId,
    });

    // Track analytics
    await this.adapters?.analytics?.track('saas_plan_created', {
      planId: plan.id,
      basePrice: plan.basePrice,
      billingPeriod: plan.billingPeriod,
    });

    return plan;
  }

  /**
   * Assign plan to tenant
   */
  async assignPlan(
    tenantId: string,
    planId: string,
    actorId: string
  ): Promise<TenantDetailResponse> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) {
      throw new NotFoundError('Tenant', tenantId);
    }

    // Validate plan exists
    // const plan = await this.findPlanById(planId);
    // if (!plan) {
    //   throw new NotFoundError('Plan', planId);
    // }

    await this.logAuditEvent(
      SaasAuditActions.PLAN_ASSIGNED,
      'tenant',
      tenantId,
      actorId,
      { previousPlanId: tenant.subscriptionPlanId, newPlanId: planId }
    );

    this.adapters?.log?.info('SaaS: Plan assigned to tenant', {
      tenantId,
      planId,
      actorId,
    });

    return this.updateTenant(tenantId, { planId }, actorId);
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Find tenant by ID (placeholder for repository)
   */
  private async findTenantById(tenantId: string): Promise<Tenant | null> {
    // This would use a repository in a real implementation
    // For now, return null to indicate not found
    return null;
  }

  /**
   * Check if tenant slug is available
   */
  private async isTenantSlugAvailable(slug: string): Promise<boolean> {
    // This would use a repository in a real implementation
    return true;
  }

  /**
   * Check if plan slug is available
   */
  private async isPlanSlugAvailable(slug: string): Promise<boolean> {
    // This would use a repository in a real implementation
    return true;
  }

  /**
   * Generate slug from name
   */
  private generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }

  /**
   * Generate a new license key
   */
  private generateLicenseKey(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segments = 4;
    const segmentLength = 5;
    const parts: string[] = [];

    for (let i = 0; i < segments; i++) {
      let segment = '';
      for (let j = 0; j < segmentLength; j++) {
        segment += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      parts.push(segment);
    }

    return parts.join('-');
  }

  /**
   * Hash license key for storage
   */
  private hashLicenseKey(licenseKey: string): string {
    return crypto.createHash('sha256').update(licenseKey).digest('hex');
  }

  /**
   * Mask license key for display
   */
  private maskLicenseKey(licenseKey: string): string {
    if (licenseKey.length <= 8) {
      return '*'.repeat(licenseKey.length);
    }
    return `${licenseKey.substring(0, 4)}${'*'.repeat(licenseKey.length - 8)}${licenseKey.substring(licenseKey.length - 4)}`;
  }

  /**
   * Log an audit event
   */
  private async logAuditEvent(
    action: string,
    resource: string,
    resourceId: string,
    actorId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    // This would use an audit service/repository in a real implementation
    this.adapters?.audit?.log({
      action,
      resource,
      resourceId,
      userId: actorId,
      metadata,
      timestamp: new Date(),
    });
  }
}
