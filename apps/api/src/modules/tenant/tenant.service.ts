/**
 * Tenant Service
 * Business logic for tenant domain
 */
import { Injectable, Inject } from '../../core/decorators';
import { TenantRepository } from './tenant.repository';
import { validate } from '../../core/validation/zod-pipe';
import { ConflictError } from '../../core/errors/problem-details';
import {
  CreateTenantSchema,
  UpdateTenantSchema,
  TenantQuerySchema,
  type CreateTenantDTO,
  type UpdateTenantDTO,
  type TenantQueryParams,
  type Tenant,
} from '../../schemas/tenant.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class TenantService {
  constructor(
    @Inject('TenantRepository') private readonly repository: TenantRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new tenant
   */
  async create(data: CreateTenantDTO): Promise<{ tenant: Tenant; userId: string }> {
    const validated = validate(CreateTenantSchema, data);

    // Check slug availability
    const slugAvailable = await this.repository.isSlugAvailable(validated.slug);
    if (!slugAvailable) {
      throw new ConflictError(`Slug '${validated.slug}' is already taken`);
    }

    // Create tenant
    const tenant = await this.repository.create({
      name: validated.name,
      slug: validated.slug,
      domain: validated.domain,
      settings: validated.settings || {},
      status: 'active',
    });

    this.adapters?.log?.info('Tenant created', { tenantId: tenant.id, slug: validated.slug });

    // Track analytics if available
    await this.adapters?.analytics?.track('tenant_created', {
      tenantId: tenant.id,
      plan: validated.plan,
    });

    // Send welcome email if available
    if (this.adapters?.email) {
      await this.adapters.email.send({
        to: validated.ownerEmail,
        subject: `Welcome to ${validated.name}!`,
        html: `<h1>Welcome!</h1><p>Your organization "${validated.name}" has been created.</p>`,
      });
    }

    // Return tenant with placeholder userId (owner should be created separately)
    return { tenant: tenant as Tenant, userId: 'pending' };
  }

  /**
   * Get tenant by ID
   */
  async findById(id: string): Promise<Tenant | null> {
    // Try cache first
    const cached = await this.adapters?.cache?.get(`tenant:${id}`) as Tenant | null;
    if (cached) return cached;

    const tenant = await this.repository.findById(id);
    
    if (tenant) {
      await this.adapters?.cache?.set(`tenant:${id}`, tenant, 3600);
    }

    return tenant as Tenant | null;
  }

  /**
   * Get tenant by ID or throw
   */
  async findByIdOrFail(id: string): Promise<Tenant> {
    return this.repository.findByIdOrFail(id) as Promise<Tenant>;
  }

  /**
   * Get tenant by slug
   */
  async findBySlug(slug: string): Promise<Tenant | null> {
    // Try cache first
    const cachedId = await this.adapters?.cache?.get(`tenant:slug:${slug}`) as string | null;
    if (cachedId) {
      return this.findById(cachedId);
    }

    const tenant = await this.repository.findBySlug(slug);
    
    if (tenant) {
      await this.adapters?.cache?.set(`tenant:slug:${slug}`, tenant.id, 3600);
      await this.adapters?.cache?.set(`tenant:${tenant.id}`, tenant, 3600);
    }

    return tenant as Tenant | null;
  }

  /**
   * List tenants with filters
   */
  async findAll(params: TenantQueryParams): Promise<PaginatedResult<Tenant>> {
    const validated = validate(TenantQuerySchema, params);
    return this.repository.findWithFilters({ ...validated, page: validated.page ?? 1, limit: validated.limit ?? 20 }) as Promise<PaginatedResult<Tenant>>;
  }

  /**
   * Update tenant
   */
  async update(id: string, data: UpdateTenantDTO): Promise<Tenant> {
    const validated = validate(UpdateTenantSchema, data);
    
    const tenant = await this.repository.update(id, validated);

    // Invalidate cache
    await this.adapters?.cache?.delete(`tenant:${id}`);
    if (tenant.slug) {
      await this.adapters?.cache?.delete(`tenant:slug:${tenant.slug}`);
    }

    this.adapters?.log?.info('Tenant updated', { tenantId: id, changes: Object.keys(validated) });

    return tenant as Tenant;
  }

  /**
   * Delete tenant (soft delete)
   */
  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);

    // Invalidate cache
    await this.adapters?.cache?.delete(`tenant:${id}`);

    // Track analytics
    await this.adapters?.analytics?.track('tenant_deleted', { tenantId: id });

    this.adapters?.log?.warn('Tenant deleted', { tenantId: id });
  }
}
