/**
 * User Service
 * Business logic for user management
 */
import { Injectable, Inject } from '../../core/decorators';
import { UserRepository } from './user.repository';
import { validate } from '../../core/validation/zod-pipe';
import { NotFoundError, ConflictError, ForbiddenError } from '../../core/errors/problem-details';
import { getAuditService } from '../../core/audit/audit.service';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserQuerySchema,
  InviteUserSchema,
  AssignRoleSchema,
  UpdateConsentsSchema,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UserQueryParams,
  type InviteUserDTO,
  type AssignRoleDTO,
  type User,
  type UserConsents,
  type UpdateConsentsDTO,
} from '../../schemas/user.schema';
import type { PaginatedResult } from '../../database/base.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository') private readonly repository: UserRepository,
    @Inject('Adapters') private readonly adapters: any
  ) {}

  /**
   * Create a new user
   */
  async create(tenantId: string, data: CreateUserDTO): Promise<User> {
    const validated = validate(CreateUserSchema, data);

    // Check if email is already taken
    const existing = await this.repository.findByEmail(validated.email);
    if (existing) {
      throw new ConflictError(`User with email ${validated.email} already exists`);
    }

    const user = await this.repository.create({
      tenantId,
      email: validated.email,
      name: validated.name,
      role: validated.role || 'member',
      status: 'active',
      organizationId: validated.organizationId || null,
      metadata: validated.metadata || {},
    });

    this.adapters?.log?.info('User created', { id: user.id, tenantId, email: validated.email });

    getAuditService().log({
      tenantId,
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      metadata: { email: validated.email, role: validated.role },
    });

    // Track analytics
    this.adapters?.analytics?.track('user_created', {
      userId: user.id,
      tenantId,
      role: validated.role,
    });

    return user as unknown as User;
  }

  /**
   * Invite a user via email
   */
  async invite(tenantId: string, data: InviteUserDTO): Promise<{ invitationId: string }> {
    const validated = validate(InviteUserSchema, data);

    // Check if user already exists
    const existing = await this.repository.findByEmail(validated.email);
    if (existing) {
      throw new ConflictError(`User with email ${validated.email} already exists`);
    }

    // Create pending user
    const user = await this.repository.create({
      tenantId,
      email: validated.email,
      name: validated.name || validated.email.split('@')[0],
      role: validated.role || 'member',
      status: 'pending',
      organizationId: validated.organizationId || null,
      metadata: { invitedAt: new Date().toISOString() },
    });

    const invitationId = `inv_${user.id}`;

    // Send invitation email
    await this.adapters?.email?.send({
      to: validated.email,
      subject: 'You have been invited',
      html: `<p>You have been invited to join. Your invitation ID is: ${invitationId}</p>`,
    });

    this.adapters?.log?.info('User invited', { email: validated.email, tenantId });

    getAuditService().log({
      tenantId,
      action: 'create',
      resource: 'user',
      resourceId: user.id,
      metadata: { email: validated.email, invitationType: 'invite' },
    });

    return { invitationId };
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.repository.findById(id) as unknown as Promise<User | null>;
  }

  /**
   * Get user by ID or throw
   */
  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user as unknown as User;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email) as unknown as Promise<User | null>;
  }

  /**
   * List users for a tenant
   */
  async findAll(tenantId: string, params: UserQueryParams): Promise<PaginatedResult<User>> {
    const validated = validate(UserQuerySchema, params);
    return this.repository.findByTenant(tenantId, {
      ...validated,
      page: validated.page ?? 1,
      limit: validated.limit ?? 20,
    }) as unknown as Promise<PaginatedResult<User>>;
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const validated = validate(UpdateUserSchema, data);
    const existing = await this.findByIdOrFail(id);
    const user = await this.repository.update(id, validated as any);
    this.adapters?.log?.info('User updated', { id });
    
    getAuditService().log({
      tenantId: existing.tenantId,
      action: 'update',
      resource: 'user',
      resourceId: id,
      metadata: { changes: Object.keys(validated) },
    });
    
    return user as unknown as User;
  }

  /**
   * Assign role to user
   */
  async assignRole(id: string, data: AssignRoleDTO): Promise<User> {
    const validated = validate(AssignRoleSchema, data);
    const existing = await this.findByIdOrFail(id);
    const user = await this.repository.updateRole(id, validated.role);
    this.adapters?.log?.info('User role updated', { id, role: validated.role });
    
    getAuditService().log({
      tenantId: existing.tenantId,
      action: 'update',
      resource: 'user',
      resourceId: id,
      metadata: { previousRole: existing.role, newRole: validated.role },
    });
    
    return user as unknown as User;
  }

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    const existing = await this.findByIdOrFail(id);
    const user = await this.repository.deactivate(id);
    this.adapters?.log?.warn('User deactivated', { id });
    
    getAuditService().log({
      tenantId: existing.tenantId,
      action: 'update',
      resource: 'user',
      resourceId: id,
      severity: 'warning',
      metadata: { action: 'deactivate' },
    });
    
    return user as unknown as User;
  }

  /**
   * Delete user permanently
   */
  async delete(id: string): Promise<void> {
    const existing = await this.findByIdOrFail(id);
    await this.repository.delete(id);
    this.adapters?.log?.warn('User deleted', { id });

    getAuditService().log({
      tenantId: existing.tenantId,
      action: 'delete',
      resource: 'user',
      resourceId: id,
      severity: 'warning',
      metadata: { email: existing.email },
    });
  }

  /**
   * Get user consents
   */
  async getConsents(id: string): Promise<UserConsents> {
    const user = await this.findByIdOrFail(id);

    // Extract consents from user metadata
    const metadata = user.metadata as any || {};
    const consents: UserConsents = {
      marketing: metadata.consents?.marketing ?? false,
      analytics: metadata.consents?.analytics ?? true,
      necessary: metadata.consents?.necessary ?? true,
      preferences: {
        emailNotifications: metadata.consents?.preferences?.emailNotifications ?? true,
        smsNotifications: metadata.consents?.preferences?.smsNotifications ?? false,
        pushNotifications: metadata.consents?.preferences?.pushNotifications ?? true,
      },
    };

    return consents;
  }

  /**
   * Update user consents
   */
  async updateConsents(id: string, data: UpdateConsentsDTO): Promise<UserConsents> {
    const validated = validate(UpdateConsentsSchema, data);
    const existing = await this.findByIdOrFail(id);

    // Get current consents
    const currentConsents = await this.getConsents(id);

    // Merge with new consents
    const updatedConsents: UserConsents = {
      ...currentConsents,
      ...validated,
      preferences: {
        ...currentConsents.preferences,
        ...(validated.preferences || {}),
      },
    };

    // Update user metadata with new consents
    const metadata = (existing.metadata as any) || {};
    metadata.consents = updatedConsents;
    metadata.consentsUpdatedAt = new Date().toISOString();
    metadata.consentsVersion = '1.0';

    await this.repository.update(id, { metadata });

    this.adapters?.log?.info('User consents updated', { id, changes: Object.keys(validated) });

    // Audit log consent changes
    getAuditService().log({
      tenantId: existing.tenantId,
      action: 'update',
      resource: 'user_consents',
      resourceId: id,
      metadata: {
        previousConsents: currentConsents,
        updatedConsents: validated,
        timestamp: new Date().toISOString(),
      },
    });

    return updatedConsents;
  }
}
