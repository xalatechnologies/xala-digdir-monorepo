/**
 * Backoffice Organizations Service
 * Business logic for municipal/partner organization management
 * 
 * Reference: docs/roles/prd.md - Section 3.1
 */
import { Injectable, Inject } from '../../core/decorators';
import { eq, and } from 'drizzle-orm';
import { organizations, orgMemberships, accessGrants } from '../../database/schema/index';
import { NotFoundError, BadRequestError } from '../../core/errors/problem-details';

interface CreateOrganizationRequest {
  name: string;
  type: 'MUNICIPAL_UNIT' | 'PARTNER_ORG' | 'UMBRELLA_ORG';
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
}

interface AddMemberRequest {
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  capabilities?: string[];
}

interface AssignRentalObjectRequest {
  rentalObjectId: string;
  assignmentType?: 'OWNED' | 'MANAGED' | 'DELEGATED';
  canEdit?: boolean;
  canApproveBookings?: boolean;
  canManageAvailability?: boolean;
  canManagePricing?: boolean;
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject('Database') private readonly db: any,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * List organizations with scope filtering based on user role
   * KOMMUNE_ADMIN/admin sees all, ORG_ADMIN sees only own org
   */
  async list(params: any, requestContext?: { userId?: string; role?: string; organizationId?: string }): Promise<any[]> {
    const whereConditions: any[] = [];
    
    if (params.status) {
      whereConditions.push(eq(organizations.status, params.status));
    }
    
    // Apply scope filtering based on role
    if (requestContext?.role && requestContext.role !== 'admin' && requestContext.role !== 'KOMMUNE_ADMIN') {
      // ORG_ADMIN and below: can only see their own organization
      if (requestContext.organizationId) {
        whereConditions.push(eq(organizations.id, requestContext.organizationId));
      } else {
        // No organization assigned - return empty list
        return [];
      }
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const result = await this.db.query.organizations.findMany({
      where: whereClause,
      orderBy: (orgs: any, { asc }: any) => [asc(orgs.name)],
    });

    return result.map((org: any) => this.mapToDTO(org));
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<any> {
    const organization = await this.db.query.organizations.findFirst({
      where: (orgs: any, { eq }: any) => eq(orgs.id, id),
    });

    if (!organization) {
      throw new NotFoundError(`Organization ${id} not found`);
    }

    return this.mapToDTO(organization);
  }

  /**
   * Create organization
   */
  async create(request: CreateOrganizationRequest, requestContext: { tenantId: string; userId: string }): Promise<any> {
    // Validation
    if (!request.name || request.name.trim().length === 0) {
      throw new BadRequestError('Organization name is required');
    }

    if (!request.type) {
      throw new BadRequestError('Organization type is required');
    }

    const { tenantId } = requestContext;
    // Note: userId would be used for audit/created_by if schema supports it

    // Create organization
    const [organization] = await this.db
      .insert(organizations)
      .values({
        tenantId,
        name: request.name,
        slug: request.name.toLowerCase().replace(/\s+/g, '-'),
        type: request.type,
        status: 'active',
        settings: {
          description: request.description,
          email: request.email,
          phone: request.phone,
          address: request.address,
        },
      })
      .returning();

    this.adapters?.log?.info('Organization created', { organizationId: organization.id });

    return this.mapToDTO(organization);
  }

  /**
   * Update organization
   */
  async update(id: string, request: UpdateOrganizationRequest, _requestContext: { userId: string }): Promise<any> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new NotFoundError(`Organization ${id} not found`);
    }

    // Note: userId from _requestContext would be used for audit/updated_by if schema supports it

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (request.name !== undefined) updateData.name = request.name;
    if (request.status !== undefined) updateData.status = request.status;
    
    // Update settings object for other fields
    if (request.description || request.email || request.phone || request.address) {
      const currentSettings = existing.settings || {};
      updateData.settings = {
        ...currentSettings,
        ...(request.description && { description: request.description }),
        ...(request.email && { email: request.email }),
        ...(request.phone && { phone: request.phone }),
        ...(request.address && { address: request.address }),
      };
    }

    const [updated] = await this.db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();

    this.adapters?.log?.info('Organization updated', { organizationId: id });

    return this.mapToDTO(updated);
  }

