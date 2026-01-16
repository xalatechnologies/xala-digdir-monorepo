/**
 * Organization Repository
 * 
 * Data access layer for organization entities.
 * Encapsulates all database operations for organizations.
 * Controllers should use this instead of direct schema imports.
 */

import { container } from '../../core/container';
import { eq, and, count, like, desc, type SQL } from 'drizzle-orm';
import { organizations, users } from '../../database/schema/index';

// =============================================================================
// Types
// =============================================================================

export interface OrganizationRecord {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationWithMembers extends OrganizationRecord {
  memberCount: number;
  members?: MemberRecord[];
}

export interface MemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
}

export interface CreateOrganizationInput {
  tenantId: string;
  name: string;
  slug?: string;
  type?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  type?: string;
  status?: string;
  settings?: Record<string, unknown>;
}

export interface OrganizationQueryParams {
  tenantId?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// =============================================================================
// Repository Class
// =============================================================================

export class OrganizationRepository {
  private getDb() {
    return container.resolve<any>('Database');
  }

  /**
   * Find all organizations with optional filtering and pagination
   */
  async findAll(params: OrganizationQueryParams = {}): Promise<PaginatedResult<OrganizationWithMembers>> {
    const db = this.getDb();
    const { tenantId, search, status, page = 1, limit = 20 } = params;

    const conditions: SQL[] = [];
    if (tenantId) conditions.push(eq(organizations.tenantId, tenantId));
    if (status) conditions.push(eq(organizations.status, status));
    if (search) conditions.push(like(organizations.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        id: organizations.id,
        tenantId: organizations.tenantId,
        name: organizations.name,
        slug: organizations.slug,
        type: organizations.type,
        status: organizations.status,
        settings: organizations.settings,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .where(whereClause)
      .orderBy(desc(organizations.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    // Get member counts per org
    const orgsWithMembers = await Promise.all(
      result.map(async (org: OrganizationRecord) => {
        const memberCount = await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.organizationId, org.id));
        return {
          ...org,
          memberCount: Number(memberCount[0]?.count || 0),
        };
      })
    );

    const countResult = await db
      .select({ count: count() })
      .from(organizations)
      .where(whereClause);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: orgsWithMembers,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  /**
   * Find organization by ID
   */
  async findById(id: string): Promise<OrganizationWithMembers | null> {
    const db = this.getDb();

    const result = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));

    if (!result.length) {
      return null;
    }

    // Get member count
    const memberCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.organizationId, id));

    return {
      ...result[0],
      memberCount: Number(memberCount[0]?.count || 0),
    };
  }

  /**
   * Find organization by ID or throw
   */
  async findByIdOrFail(id: string): Promise<OrganizationWithMembers> {
    const org = await this.findById(id);
    if (!org) {
      throw new Error(`Organization not found: ${id}`);
    }
    return org;
  }

  /**
   * Create a new organization
   */
  async create(input: CreateOrganizationInput): Promise<OrganizationRecord> {
    const db = this.getDb();

    const result = await db
      .insert(organizations)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        slug: input.slug || input.name.toLowerCase().replace(/\s+/g, '-'),
        type: input.type || 'organization',
        status: 'active',
        settings: input.settings || {},
      })
      .returning();

    return result[0];
  }

  /**
   * Update an organization
   */
  async update(id: string, input: UpdateOrganizationInput): Promise<OrganizationRecord | null> {
    const db = this.getDb();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.settings !== undefined) updateData.settings = input.settings;

    const result = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Update organization branding
   */
  async updateBranding(id: string, branding: Record<string, unknown>): Promise<OrganizationRecord | null> {
    const db = this.getDb();

    // First, get current settings
    const org = await this.findById(id);
    if (!org) return null;

    const currentSettings = org.settings || {};
    const updatedSettings = {
      ...currentSettings,
      branding: {
        ...((currentSettings as any).branding || {}),
        ...branding,
      },
    };

    return this.update(id, { settings: updatedSettings });
  }

  /**
   * Get organization branding
   */
  async getBranding(id: string): Promise<Record<string, unknown> | null> {
    const org = await this.findById(id);
    if (!org) return null;

    return (org.settings as any)?.branding || {
      logo: undefined,
      primaryColor: undefined,
      secondaryColor: undefined,
      favicon: undefined,
    };
  }

  /**
   * Get organization members
   */
  async getMembers(organizationId: string): Promise<MemberRecord[]> {
    const db = this.getDb();

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.organizationId, organizationId));

    return result;
  }

  /**
   * Add member to organization
   */
  async addMember(organizationId: string, member: {
    name: string;
    email: string;
    role?: string;
  }): Promise<MemberRecord> {
    const db = this.getDb();

    // Get org's tenant
    const org = await this.findById(organizationId);
    if (!org) {
      throw new Error(`Organization not found: ${organizationId}`);
    }

    const result = await db
      .insert(users)
      .values({
        tenantId: org.tenantId,
        organizationId,
        name: member.name,
        email: member.email,
        role: member.role || 'member',
        status: 'active',
      })
      .returning();

    return {
      id: result[0].id,
      name: result[0].name,
      email: result[0].email,
      role: result[0].role,
      status: result[0].status,
      createdAt: result[0].createdAt,
    };
  }

  /**
   * Remove member from organization
   */
  async removeMember(organizationId: string, memberId: string): Promise<boolean> {
    const db = this.getDb();

    const result = await db
      .update(users)
      .set({ organizationId: null, updatedAt: new Date() })
      .where(and(eq(users.id, memberId), eq(users.organizationId, organizationId)))
      .returning();

    return result.length > 0;
  }

  /**
   * Delete organization
   */
  async delete(id: string): Promise<boolean> {
    const db = this.getDb();

    const result = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();

    return result.length > 0;
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let repositoryInstance: OrganizationRepository | null = null;

export function getOrganizationRepository(): OrganizationRepository {
  if (!repositoryInstance) {
    repositoryInstance = new OrganizationRepository();
  }
  return repositoryInstance;
}
