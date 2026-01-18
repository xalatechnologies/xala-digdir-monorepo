/**
 * Rental Object Custody Service
 * Handles management of resource-scoped delegation grants and subgrants.
 */
import { Injectable, Inject } from '../../core/decorators';
import { eq, and } from 'drizzle-orm';
import { 
  rentalObjectCustodyGrants, 
  rentalObjectCustodySubgrants
} from '../../database/schema/index';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../core/errors/problem-details';
import type { CustodyScope, GranteeType } from '@xala/contracts';

@Injectable()
export class CustodyService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * List all grants for a specific rental object
   */
  async listGrants(rentalObjectId: string, tenantId: string) {
    const grants = await this.db.query.rentalObjectCustodyGrants.findMany({
      where: (g: any, { eq, and }: any) => and(
        eq(g.rentalObjectId, rentalObjectId),
        eq(g.tenantId, tenantId)
      ),
      with: {
        subgrants: true
      },
      orderBy: (g: any, { desc }: any) => [desc(g.createdAt)]
    });

    return grants;
  }

  /**
   * Create a new custody grant
   */
  async createGrant(data: {
    tenantId: string;
    rentalObjectId: string;
    granteeType: GranteeType;
    granteeId: string;
    scopes: CustodyScope[];
    canSubdelegate?: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    reason?: string;
    createdByUserId: string;
  }) {
    // 1) Verify rental object exists and belongs to tenant
    const ro = await this.db.query.rentalObjects.findFirst({
      where: (r: any, { eq, and }: any) => and(
        eq(r.id, data.rentalObjectId),
        eq(r.tenantId, data.tenantId)
      )
    });

    if (!ro) {
      throw new NotFoundError(`Rental object ${data.rentalObjectId} not found`);
    }

    // 2) Verify grantee exists (User or Org)
    if (data.granteeType === 'ORG') {
      const org = await this.db.query.organizations.findFirst({
        where: (o: any, { eq, and }: any) => and(
          eq(o.id, data.granteeId),
          eq(o.tenantId, data.tenantId)
        )
      });
      if (!org) throw new BadRequestError(`Organization ${data.granteeId} not found`);
    } else {
      const user = await this.db.query.users.findFirst({
        where: (u: any, { eq }: any) => eq(u.id, data.granteeId)
      });
      if (!user) throw new BadRequestError(`User ${data.granteeId} not found`);
    }

    // 3) Create grant
    const [grant] = await this.db
      .insert(rentalObjectCustodyGrants)
      .values({
        tenantId: data.tenantId,
        rentalObjectId: data.rentalObjectId,
        granteeType: data.granteeType,
        granteeId: data.granteeId,
        scopes: data.scopes,
        canSubdelegate: data.canSubdelegate ?? false,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        reason: data.reason,
        createdByUserId: data.createdByUserId,
        status: 'ACTIVE'
      })
      .returning();

    this.adapters?.log?.info('Custody grant created', { grantId: grant.id, rentalObjectId: data.rentalObjectId });

    return grant;
  }

  /**
   * Revoke a custody grant
   */
  async revokeGrant(grantId: string, tenantId: string, revokedByUserId: string) {
    const [updated] = await this.db
      .update(rentalObjectCustodyGrants)
      .set({
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedByUserId: revokedByUserId,
        updatedAt: new Date()
      })
      .where(and(
        eq(rentalObjectCustodyGrants.id, grantId),
        eq(rentalObjectCustodyGrants.tenantId, tenantId)
      ))
      .returning();

    if (!updated) {
      throw new NotFoundError(`Grant ${grantId} not found`);
    }

    // Also revoke all subgrants
    await this.db
      .update(rentalObjectCustodySubgrants)
      .set({
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedByUserId: revokedByUserId,
        updatedAt: new Date()
      })
      .where(eq(rentalObjectCustodySubgrants.parentGrantId, grantId));

    this.adapters?.log?.info('Custody grant revoked', { grantId, revokedByUserId });

    return updated;
  }

  /**
   * Create a subgrant (Org member assignment)
   */
  async createSubgrant(data: {
    tenantId: string;
    parentGrantId: string;
    memberUserId: string;
    scopes: CustodyScope[];
    effectiveFrom?: Date;
    effectiveTo?: Date;
    createdByUserId: string;
  }) {
    // 1) Get parent grant
    const parent = await this.db.query.rentalObjectCustodyGrants.findFirst({
      where: (g: any, { eq, and }: any) => and(
        eq(g.id, data.parentGrantId),
        eq(g.tenantId, data.tenantId),
        eq(g.status, 'ACTIVE')
      )
    });

    if (!parent) {
      throw new NotFoundError(`Parent grant ${data.parentGrantId} not found or inactive`);
    }

    // 2) Verify subdelegation is allowed
    if (parent.granteeType !== 'ORG' || !parent.canSubdelegate) {
      throw new ForbiddenError('Subdelegation not allowed for this grant');
    }

    // 3) Verify scopes are a subset of parent scopes
    const parentScopes = new Set(parent.scopes);
    for (const scope of data.scopes) {
      if (!parentScopes.has(scope)) {
        throw new BadRequestError(`Scope ${scope} exceeds parent permissions`);
      }
    }

    // 4) Verify member is actually in the organization
    const membership = await this.db.query.orgMemberships.findFirst({
      where: (m: any, { eq, and }: any) => and(
        eq(m.organizationId, parent.granteeId),
        eq(m.userId, data.memberUserId),
        eq(m.tenantId, data.tenantId)
      )
    });

    if (!membership) {
      throw new BadRequestError(`User ${data.memberUserId} is not a member of organization ${parent.granteeId}`);
    }

    // 5) Create subgrant
    const [subgrant] = await this.db
      .insert(rentalObjectCustodySubgrants)
      .values({
        tenantId: data.tenantId,
        parentGrantId: data.parentGrantId,
        orgId: parent.granteeId,
        memberUserId: data.memberUserId,
        scopes: data.scopes,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        createdByUserId: data.createdByUserId,
        status: 'ACTIVE'
      })
      .returning();

    this.adapters?.log?.info('Custody subgrant created', { subgrantId: subgrant.id, parentGrantId: data.parentGrantId });

    return subgrant;
  }

  /**
   * List all objects an organization has custody for
   */
  async listOrgCustody(orgId: string, tenantId: string) {
    const grants = await this.db.query.rentalObjectCustodyGrants.findMany({
      where: (g: any, { eq, and }: any) => and(
        eq(g.granteeType, 'ORG'),
        eq(g.granteeId, orgId),
        eq(g.tenantId, tenantId),
        eq(g.status, 'ACTIVE')
      ),
      with: {
        rentalObject: true
      }
    });

    return grants;
  }

  /**
   * Bulk assign custody to multiple objects
   */
  async bulkAssign(data: {
    tenantId: string;
    rentalObjectIds: string[];
    granteeType: GranteeType;
    granteeId: string;
    scopes: CustodyScope[];
    createdByUserId: string;
  }) {
    const results = [];
    for (const roId of data.rentalObjectIds) {
      try {
        const grant = await this.createGrant({
          ...data,
          rentalObjectId: roId
        });
        results.push({ rentalObjectId: roId, success: true, grantId: grant.id });
      } catch (err: any) {
        results.push({ rentalObjectId: roId, success: false, error: err.message });
      }
    }
    return results;
  }
}
