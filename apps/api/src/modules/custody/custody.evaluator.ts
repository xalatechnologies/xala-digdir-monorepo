/**
 * Rental Object Custody Evaluation Engine
 * 
 * Implements "effective permission" evaluation for resource-scoped delegation.
 */
import { Injectable, Inject } from '../../core/decorators';
import { CustodyScope, UserContext } from './types';
import { Roles } from '../auth/rbac';

@Injectable()
export class CustodyEvaluator {
  constructor(
    @Inject('Database') private readonly db: any
  ) {}

  /**
   * Evaluate if a user has a specific scope on a rental object
   */
  async can(
    user: UserContext,
    scope: CustodyScope,
    rentalObjectId: string
  ): Promise<boolean> {
    // 1) System roles: Super Admin and Tenant Admin have full access
    if (
      user.role === Roles.SAAS_SUPER_ADMIN || 
      user.role === Roles.TENANT_ADMIN || 
      user.role === 'admin' // COMMUNE_ADMIN
    ) {
      return true;
    }

    // 2) Tenant isolation check
    // This should be handled by the query itself, but we should be explicit
    
    // 3) Get all active organization memberships for the user
    const memberships = await this.db.query.orgMemberships.findMany({
      where: (m: any, { eq, and }: any) => and(
        eq(m.userId, user.userId),
        eq(m.tenantId, user.tenantId)
      ),
    });
    const orgIds = memberships.map((m: any) => m.organizationId);

    // 4) Check for direct USER grants
    const directGrants = await this.db.query.rentalObjectCustodyGrants.findMany({
      where: (g: any, { eq, and, sql }: any) => and(
        eq(g.tenantId, user.tenantId),
        eq(g.rentalObjectId, rentalObjectId),
        eq(g.granteeType, 'USER'),
        eq(g.granteeId, user.userId),
        eq(g.status, 'ACTIVE'),
        // Time window check
        sql`(${g.effectiveFrom} IS NULL OR ${g.effectiveFrom} <= NOW())`,
        sql`(${g.effectiveTo} IS NULL OR ${g.effectiveTo} >= NOW())`
      ),
    });

    if (directGrants.some((g: any) => g.scopes.includes(scope))) {
      return true;
    }

    // 5) Check for Organization grants (if user is a member)
    if (orgIds.length > 0) {
      const orgGrants = await this.db.query.rentalObjectCustodyGrants.findMany({
        where: (g: any, { eq, and, inArray, sql }: any) => and(
          eq(g.tenantId, user.tenantId),
          eq(g.rentalObjectId, rentalObjectId),
          eq(g.granteeType, 'ORG'),
          inArray(g.granteeId, orgIds),
          eq(g.status, 'ACTIVE'),
          sql`(${g.effectiveFrom} IS NULL OR ${g.effectiveFrom} <= NOW())`,
          sql`(${g.effectiveTo} IS NULL OR ${g.effectiveTo} >= NOW())`
        ),
      });

      if (orgGrants.some((g: any) => g.scopes.includes(scope))) {
        return true;
      }

      // 6) Check for Subgrants (if user has a subgrant under an ORG grant)
      const subgrants = await this.db.query.rentalObjectCustodySubgrants.findMany({
        where: (s: any, { eq, and, sql }: any) => and(
          eq(s.tenantId, user.tenantId),
          eq(s.memberUserId, user.userId),
          eq(s.status, 'ACTIVE'),
          sql`(${s.effectiveFrom} IS NULL OR ${s.effectiveFrom} <= NOW())`,
          sql`(${s.effectiveTo} IS NULL OR ${s.effectiveTo} >= NOW())`
        ),
        with: {
          parentGrant: true
        }
      });

      for (const sub of subgrants) {
        // Ensure the parent grant is for the correct rental object and is still active
        if (
          sub.parentGrant.rentalObjectId === rentalObjectId &&
          sub.parentGrant.status === 'ACTIVE' &&
          sub.scopes.includes(scope)
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get all effective scopes for a user on a rental object
   */
  async getEffectiveScopes(
    user: UserContext,
    rentalObjectId: string
  ): Promise<Set<CustodyScope>> {
    const scopes = new Set<CustodyScope>();

    // If system admin, return all scopes
    if (
      user.role === Roles.SAAS_SUPER_ADMIN || 
      user.role === Roles.TENANT_ADMIN || 
      user.role === 'admin'
    ) {
      Object.values(CustodyScope).forEach(s => scopes.add(s));
      return scopes;
    }

    // Direct grants
    const directGrants = await this.db.query.rentalObjectCustodyGrants.findMany({
      where: (g: any, { eq, and, sql }: any) => and(
        eq(g.tenantId, user.tenantId),
        eq(g.rentalObjectId, rentalObjectId),
        eq(g.granteeType, 'USER'),
        eq(g.granteeId, user.userId),
        eq(g.status, 'ACTIVE'),
        sql`(${g.effectiveFrom} IS NULL OR ${g.effectiveFrom} <= NOW())`,
        sql`(${g.effectiveTo} IS NULL OR ${g.effectiveTo} >= NOW())`
      ),
    });
    directGrants.forEach((g: any) => g.scopes.forEach((s: any) => scopes.add(s as CustodyScope)));

    // Org memberships
    const memberships = await this.db.query.orgMemberships.findMany({
      where: (m: any, { eq, and }: any) => and(
        eq(m.userId, user.userId),
        eq(m.tenantId, user.tenantId)
      ),
    });
    const orgIds = memberships.map((m: any) => m.organizationId);

    if (orgIds.length > 0) {
      // Org grants
      const orgGrants = await this.db.query.rentalObjectCustodyGrants.findMany({
        where: (g: any, { eq, and, inArray, sql }: any) => and(
          eq(g.tenantId, user.tenantId),
          eq(g.rentalObjectId, rentalObjectId),
          eq(g.granteeType, 'ORG'),
          inArray(g.granteeId, orgIds),
          eq(g.status, 'ACTIVE'),
          sql`(${g.effectiveFrom} IS NULL OR ${g.effectiveFrom} <= NOW())`,
          sql`(${g.effectiveTo} IS NULL OR ${g.effectiveTo} >= NOW())`
        ),
      });
      orgGrants.forEach((g: any) => g.scopes.forEach((s: any) => scopes.add(s as CustodyScope)));

      // Subgrants
      const subgrants = await this.db.query.rentalObjectCustodySubgrants.findMany({
        where: (s: any, { eq, and, sql }: any) => and(
          eq(s.tenantId, user.tenantId),
          eq(s.memberUserId, user.userId),
          eq(s.status, 'ACTIVE'),
          sql`(${s.effectiveFrom} IS NULL OR ${s.effectiveFrom} <= NOW())`,
          sql`(${s.effectiveTo} IS NULL OR ${s.effectiveTo} >= NOW())`
        ),
        with: {
          parentGrant: true
        }
      });
      subgrants.forEach((s: any) => {
        if (s.parentGrant.rentalObjectId === rentalObjectId && s.parentGrant.status === 'ACTIVE') {
          s.scopes.forEach((scope: any) => scopes.add(scope as CustodyScope));
        }
      });
    }

    return scopes;
  }
}
