/**
 * Permission Assignment Service
 * Business logic for org admin to assign per-rental-object permissions to members
 *
 * Permission Model:
 * - RO_VIEW: View rental object details
 * - RO_BOOK: Create bookings on rental object
 * - RO_BOOK_EDIT: Edit bookings on rental object
 * - RO_BOOK_CANCEL: Cancel bookings on rental object
 * - RO_ASSIGN_CASE_HANDLERS: Assign case handlers (org admin only)
 * - RO_ASSIGN_PERMISSIONS: Assign permissions (org admin only)
 * - RO_MANAGE_MEMBERS: Manage organization members (org admin only)
 */
import { container } from '../../core/container';
import { eq, and, count, desc } from 'drizzle-orm';
import {
  permissionAssignments,
  accessGrants,
  organizations,
  listings,
  users,
  orgMemberships,
  type PermissionAssignment,
  type NewPermissionAssignment,
} from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../../core/errors/problem-details';

/**
 * Available permissions for rental object access
 */
export const RENTAL_OBJECT_PERMISSIONS = [
  'RO_VIEW',
  'RO_BOOK',
  'RO_BOOK_EDIT',
  'RO_BOOK_CANCEL',
  'RO_ASSIGN_CASE_HANDLERS',
  'RO_ASSIGN_PERMISSIONS',
  'RO_MANAGE_MEMBERS',
] as const;

export type RentalObjectPermission = typeof RENTAL_OBJECT_PERMISSIONS[number];

