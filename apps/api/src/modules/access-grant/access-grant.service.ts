/**
 * Access Grant Service
 * Business logic for commune-to-org rental object access delegation
 */
import { container } from '../../core/container';
import { eq, and, count, desc } from 'drizzle-orm';
import {
  accessGrants,
  organizations,
  listings,
  users,
  type AccessGrant,
  type NewAccessGrant,
} from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { NotFoundError, ConflictError } from '../../core/errors/problem-details';

export interface AccessGrantWithDetails extends AccessGrant {
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  rentalObject?: {
    id: string;
    name: string;
    type: string;
  };
  grantedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateAccessGrantInput {
  tenantId: string;
  orgId: string;
  rentalObjectId: string;
  grantedBy: string;
  validFrom?: Date;
  validUntil?: Date;
  metadata?: Record<string, unknown>;
}

export interface AccessGrantQueryParams {
  tenantId?: string;
  orgId?: string;
  rentalObjectId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class AccessGrantService {
  private db: any;
  private auditService = getAuditService();

  constructor() {
    this.db = container.resolve<any>('Database');
  }

  /**
   * Find all access grants with filtering and pagination
   */
  async findAll(params: AccessGrantQueryParams): Promise<{
    data: AccessGrantWithDetails[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (params.tenantId) conditions.push(eq(accessGrants.tenantId, params.tenantId));
    if (params.orgId) conditions.push(eq(accessGrants.orgId, params.orgId));
    if (params.rentalObjectId) conditions.push(eq(accessGrants.rentalObjectId, params.rentalObjectId));
    if (params.status) conditions.push(eq(accessGrants.status, params.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get paginated results
    const results = await this.db
      .select({
        id: accessGrants.id,
        tenantId: accessGrants.tenantId,
        orgId: accessGrants.orgId,
        rentalObjectId: accessGrants.rentalObjectId,
        grantedBy: accessGrants.grantedBy,
        status: accessGrants.status,
        validFrom: accessGrants.validFrom,
        validUntil: accessGrants.validUntil,
        metadata: accessGrants.metadata,
        createdAt: accessGrants.createdAt,
        updatedAt: accessGrants.updatedAt,
      })
      .from(accessGrants)
      .where(whereClause)
      .orderBy(desc(accessGrants.createdAt))
      .limit(limit)
      .offset(offset);

    // Enrich with related data
    const enrichedResults = await Promise.all(
      results.map(async (grant: AccessGrant) => this.enrichGrant(grant))
    );

    // Get total count
    const countResult = await this.db
      .select({ count: count() })
      .from(accessGrants)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    return {
      data: enrichedResults,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a single access grant by ID
   */
  async findById(id: string): Promise<AccessGrantWithDetails> {
    const result = await this.db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError('Access Grant', id);
    }

    return this.enrichGrant(result[0]);
  }

  /**
   * Create a new access grant (commune admin grants org access to rental object)
   */
  async create(input: CreateAccessGrantInput): Promise<AccessGrantWithDetails> {
    // Validate organization exists and belongs to tenant
    const org = await this.db
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.id, input.orgId),
          eq(organizations.tenantId, input.tenantId)
        )
      )
      .limit(1);

    if (!org.length) {
      throw new NotFoundError('Organization', input.orgId);
    }

    // Validate rental object exists and belongs to tenant
    const rentalObject = await this.db
      .select()
      .from(listings)
      .where(
        and(
          eq(listings.id, input.rentalObjectId),
          eq(listings.tenantId, input.tenantId)
        )
      )
      .limit(1);

    if (!rentalObject.length) {
      throw new NotFoundError('Rental Object', input.rentalObjectId);
    }

    // Check for existing active grant
    const existingGrant = await this.db
      .select()
      .from(accessGrants)
      .where(
        and(
          eq(accessGrants.orgId, input.orgId),
          eq(accessGrants.rentalObjectId, input.rentalObjectId),
          eq(accessGrants.status, 'active')
        )
      )
      .limit(1);

    if (existingGrant.length) {
      throw new ConflictError(
        `Access grant already exists for organization '${org[0].name}' to rental object '${rentalObject[0].name}'`
      );
    }

    // Create the access grant
    const [grant] = await this.db
      .insert(accessGrants)
      .values({
        tenantId: input.tenantId,
        orgId: input.orgId,
        rentalObjectId: input.rentalObjectId,
        grantedBy: input.grantedBy,
        status: 'active',
        validFrom: input.validFrom || null,
        validUntil: input.validUntil || null,
        metadata: input.metadata || {},
      })
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId: input.tenantId,
      userId: input.grantedBy,
      action: 'create',
      resource: 'access_grant',
      resourceId: grant.id,
      severity: 'info',
      metadata: {
        before: null,
        after: grant,
        orgId: input.orgId,
        rentalObjectId: input.rentalObjectId,
      },
    });

    return this.enrichGrant(grant);
  }

