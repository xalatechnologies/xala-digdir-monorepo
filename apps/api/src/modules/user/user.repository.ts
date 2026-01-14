/**
 * User Repository
 * Data access layer for user management
 */
import { users } from '../../database/schema';
import { eq, and, ilike, or } from 'drizzle-orm';
import { NotFoundError } from '../../core/errors/problem-details';

export class UserRepository {
  constructor(private readonly db: any) {}

  private get table() {
    return users;
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(users.id, id))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(users.email, email))
      .limit(1);
    return results[0] || null;
  }

  /**
   * Find users by tenant with filters
   */
  async findByTenant(
    tenantId: string,
    filters: {
      page: number;
      limit: number;
      status?: string;
      role?: string;
      search?: string;
      organizationId?: string;
    }
  ) {
    const offset = (filters.page - 1) * filters.limit;
    const conditions: any[] = [eq(users.tenantId, tenantId)];

    if (filters.status) {
      conditions.push(eq(users.status, filters.status));
    }
    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.organizationId) {
      conditions.push(eq(users.organizationId, filters.organizationId));
    }

    const data = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .limit(filters.limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: filters.page > 1,
      },
    };
  }

  /**
   * Create user
   */
  async create(data: any) {
    const result = await this.db
      .insert(this.table)
      .values(data)
      .returning();
    return result[0];
  }

  /**
   * Update user
   */
  async update(id: string, data: any) {
    const result = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  /**
   * Update user role
   */
  async updateRole(id: string, role: string) {
    return this.update(id, { role });
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(id: string) {
    return this.update(id, { status: 'inactive' });
  }

  /**
   * Delete user
   */
  async delete(id: string) {
    await this.db.delete(this.table).where(eq(users.id, id));
  }
}