export interface PermissionAssignmentWithDetails extends PermissionAssignment {
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  rentalObject?: {
    id: string;
    name: string;
    type: string;
  };
  assignedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreatePermissionAssignmentInput {
  orgId: string;
  userId: string;
  rentalObjectId: string;
  permissions: RentalObjectPermission[];
  assignedBy: string;
  metadata?: Record<string, unknown>;
}

export interface UpdatePermissionAssignmentInput {
  permissions: RentalObjectPermission[];
  updatedBy: string;
  metadata?: Record<string, unknown>;
}

export interface PermissionAssignmentQueryParams {
  orgId?: string;
  userId?: string;
  rentalObjectId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class PermissionAssignmentService {
  private db: any;
  private auditService = getAuditService();

  constructor() {
    this.db = container.resolve<any>('Database');
  }

  /**
   * Find all permission assignments with filtering and pagination
   */
  async findAll(params: PermissionAssignmentQueryParams): Promise<{
    data: PermissionAssignmentWithDetails[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;
    const conditions: any[] = [];

    if (params.orgId) conditions.push(eq(permissionAssignments.orgId, params.orgId));
    if (params.userId) conditions.push(eq(permissionAssignments.userId, params.userId));
    if (params.rentalObjectId) conditions.push(eq(permissionAssignments.rentalObjectId, params.rentalObjectId));
    if (params.status) conditions.push(eq(permissionAssignments.status, params.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get paginated results
    const results = await this.db
      .select({
        id: permissionAssignments.id,
        orgId: permissionAssignments.orgId,
        userId: permissionAssignments.userId,
        rentalObjectId: permissionAssignments.rentalObjectId,
        permissions: permissionAssignments.permissions,
        assignedBy: permissionAssignments.assignedBy,
        status: permissionAssignments.status,
        metadata: permissionAssignments.metadata,
        createdAt: permissionAssignments.createdAt,
        updatedAt: permissionAssignments.updatedAt,
      })
      .from(permissionAssignments)
      .where(whereClause)
      .orderBy(desc(permissionAssignments.createdAt))
      .limit(limit)
      .offset(offset);

    // Enrich with related data
    const enrichedResults = await Promise.all(
      results.map(async (assignment: PermissionAssignment) => this.enrichAssignment(assignment))
    );

    // Get total count
    const countResult = await this.db
      .select({ count: count() })
      .from(permissionAssignments)
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
   * Find a single permission assignment by ID
   */
  async findById(id: string): Promise<PermissionAssignmentWithDetails> {
    const result = await this.db
      .select()
      .from(permissionAssignments)
      .where(eq(permissionAssignments.id, id))
      .limit(1);

    if (!result.length) {
      throw new NotFoundError('Permission Assignment', id);
    }

    return this.enrichAssignment(result[0]);
  }

  /**
   * Find permission assignment by org, user, and rental object
   */
  async findByOrgUserRentalObject(
    orgId: string,
    userId: string,
    rentalObjectId: string
  ): Promise<PermissionAssignmentWithDetails | null> {
    const result = await this.db
      .select()
      .from(permissionAssignments)
      .where(
        and(
          eq(permissionAssignments.orgId, orgId),
          eq(permissionAssignments.userId, userId),
          eq(permissionAssignments.rentalObjectId, rentalObjectId)
        )
      )
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.enrichAssignment(result[0]);
  }

  /**
   * Create a new permission assignment (org admin assigns permissions to member)
   */
  async create(input: CreatePermissionAssignmentInput): Promise<PermissionAssignmentWithDetails> {
    // Validate permissions
    this.validatePermissions(input.permissions);

    // Validate organization exists
    const org = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, input.orgId))
      .limit(1);

    if (!org.length) {
      throw new NotFoundError('Organization', input.orgId);
    }

    // Validate user exists
    const user = await this.db
      .select()
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (!user.length) {
      throw new NotFoundError('User', input.userId);
    }

    // Validate rental object exists
    const rentalObject = await this.db
      .select()
      .from(listings)
      .where(eq(listings.id, input.rentalObjectId))
      .limit(1);

    if (!rentalObject.length) {
      throw new NotFoundError('Rental Object', input.rentalObjectId);
    }

    // Verify access grant exists (org must have access to this rental object)
    const accessGrant = await this.db
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

    if (!accessGrant.length) {
      throw new ForbiddenError(
        'Organization does not have access to this rental object. An access grant must exist first.'
      );
    }

    // Check for existing assignment (upsert logic handled in update)
    const existingAssignment = await this.db
      .select()
      .from(permissionAssignments)
      .where(
        and(
          eq(permissionAssignments.orgId, input.orgId),
          eq(permissionAssignments.userId, input.userId),
          eq(permissionAssignments.rentalObjectId, input.rentalObjectId)
        )
      )
      .limit(1);

    if (existingAssignment.length) {
      throw new ConflictError(
        `Permission assignment already exists for this user and rental object. Use PUT to update.`
      );
    }

    // Create the permission assignment
    const [assignment] = await this.db
      .insert(permissionAssignments)
      .values({
        orgId: input.orgId,
        userId: input.userId,
        rentalObjectId: input.rentalObjectId,
        permissions: input.permissions,
        assignedBy: input.assignedBy,
        status: 'active',
        metadata: input.metadata || {},
      })
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId: org[0].tenantId,
      userId: input.assignedBy,
      action: 'create',
      resource: 'permission_assignment',
      resourceId: assignment.id,
      severity: 'info',
      metadata: {
        before: null,
        after: assignment,
        orgId: input.orgId,
        targetUserId: input.userId,
        rentalObjectId: input.rentalObjectId,
        permissions: input.permissions,
      },
    });

    return this.enrichAssignment(assignment);
  }

  /**
   * Update an existing permission assignment
   */
  async update(id: string, input: UpdatePermissionAssignmentInput): Promise<PermissionAssignmentWithDetails> {
    // Validate permissions
    this.validatePermissions(input.permissions);

    // Get the existing assignment
    const existing = await this.db
      .select()
      .from(permissionAssignments)
      .where(eq(permissionAssignments.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundError('Permission Assignment', id);
    }

    const previousAssignment = existing[0];

    // Get org for tenant ID
    const org = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, previousAssignment.orgId))
      .limit(1);

    // Update the assignment
    const [updatedAssignment] = await this.db
      .update(permissionAssignments)
      .set({
        permissions: input.permissions,
        assignedBy: input.updatedBy,
        metadata: input.metadata || previousAssignment.metadata,
        updatedAt: new Date(),
      })
      .where(eq(permissionAssignments.id, id))
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId: org[0]?.tenantId,
      userId: input.updatedBy,
      action: 'update',
      resource: 'permission_assignment',
      resourceId: id,
      severity: 'info',
      metadata: {
        before: previousAssignment,
        after: updatedAssignment,
        permissionsChanged: {
          removed: (previousAssignment.permissions as string[]).filter(
            (p) => !input.permissions.includes(p as RentalObjectPermission)
          ),
          added: input.permissions.filter(
            (p) => !(previousAssignment.permissions as string[]).includes(p)
          ),
        },
      },
    });

