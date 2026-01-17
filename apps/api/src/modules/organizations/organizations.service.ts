/**
 * Backoffice Organizations Service
 * Business logic for municipal/partner organization management
 * 
 * Reference: docs/roles/prd.md - Section 3.1
 */
import { Injectable, Inject } from '../../core/decorators';
import { eq, and } from 'drizzle-orm';
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
   * List organizations
   */
  async list(params: any): Promise<any[]> {
    // TODO: Apply scope filtering based on user role
    // KOMMUNE_ADMIN sees all, ORG_ADMIN sees only own org
    
    const organizations = await this.db.query.backofficeOrganizations.findMany({
      where: (orgs: any, { eq }: any) => 
        params.status ? eq(orgs.status, params.status) : undefined,
      orderBy: (orgs: any, { asc }: any) => [asc(orgs.name)],
    });

    return organizations.map((org: any) => this.mapToDTO(org));
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<any> {
    const organization = await this.db.query.backofficeOrganizations.findFirst({
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
  async create(request: CreateOrganizationRequest): Promise<any> {
    // Validation
    if (!request.name || request.name.trim().length === 0) {
      throw new BadRequestError('Organization name is required');
    }

    if (!request.type) {
      throw new BadRequestError('Organization type is required');
    }

    // TODO: Get tenantId and userId from context
    const tenantId = 'placeholder-tenant-id';
    const userId = 'placeholder-user-id';

    // Create organization
    const [organization] = await this.db
      .insert('backofficeOrganizations')
      .values({
        tenantId,
        name: request.name,
        type: request.type,
        description: request.description,
        email: request.email,
        phone: request.phone,
        address: request.address,
        status: 'ACTIVE',
        createdBy: userId,
      })
      .returning();

    this.adapters?.log?.info('Organization created', { organizationId: organization.id });

    return this.mapToDTO(organization);
  }

  /**
   * Update organization
   */
  async update(id: string, request: UpdateOrganizationRequest): Promise<any> {
    const existing = await this.getById(id);

    if (!existing) {
      throw new NotFoundError(`Organization ${id} not found`);
    }

    // TODO: Get userId from context
    const userId = 'placeholder-user-id';

    const [updated] = await this.db
      .update('backofficeOrganizations')
      .set({
        ...request,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq('id', id))
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
      .update('backofficeOrganizations')
      .set({ status: 'ARCHIVED', updatedAt: new Date() })
      .where(eq('id', id));

    this.adapters?.log?.info('Organization archived', { organizationId: id });
  }

  /**
   * List organization members
   */
  async listMembers(organizationId: string): Promise<any[]> {
    const members = await this.db.query.organizationMembers.findMany({
      where: (members: any, { eq }: any) => eq(members.organizationId, organizationId),
      with: {
        user: true,
      },
    });

    return members.map((member: any) => ({
      id: member.id,
      userId: member.userId,
      userName: member.user?.name || 'Unknown',
      userEmail: member.user?.email || '',
      role: member.role,
      capabilities: member.capabilities,
      status: member.status,
      joinedAt: member.joinedAt?.toISOString(),
    }));
  }

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, request: AddMemberRequest): Promise<any> {
    if (!request.userId) {
      throw new BadRequestError('userId is required');
    }

    if (!request.role) {
      throw new BadRequestError('role is required');
    }

    // Check if already a member
    const existing = await this.db.query.organizationMembers.findFirst({
      where: (members: any, { eq, and }: any) =>
        and(
          eq(members.organizationId, organizationId),
          eq(members.userId, request.userId)
        ),
    });

    if (existing) {
      throw new BadRequestError('User is already a member of this organization');
    }

    // TODO: Get invitedBy from context
    const invitedBy = 'placeholder-user-id';

    const [member] = await this.db
      .insert('organizationMembers')
      .values({
        organizationId,
        userId: request.userId,
        role: request.role,
        capabilities: request.capabilities || [],
        status: 'ACTIVE',
        invitedBy,
      })
      .returning();

    this.adapters?.log?.info('Member added to organization', {
      organizationId,
      userId: request.userId,
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      capabilities: member.capabilities,
      status: member.status,
      joinedAt: member.joinedAt?.toISOString(),
    };
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, userId: string): Promise<void> {
    await this.db
      .update('organizationMembers')
      .set({ status: 'SUSPENDED', leftAt: new Date() })
      .where(
        and(
          eq('organizationId', organizationId),
          eq('userId', userId)
        )
      );

    this.adapters?.log?.info('Member removed from organization', { organizationId, userId });
  }

  /**
   * List assigned rental objects
   */
  async listAssignedRentalObjects(organizationId: string): Promise<any[]> {
    const assignments = await this.db.query.rentalObjectAssignments.findMany({
      where: (assignments: any, { eq }: any) => eq(assignments.organizationId, organizationId),
      with: {
        rentalObject: true,
      },
    });

    return assignments.map((assignment: any) => ({
      id: assignment.id,
      rentalObjectId: assignment.rentalObjectId,
      rentalObjectName: assignment.rentalObject?.name || 'Unknown',
      assignmentType: assignment.assignmentType,
      canEdit: assignment.canEdit,
      canApproveBookings: assignment.canApproveBookings,
      canManageAvailability: assignment.canManageAvailability,
      canManagePricing: assignment.canManagePricing,
      assignedAt: assignment.assignedAt?.toISOString(),
    }));
  }

  /**
   * Assign rental object to organization
   */
  async assignRentalObject(organizationId: string, request: AssignRentalObjectRequest): Promise<any> {
    if (!request.rentalObjectId) {
      throw new BadRequestError('rentalObjectId is required');
    }

    // Check if already assigned
    const existing = await this.db.query.rentalObjectAssignments.findFirst({
      where: (assignments: any, { eq, and }: any) =>
        and(
          eq(assignments.organizationId, organizationId),
          eq(assignments.rentalObjectId, request.rentalObjectId)
        ),
    });

    if (existing) {
      throw new BadRequestError('Rental object is already assigned to this organization');
    }

    // TODO: Get assignedBy from context
    const assignedBy = 'placeholder-user-id';

    const [assignment] = await this.db
      .insert('rentalObjectAssignments')
      .values({
        rentalObjectId: request.rentalObjectId,
        organizationId,
        assignmentType: request.assignmentType || 'MANAGED',
        canEdit: request.canEdit ?? true,
        canApproveBookings: request.canApproveBookings ?? true,
        canManageAvailability: request.canManageAvailability ?? true,
        canManagePricing: request.canManagePricing ?? false,
        status: 'ACTIVE',
        assignedBy,
      })
      .returning();

    this.adapters?.log?.info('Rental object assigned to organization', {
      organizationId,
      rentalObjectId: request.rentalObjectId,
    });

    return {
      id: assignment.id,
      rentalObjectId: assignment.rentalObjectId,
      assignmentType: assignment.assignmentType,
      canEdit: assignment.canEdit,
      canApproveBookings: assignment.canApproveBookings,
      assignedAt: assignment.assignedAt?.toISOString(),
    };
  }

  /**
   * Unassign rental object from organization
   */
  async unassignRentalObject(organizationId: string, rentalObjectId: string): Promise<void> {
    await this.db
      .update('rentalObjectAssignments')
      .set({ status: 'EXPIRED' })
      .where(
        and(
          eq('organizationId', organizationId),
          eq('rentalObjectId', rentalObjectId)
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
    return {
      id: org.id,
      tenantId: org.tenantId,
      name: org.name,
      type: org.type,
      description: org.description,
      email: org.email,
      phone: org.phone,
      address: org.address,
      status: org.status,
      createdAt: org.createdAt?.toISOString(),
      updatedAt: org.updatedAt?.toISOString(),
    };
  }
}
