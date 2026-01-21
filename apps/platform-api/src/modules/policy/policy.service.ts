/**
 * Policy Set Service
 * Business logic for versioned, publishable policy management
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { container } from '../../core/container';
import { getAuditService } from '../../core/audit.service';
import type { PolicySet, NewPolicySet, PolicySetAuditEntry, BookingPolicyRules, PricingPolicyRules, ApprovalPolicyRules, PaymentPolicyRules, AvailabilityPolicyRules } from '../../database/schema/policy';
import { policySets, policySetAudit, rentalObjectPolicies } from '../../database/schema/policy';
import { NotFoundError, ConflictError, ValidationError } from '../../core/errors';

// =============================================================================
// Types
// =============================================================================

export type PolicyType = 'booking' | 'pricing' | 'approval' | 'payment' | 'availability' | 'privacy' | 'compliance';
export type PolicyStatus = 'draft' | 'published' | 'archived' | 'deprecated';

export interface PolicySetDTO {
  id: string;
  tenantId: string;
  policyType: PolicyType;
  version: number;
  name: string;
  description?: string;
  rules: Record<string, unknown>;
  status: PolicyStatus;
  publishedAt?: string;
  publishedBy?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicySetInput {
  policyType: PolicyType;
  name: string;
  description?: string;
  rules: Record<string, unknown>;
}

export interface UpdatePolicySetInput {
  name?: string;
  description?: string;
  rules?: Record<string, unknown>;
}

export interface PublishPolicyInput {
  reason?: string;
}

export interface RollbackPolicyInput {
  targetVersion: number;
  reason?: string;
}

export interface PolicyProjection {
  booking?: BookingPolicyRules;
  pricing?: PricingPolicyRules;
  approval?: ApprovalPolicyRules;
  payment?: PaymentPolicyRules;
  availability?: AvailabilityPolicyRules;
}

// =============================================================================
// Service
// =============================================================================

export class PolicySetService {
  private db: any;
  private cache: any;
  private auditService = getAuditService();

  constructor() {
    this.db = container.resolve<any>('Database');
    try {
      this.cache = container.resolve<any>('Cache');
    } catch {
      this.cache = null;
    }
  }

  // ---------------------------------------------------------------------------
  // CRUD Operations
  // ---------------------------------------------------------------------------

  /**
   * Create a new policy set (starts as draft)
   */
  async create(
    tenantId: string,
    input: CreatePolicySetInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<PolicySetDTO> {
    // Find the latest version for this policy type
    const latestPolicy = await this.db
      .select()
      .from(policySets)
      .where(and(
        eq(policySets.tenantId, tenantId),
        eq(policySets.policyType, input.policyType)
      ))
      .orderBy(desc(policySets.version))
      .limit(1);

    const newVersion = latestPolicy.length > 0 ? latestPolicy[0].version + 1 : 1;

    const [created] = await this.db
      .insert(policySets)
      .values({
        tenantId,
        policyType: input.policyType,
        version: newVersion,
        name: input.name,
        description: input.description,
        rules: input.rules,
        status: 'draft',
        createdBy: context.userId,
      })
      .returning();

    // Create audit entry
    await this.createAuditEntry(created.id, tenantId, 'create', null, created, context);

    // Log to compliance audit
    await this.auditService.logAction({
      tenantId,
      userId: context.userId,
      action: 'policy_set.create',
      resource: 'policy_set',
      resourceId: created.id,
      metadata: { policyType: input.policyType, version: newVersion },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.toDTO(created);
  }

  /**
   * Get a policy set by ID
   */
  async getById(id: string): Promise<PolicySetDTO | null> {
    const [policy] = await this.db
      .select()
      .from(policySets)
      .where(eq(policySets.id, id))
      .limit(1);

    return policy ? this.toDTO(policy) : null;
  }

  /**
   * Get policy by ID or throw
   */
  async getByIdOrFail(id: string): Promise<PolicySetDTO> {
    const policy = await this.getById(id);
    if (!policy) {
      throw new NotFoundError('Policy set', id);
    }
    return policy;
  }

  /**
   * Get all policies for a tenant
   */
  async getByTenant(
    tenantId: string,
    filters?: { policyType?: PolicyType; status?: PolicyStatus }
  ): Promise<PolicySetDTO[]> {
    let query = this.db
      .select()
      .from(policySets)
      .where(eq(policySets.tenantId, tenantId));

    if (filters?.policyType) {
      query = query.where(eq(policySets.policyType, filters.policyType));
    }

    if (filters?.status) {
      query = query.where(eq(policySets.status, filters.status));
    }

    const results = await query.orderBy(policySets.policyType, desc(policySets.version));
    return results.map((p: PolicySet) => this.toDTO(p));
  }

  /**
   * Get the latest published policy of a given type
   */
  async getPublished(tenantId: string, policyType: PolicyType): Promise<PolicySetDTO | null> {
    const cacheKey = `policy:${tenantId}:${policyType}:published`;
    
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const [policy] = await this.db
      .select()
      .from(policySets)
      .where(and(
        eq(policySets.tenantId, tenantId),
        eq(policySets.policyType, policyType),
        eq(policySets.status, 'published')
      ))
      .orderBy(desc(policySets.version))
      .limit(1);

    const dto = policy ? this.toDTO(policy) : null;

    // Cache for 5 minutes
    if (this.cache && dto) {
      await this.cache.setex(cacheKey, 300, JSON.stringify(dto));
    }

    return dto;
  }

  /**
   * Update a draft policy
   */
  async update(
    id: string,
    input: UpdatePolicySetInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<PolicySetDTO> {
    const existing = await this.getByIdOrFail(id);

    if (existing.status !== 'draft') {
      throw new ConflictError('Cannot update a non-draft policy. Create a new version instead.');
    }

    const [oldState] = await this.db
      .select()
      .from(policySets)
      .where(eq(policySets.id, id));

    const [updated] = await this.db
      .update(policySets)
      .set({
        name: input.name ?? existing.name,
        description: input.description ?? existing.description,
        rules: input.rules ?? existing.rules,
        updatedAt: new Date(),
      })
      .where(eq(policySets.id, id))
      .returning();

    await this.createAuditEntry(id, existing.tenantId, 'update', oldState, updated, context);

    return this.toDTO(updated);
  }

  // ---------------------------------------------------------------------------
  // Publish/Rollback Workflow
  // ---------------------------------------------------------------------------

  /**
   * Publish a draft policy
   */
  async publish(
    id: string,
    input: PublishPolicyInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<PolicySetDTO> {
    const existing = await this.getByIdOrFail(id);

    if (existing.status !== 'draft') {
      throw new ConflictError('Only draft policies can be published.');
    }

    // Archive previously published version of same type
    await this.db
      .update(policySets)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(and(
        eq(policySets.tenantId, existing.tenantId),
        eq(policySets.policyType, existing.policyType as PolicyType),
        eq(policySets.status, 'published')
      ));

    const [oldState] = await this.db
      .select()
      .from(policySets)
      .where(eq(policySets.id, id));

    const [published] = await this.db
      .update(policySets)
      .set({
        status: 'published',
        publishedAt: new Date(),
        publishedBy: context.userId,
        updatedAt: new Date(),
      })
      .where(eq(policySets.id, id))
      .returning();

    await this.createAuditEntry(id, existing.tenantId, 'publish', oldState, published, context, input.reason);

    // Invalidate cache
    await this.invalidateCache(existing.tenantId, existing.policyType as PolicyType);

    // Log to compliance audit
    await this.auditService.logAction({
      tenantId: existing.tenantId,
      userId: context.userId,
      action: 'policy_set.publish',
      resource: 'policy_set',
      resourceId: id,
      severity: 'warning',
      metadata: { policyType: existing.policyType, version: existing.version },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.toDTO(published);
  }

  /**
   * Rollback to a previous version
   */
  async rollback(
    tenantId: string,
    policyType: PolicyType,
    input: RollbackPolicyInput,
    context: { userId?: string; ipAddress?: string; userAgent?: string }
  ): Promise<PolicySetDTO> {
    // Find the target version
    const [targetPolicy] = await this.db
      .select()
      .from(policySets)
      .where(and(
        eq(policySets.tenantId, tenantId),
        eq(policySets.policyType, policyType),
        eq(policySets.version, input.targetVersion)
      ))
      .limit(1);

    if (!targetPolicy) {
      throw new NotFoundError(`Policy version ${input.targetVersion}`, policyType);
    }

    // Archive currently published
    await this.db
      .update(policySets)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(and(
        eq(policySets.tenantId, tenantId),
        eq(policySets.policyType, policyType),
        eq(policySets.status, 'published')
      ));

    // Create a new version as a copy of the target
    const latestPolicy = await this.db
      .select()
      .from(policySets)
      .where(and(
        eq(policySets.tenantId, tenantId),
        eq(policySets.policyType, policyType)
      ))
      .orderBy(desc(policySets.version))
      .limit(1);

    const newVersion = latestPolicy[0].version + 1;

    const [rolledBack] = await this.db
      .insert(policySets)
      .values({
        tenantId,
        policyType,
        version: newVersion,
        name: `${targetPolicy.name} (rollback)`,
        description: `Rollback to version ${input.targetVersion}. ${input.reason || ''}`,
        rules: targetPolicy.rules,
        status: 'published',
        publishedAt: new Date(),
        publishedBy: context.userId,
        createdBy: context.userId,
      })
      .returning();

    await this.createAuditEntry(rolledBack.id, tenantId, 'rollback', targetPolicy, rolledBack, context, input.reason);

    // Invalidate cache
    await this.invalidateCache(tenantId, policyType);

    // Log to compliance audit
    await this.auditService.logAction({
      tenantId,
      userId: context.userId,
      action: 'policy_set.rollback',
      resource: 'policy_set',
      resourceId: rolledBack.id,
      severity: 'warning',
      metadata: { policyType, fromVersion: input.targetVersion, toVersion: newVersion },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.toDTO(rolledBack);
  }

  // ---------------------------------------------------------------------------
  // Policy Projection (for runtime)
  // ---------------------------------------------------------------------------

  /**
   * Get all published policies for a tenant as a projection
   */
  async getProjection(tenantId: string, rentalObjectId?: string): Promise<PolicyProjection> {
    const projection: PolicyProjection = {};

    // If rental object specified, check for specific policies first
    if (rentalObjectId) {
      const [roPolicy] = await this.db
        .select()
        .from(rentalObjectPolicies)
        .where(and(
          eq(rentalObjectPolicies.tenantId, tenantId),
          eq(rentalObjectPolicies.rentalObjectId, rentalObjectId)
        ))
        .limit(1);

      if (roPolicy && !roPolicy.useTenantDefaults) {
        // Load specific policies
        if (roPolicy.bookingPolicyId) {
          const bp = await this.getById(roPolicy.bookingPolicyId);
          if (bp) projection.booking = bp.rules as BookingPolicyRules;
        }
        if (roPolicy.pricingPolicyId) {
          const pp = await this.getById(roPolicy.pricingPolicyId);
          if (pp) projection.pricing = pp.rules as PricingPolicyRules;
        }
        // ... continue for other types
        return projection;
      }
    }

    // Load tenant default policies
    const policyTypes: PolicyType[] = ['booking', 'pricing', 'approval', 'payment', 'availability'];
    
    for (const policyType of policyTypes) {
      const policy = await this.getPublished(tenantId, policyType);
      if (policy) {
        switch (policyType) {
          case 'booking':
            projection.booking = policy.rules as BookingPolicyRules;
            break;
          case 'pricing':
            projection.pricing = policy.rules as PricingPolicyRules;
            break;
          case 'approval':
            projection.approval = policy.rules as ApprovalPolicyRules;
            break;
          case 'payment':
            projection.payment = policy.rules as PaymentPolicyRules;
            break;
          case 'availability':
            projection.availability = policy.rules as AvailabilityPolicyRules;
            break;
        }
      }
    }

    return projection;
  }

  // ---------------------------------------------------------------------------
  // Audit History
  // ---------------------------------------------------------------------------

  /**
   * Get audit history for a policy set
   */
  async getAuditHistory(policySetId: string): Promise<PolicySetAuditEntry[]> {
    const results = await this.db
      .select()
      .from(policySetAudit)
      .where(eq(policySetAudit.policySetId, policySetId))
      .orderBy(desc(policySetAudit.createdAt));

    return results;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private async createAuditEntry(
    policySetId: string,
    tenantId: string,
    action: string,
    oldState: any,
    newState: any,
    context: { userId?: string },
    reason?: string
  ): Promise<void> {
    await this.db.insert(policySetAudit).values({
      policySetId,
      tenantId,
      action,
      oldState,
      newState,
      actorUserId: context.userId,
      reason,
    });
  }

  private async invalidateCache(tenantId: string, policyType: PolicyType): Promise<void> {
    if (this.cache) {
      await this.cache.del(`policy:${tenantId}:${policyType}:published`);
    }
  }

  private toDTO(policy: PolicySet): PolicySetDTO {
    return {
      id: policy.id,
      tenantId: policy.tenantId,
      policyType: policy.policyType as PolicyType,
      version: policy.version,
      name: policy.name,
      description: policy.description ?? undefined,
      rules: policy.rules as Record<string, unknown>,
      status: policy.status as PolicyStatus,
      publishedAt: policy.publishedAt?.toISOString(),
      publishedBy: policy.publishedBy ?? undefined,
      createdBy: policy.createdBy ?? undefined,
      createdAt: policy.createdAt.toISOString(),
      updatedAt: policy.updatedAt.toISOString(),
    };
  }
}

// =============================================================================
// Singleton
// =============================================================================

let policySetServiceInstance: PolicySetService | null = null;

export function getPolicySetService(): PolicySetService {
  if (!policySetServiceInstance) {
    policySetServiceInstance = new PolicySetService();
  }
  return policySetServiceInstance;
}