  /**
   * Delete/archive organization
   */
  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new NotFoundError(`Organization ${id} not found`);
    }

    // Soft delete by archiving
    await this.db
      .update(organizations)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(organizations.id, id));

    this.adapters?.log?.info('Organization archived', { organizationId: id });
  }

  /**
   * List organization members
   */
  async listMembers(organizationId: string): Promise<any[]> {
    const members = await this.db.query.orgMemberships.findMany({
      where: (members: any, { eq }: any) => eq(members.orgId, organizationId),
      with: {
        user: true,
      },
    });

    return members.map((member: any) => ({
      id: member.id,
      userId: member.userId,
      userName: member.user?.name || 'Unknown',
      userEmail: member.user?.email || '',
      role: member.orgRole,
      status: member.status,
      joinedAt: member.createdAt?.toISOString(),
    }));
  }

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, request: AddMemberRequest, _requestContext: { userId: string }): Promise<any> {
    if (!request.userId) {
      throw new BadRequestError('userId is required');
    }

    if (!request.role) {
      throw new BadRequestError('role is required');
    }

    // Check if already a member
    const existing = await this.db.query.orgMemberships.findFirst({
      where: (members: any, { eq, and }: any) =>
        and(
          eq(members.orgId, organizationId),
          eq(members.userId, request.userId)
        ),
    });

    if (existing) {
      throw new BadRequestError('User is already a member of this organization');
    }

    // Note: userId from _requestContext would be used for invited_by if schema supports it

    const [member] = await this.db
      .insert(orgMemberships)
      .values({
        userId: request.userId,
        orgId: organizationId,
        orgRole: request.role,
        status: 'active',
        metadata: request.capabilities ? { capabilities: request.capabilities } : {},
      })
      .returning();

    this.adapters?.log?.info('Member added to organization', {
      organizationId,
      userId: request.userId,
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.orgRole,
      status: member.status,
      joinedAt: member.createdAt?.toISOString(),
    };
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<void> {
    await this.db
      .update(orgMemberships)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(
        and(
          eq(orgMemberships.orgId, organizationId),
          eq(orgMemberships.userId, userId)
        )
      );

    this.adapters?.log?.info('Member removed from organization', { organizationId, userId });
  }

  /**
   * List assigned rental objects
   */
  async listAssignedRentalObjects(organizationId: string): Promise<any[]> {
    const assignments = await this.db.query.accessGrants.findMany({
      where: (grants: any, { eq }: any) => eq(grants.orgId, organizationId),
      with: {
        rentalObject: true,
      },
    });

    return assignments.map((grant: any) => ({
      id: grant.id,
      rentalObjectId: grant.rentalObjectId,
      rentalObjectName: grant.rentalObject?.name || 'Unknown',
      status: grant.status,
      validFrom: grant.validFrom?.toISOString(),
      validUntil: grant.validUntil?.toISOString(),
      assignedAt: grant.createdAt?.toISOString(),
    }));
  }

  /**
   * Assign rental object to organization
   */
  async assignRentalObject(organizationId: string, request: AssignRentalObjectRequest, requestContext: { userId: string }): Promise<any> {
    if (!request.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required');
    }

    // Check if already assigned
    const existing = await this.db.query.accessGrants.findFirst({
      where: (grants: any, { eq, and }: any) =>
        and(
          eq(grants.orgId, organizationId),
          eq(grants.rentalObjectId, request.rentalObjectId)
        ),
    });

    if (existing) {
      throw new BadRequestError('Rental object is already assigned to this organization');
    }

    const { userId: grantedBy } = requestContext;

    // Get tenant ID from organization
    const org = await this.getById(organizationId);

    const [grant] = await this.db
      .insert(accessGrants)
      .values({
        tenantId: org.tenantId,
        orgId: organizationId,
        rentalObjectId: request.rentalObjectId,
        grantedBy,
        status: 'active',
        metadata: {
          assignmentType: request.assignmentType || 'MANAGED',
          canEdit: request.canEdit ?? true,
          canApproveBookings: request.canApproveBookings ?? true,
          canManageAvailability: request.canManageAvailability ?? true,
          canManagePricing: request.canManagePricing ?? false,
        },
      })
      .returning();

    this.adapters?.log?.info('Rental object assigned to organization', {
      organizationId,
      rentalObjectId: request.rentalObjectId,
    });

    return {
      id: grant.id,
      rentalObjectId: grant.rentalObjectId,
      status: grant.status,
      assignedAt: grant.createdAt?.toISOString(),
    };
  }

  /**
   * Unassign rental object from organization
   */
  async unassignRentalObject(organizationId: string, rentalObjectId: string): Promise<void> {
    await this.db
      .update(accessGrants)
      .set({ status: 'revoked', updatedAt: new Date() })
      .where(
        and(
          eq(accessGrants.orgId, organizationId),
          eq(accessGrants.rentalObjectId, rentalObjectId)
        )
      );

    this.adapters?.log?.info('Rental object unassigned from organization', {
      organizationId,
      rentalObjectId,
    });
  }

  /**
   * Map database entity to DTO
   */
  private mapToDTO(org: any): any {
    const settings = org.settings || {};
    return {
      id: org.id,
      tenantId: org.tenantId,
      name: org.name,
      type: org.type,
      description: settings.description,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      status: org.status,
      createdAt: org.createdAt?.toISOString(),
      updatedAt: org.updatedAt?.toISOString(),
    };
  }
}