  /**
   * Revoke an access grant (set status to 'revoked')
   */
  async revoke(id: string, revokedBy: string): Promise<AccessGrantWithDetails> {
    // Get the existing grant
    const existing = await this.db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundError('Access Grant', id);
    }

    const previousGrant = existing[0];

    if (previousGrant.status === 'revoked') {
      throw new ConflictError('Access grant is already revoked');
    }

    // Update the grant status to revoked
    const [revokedGrant] = await this.db
      .update(accessGrants)
      .set({
        status: 'revoked',
        updatedAt: new Date(),
      })
      .where(eq(accessGrants.id, id))
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId: revokedGrant.tenantId,
      userId: revokedBy,
      action: 'delete',
      resource: 'access_grant',
      resourceId: id,
      severity: 'warning',
      metadata: {
        before: previousGrant,
        after: revokedGrant,
        revokedBy,
      },
    });

    return this.enrichGrant(revokedGrant);
  }

  /**
   * Delete an access grant permanently (hard delete)
   */
  async delete(id: string, deletedBy: string): Promise<void> {
    // Get the existing grant for audit
    const existing = await this.db
      .select()
      .from(accessGrants)
      .where(eq(accessGrants.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundError('Access Grant', id);
    }

    const deletedGrant = existing[0];

    // Delete the grant
    await this.db
      .delete(accessGrants)
      .where(eq(accessGrants.id, id));

    // Audit log
    await this.auditService.log({
      tenantId: deletedGrant.tenantId,
      userId: deletedBy,
      action: 'delete',
      resource: 'access_grant',
      resourceId: id,
      severity: 'warning',
      metadata: {
        before: deletedGrant,
        after: null,
        deletedBy,
        hardDelete: true,
      },
    });
  }

  /**
   * Enrich grant with related organization, rental object, and user details
   */
  private async enrichGrant(grant: AccessGrant): Promise<AccessGrantWithDetails> {
    const [org] = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .where(eq(organizations.id, grant.orgId))
      .limit(1);

    const [rentalObject] = await this.db
      .select({
        id: listings.id,
        name: listings.name,
        type: listings.type,
      })
      .from(listings)
      .where(eq(listings.id, grant.rentalObjectId))
      .limit(1);

    const [grantedByUser] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, grant.grantedBy))
      .limit(1);

    return {
      ...grant,
      organization: org || undefined,
      rentalObject: rentalObject || undefined,
      grantedByUser: grantedByUser || undefined,
    };
  }
}

// Singleton instance
let accessGrantServiceInstance: AccessGrantService | null = null;

export function getAccessGrantService(): AccessGrantService {
  if (!accessGrantServiceInstance) {
    accessGrantServiceInstance = new AccessGrantService();
  }
  return accessGrantServiceInstance;
}

// Reset singleton for testing
export function resetAccessGrantService(): void {
  accessGrantServiceInstance = null;
}
