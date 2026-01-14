/**
 * Tenant Repository
 * Data access layer for tenant entities
 */
import { Injectable } from '../../core/decorators';
import { BaseRepository, type PaginatedResult, type FilterCondition } from '../../database/base.repository';
import { tenants, type Tenant, type NewTenant } from '../../database/schema';
import type { TenantQueryParams } from '../../schemas/tenant.schema';

@Injectable()
export class TenantRepository extends BaseRepository<
  typeof tenants,
  Tenant,
  NewTenant,
  Partial<NewTenant>,
  string
> {
  constructor(db: any) {
    super(db, tenants, tenants.id);
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.findOne([{ field: 'slug', operator: 'eq', value: slug }]);
  }

  /**
   * Find tenants with query params
   */
  async findWithFilters(params: TenantQueryParams): Promise<PaginatedResult<Tenant>> {
    const conditions: FilterCondition[] = [];

    if (params.status) {
      conditions.push({ field: 'status', operator: 'eq', value: params.status });
    }

    if (params.search) {
      conditions.push({ field: 'name', operator: 'like', value: `%${params.search}%` });
    }

    return this.findMany(conditions, {
      page: params.page,
      limit: params.limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await this.findBySlug(slug);
    if (!existing) return true;
    return excludeId ? existing.id === excludeId : false;
  }

  /**
   * Soft delete tenant
   */
  async softDelete(id: string): Promise<void> {
    await this.update(id, { status: 'deleted' });
  }

  protected getEntityName(): string {
    return 'Tenant';
  }
}