    return this.enrichAssignment(updatedAssignment);
  }

  /**
   * Update or create (upsert) permission assignment by org, user, and rental object
   */
  async upsert(input: CreatePermissionAssignmentInput): Promise<PermissionAssignmentWithDetails> {
    const existing = await this.findByOrgUserRentalObject(
      input.orgId,
      input.userId,
      input.rentalObjectId
    );

    if (existing) {
      return this.update(existing.id, {
        permissions: input.permissions,
        updatedBy: input.assignedBy,
        metadata: input.metadata,
      });
    }

    return this.create(input);
  }

  /**
   * Revoke a permission assignment (set status to 'revoked')
   */
  async revoke(id: string, revokedBy: string): Promise<PermissionAssignmentWithDetails> {
    // Get the existing assignment
    const existing = await this.db
      .select()
      .from(permissionAssignments)
      .where(eq(permissionAssignments.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundError('Permission Assignment', id);
    }

    const previousAssignment = existing[0];

    if (previousAssignment.status === 'revoked') {
      throw new ConflictError('Permission assignment is already revoked');
    }

    // Get org for tenant ID
    const org = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, previousAssignment.orgId))
      .limit(1);

    // Update the assignment status to revoked
    const [revokedAssignment] = await this.db
      .update(permissionAssignments)
      .set({
        status: 'revoked',
        updatedAt: new Date(),
      })
      .where(eq(permissionAssignments.id, id))
      .returning();

    // Audit log
    await this.auditService.log({
      tenantId: org[0]?.tenantId,
      userId: revokedBy,
      action: 'delete',
      resource: 'permission_assignment',
      resourceId: id,
      severity: 'warning',
      metadata: {
        before: previousAssignment,
        after: revokedAssignment,
        revokedBy,
      },
    });

    return this.enrichAssignment(revokedAssignment);
  }

  /**
   * Delete a permission assignment permanently (hard delete)
   */
  async delete(id: string, deletedBy: string): Promise<void> {
    // Get the existing assignment for audit
    const existing = await this.db
      .select()
      .from(permissionAssignments)
      .where(eq(permissionAssignments.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundError('Permission Assignment', id);
    }

    const deletedAssignment = existing[0];

    // Get org for tenant ID
    const org = await this.db
      .select()
      .from(organizations)
      .where(eq(organizations.id, deletedAssignment.orgId))
      .limit(1);

    // Delete the assignment
    await this.db
      .delete(permissionAssignments)
      .where(eq(permissionAssignments.id, id));

    // Audit log
    await this.auditService.log({
      tenantId: org[0]?.tenantId,
      userId: deletedBy,
      action: 'delete',
      resource: 'permission_assignment',
      resourceId: id,
      severity: 'warning',
      metadata: {
        before: deletedAssignment,
        after: null,
        deletedBy,
        hardDelete: true,
      },
    });
  }

  /**
   * Get user's permissions for a specific rental object
   */
  async getUserPermissionsForRentalObject(
    userId: string,
    rentalObjectId: string
  ): Promise<RentalObjectPermission[]> {
    const assignments = await this.db
      .select({ permissions: permissionAssignments.permissions })
      .from(permissionAssignments)
      .where(
        and(
          eq(permissionAssignments.userId, userId),
          eq(permissionAssignments.rentalObjectId, rentalObjectId),
          eq(permissionAssignments.status, 'active')
        )
      );

    // Aggregate permissions from all assignments
    const allPermissions = new Set<RentalObjectPermission>();
    for (const assignment of assignments) {
      const perms = assignment.permissions as RentalObjectPermission[];
      perms.forEach((p) => allPermissions.add(p));
    }

    return Array.from(allPermissions);
  }

  /**
   * Check if user has a specific permission on a rental object
   */
  async hasPermission(
    userId: string,
    rentalObjectId: string,
    permission: RentalObjectPermission
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionsForRentalObject(userId, rentalObjectId);
    return permissions.includes(permission);
  }

  /**
   * Validate that all permissions are valid
   */
  private validatePermissions(permissions: RentalObjectPermission[]): void {
    if (!permissions || !Array.isArray(permissions)) {
      throw new BadRequestError('permissions must be an array');
    }

    if (permissions.length === 0) {
      throw new BadRequestError('At least one permission is required');
    }

    for (const permission of permissions) {
      if (!RENTAL_OBJECT_PERMISSIONS.includes(permission)) {
        throw new BadRequestError(
          `Invalid permission '${permission}'. Valid permissions are: ${RENTAL_OBJECT_PERMISSIONS.join(', ')}`
        );
      }
    }
  }

  /**
   * Enrich assignment with related organization, user, rental object, and assignedBy details
   */
  private async enrichAssignment(assignment: PermissionAssignment): Promise<PermissionAssignmentWithDetails> {
    const [org] = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      })
      .from(organizations)
      .where(eq(organizations.id, assignment.orgId))
      .limit(1);

    const [user] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, assignment.userId))
      .limit(1);

    const [rentalObject] = await this.db
      .select({
        id: listings.id,
        name: listings.name,
        type: listings.type,
      })
      .from(listings)
      .where(eq(listings.id, assignment.rentalObjectId))
      .limit(1);

    let assignedByUser = undefined;
    if (assignment.assignedBy) {
      const [assignedBy] = await this.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, assignment.assignedBy))
        .limit(1);
      assignedByUser = assignedBy;
    }

    return {
      ...assignment,
      organization: org || undefined,
      user: user || undefined,
      rentalObject: rentalObject || undefined,
      assignedByUser: assignedByUser || undefined,
    };
  }
}

// Singleton instance
let permissionAssignmentServiceInstance: PermissionAssignmentService | null = null;

export function getPermissionAssignmentService(): PermissionAssignmentService {
  if (!permissionAssignmentServiceInstance) {
    permissionAssignmentServiceInstance = new PermissionAssignmentService();
  }
  return permissionAssignmentServiceInstance;
}

// Reset singleton for testing
export function resetPermissionAssignmentService(): void {
  permissionAssignmentServiceInstance = null;
}
