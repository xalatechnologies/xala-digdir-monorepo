/**
 * Case Handler Scope Service
 * Business logic for managing case handler scopes
 */
import { container } from '../../core/container';
import { eq, and, or, isNull } from 'drizzle-orm';
import { caseHandlerScopes, users, listings } from '../../database/schema/index';
import { getAuditService } from '../../core/audit/audit.service';
import { NotFoundError, BadRequestError } from '../../core/errors/problem-details';

/**
 * Query parameters for listing case handler scopes
 */
export interface CaseHandlerScopeQueryParams {
  tenantId: string;
  userId?: string;
  rentalObjectId?: string;
  scopeType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Input for creating a case handler scope
 */
export interface CreateCaseHandlerScopeInput {
  tenantId: string;
  userId: string;
  scopeType: 'all' | 'specific';
  rentalObjectId?: string;
  assignedBy?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Input for updating a case handler scope
 */
export interface UpdateCaseHandlerScopeInput {
  scopeType?: 'all' | 'specific';
  rentalObjectId?: string;
  status?: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  updatedBy?: string;
}

/**
 * Paginated result with metadata
 */
interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Case Handler Scope type
 */
interface CaseHandlerScope {
  id: string;
  tenantId: string;
  userId: string;
  scopeType: string;
  rentalObjectId: string | null;
  assignedBy: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

class CaseHandlerScopeService {
  /**
   * Find all case handler scopes with filtering
   */
  async findAll(params: CaseHandlerScopeQueryParams): Promise<PaginatedResult<CaseHandlerScope>> {
    const db = container.resolve<any>('Database');
    const { tenantId, userId, rentalObjectId, scopeType, status, page = 1, limit = 20 } = params;

    // Build conditions array
    const conditions: any[] = [eq(caseHandlerScopes.tenantId, tenantId)];

    if (userId) {
      conditions.push(eq(caseHandlerScopes.userId, userId));
    }
    if (rentalObjectId) {
      conditions.push(eq(caseHandlerScopes.rentalObjectId, rentalObjectId));
    }
    if (scopeType) {
      conditions.push(eq(caseHandlerScopes.scopeType, scopeType));
    }
    if (status) {
      conditions.push(eq(caseHandlerScopes.status, status));
    }

    // Get total count
    const { sql } = await import('drizzle-orm');
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(caseHandlerScopes)
      .where(and(...conditions));
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const offset = (page - 1) * limit;
    const data = await db
      .select()
      .from(caseHandlerScopes)
      .where(and(...conditions))
      .orderBy(caseHandlerScopes.createdAt)
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a case handler scope by ID
   */
  async findById(id: string): Promise<CaseHandlerScope | null> {
    const db = container.resolve<any>('Database');

    const result = await db
      .select()
      .from(caseHandlerScopes)
      .where(eq(caseHandlerScopes.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Check if a user has an active scope for a rental object
   */
  async hasScope(userId: string, rentalObjectId: string, tenantId: string): Promise<boolean> {
    const db = container.resolve<any>('Database');

    const result = await db
      .select()
      .from(caseHandlerScopes)
      .where(
        and(
          eq(caseHandlerScopes.userId, userId),
          eq(caseHandlerScopes.tenantId, tenantId),
          eq(caseHandlerScopes.status, 'active'),
          or(
            eq(caseHandlerScopes.scopeType, 'all'),
            and(
              eq(caseHandlerScopes.scopeType, 'specific'),
              eq(caseHandlerScopes.rentalObjectId, rentalObjectId)
            )
          )
        )
      )
      .limit(1);

    return result.length > 0;
  }

  /**
   * Create a new case handler scope
   */
  async create(input: CreateCaseHandlerScopeInput): Promise<CaseHandlerScope> {
    const db = container.resolve<any>('Database');

    // Check if user exists
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new NotFoundError(`User with ID ${input.userId} not found`);
    }

    // If specific scope, verify rental object exists
    if (input.scopeType === 'specific' && input.rentalObjectId) {
      const listingResult = await db
        .select()
        .from(listings)
        .where(eq(listings.id, input.rentalObjectId))
        .limit(1);

      if (listingResult.length === 0) {
        throw new NotFoundError(`Rental object with ID ${input.rentalObjectId} not found`);
      }
    }

    // Check for duplicate scope
    const existingConditions: any[] = [
      eq(caseHandlerScopes.userId, input.userId),
      eq(caseHandlerScopes.tenantId, input.tenantId),
      eq(caseHandlerScopes.status, 'active'),
    ];

    if (input.scopeType === 'specific' && input.rentalObjectId) {
      existingConditions.push(eq(caseHandlerScopes.rentalObjectId, input.rentalObjectId));
    } else if (input.scopeType === 'all') {
      existingConditions.push(eq(caseHandlerScopes.scopeType, 'all'));
    }

    const existingScope = await db
      .select()
      .from(caseHandlerScopes)
      .where(and(...existingConditions))
      .limit(1);

    if (existingScope.length > 0) {
      throw new BadRequestError(
        'A scope already exists for this user and rental object. Update the existing scope instead.'
      );
    }

    // Create the scope
    const [scope] = await db
      .insert(caseHandlerScopes)
      .values({
        tenantId: input.tenantId,
        userId: input.userId,
        scopeType: input.scopeType,
        rentalObjectId: input.rentalObjectId || null,
        assignedBy: input.assignedBy || null,
        status: 'active',
        metadata: input.metadata || {},
      })
      .returning();

    // Audit log
    getAuditService().log({
      tenantId: input.tenantId,
      userId: input.assignedBy,
      action: 'create',
      resource: 'case_handler_scope',
      resourceId: scope.id,
      metadata: {
        caseHandlerUserId: input.userId,
        scopeType: input.scopeType,
        rentalObjectId: input.rentalObjectId,
      },
    });

    return scope;
  }

  /**
   * Update a case handler scope
   */
  async update(id: string, input: UpdateCaseHandlerScopeInput): Promise<CaseHandlerScope> {
    const db = container.resolve<any>('Database');

    // Get existing scope
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Case handler scope with ID ${id} not found`);
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.scopeType !== undefined) {
      updateData.scopeType = input.scopeType;
    }
    if (input.rentalObjectId !== undefined) {
      updateData.rentalObjectId = input.rentalObjectId;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.metadata !== undefined) {
      updateData.metadata = { ...(existing.metadata || {}), ...input.metadata };
    }

    const [scope] = await db
      .update(caseHandlerScopes)
      .set(updateData)
      .where(eq(caseHandlerScopes.id, id))
      .returning();

    // Audit log
    getAuditService().log({
      tenantId: existing.tenantId,
      userId: input.updatedBy,
      action: 'update',
      resource: 'case_handler_scope',
      resourceId: id,
      metadata: {
        before: existing,
        after: scope,
        changes: Object.keys(input),
      },
    });

    return scope;
  }

  /**
   * Deactivate a case handler scope (soft delete)
   */
  async deactivate(id: string, deactivatedBy?: string): Promise<CaseHandlerScope> {
    const db = container.resolve<any>('Database');

    // Get existing scope
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundError(`Case handler scope with ID ${id} not found`);
    }

    const [scope] = await db
      .update(caseHandlerScopes)
      .set({
        status: 'inactive',
        updatedAt: new Date(),
        metadata: {
          ...(existing.metadata || {}),
          deactivatedBy,
          deactivatedAt: new Date().toISOString(),
        },
      })
      .where(eq(caseHandlerScopes.id, id))
      .returning();

    // Audit log
    getAuditService().log({
      tenantId: existing.tenantId,
      userId: deactivatedBy,
      action: 'delete',
      resource: 'case_handler_scope',
      resourceId: id,
      severity: 'warning',
      metadata: {
        before: existing,
        after: scope,
        action: 'deactivate',
      },
    });

    return scope;
  }

  /**
   * Get all active scopes for a user
   */
  async getUserScopes(userId: string, tenantId: string): Promise<CaseHandlerScope[]> {
    const db = container.resolve<any>('Database');

    const result = await db
      .select()
      .from(caseHandlerScopes)
      .where(
        and(
          eq(caseHandlerScopes.userId, userId),
          eq(caseHandlerScopes.tenantId, tenantId),
          eq(caseHandlerScopes.status, 'active')
        )
      );

    return result;
  }

  /**
   * Get all case handlers with scope for a rental object
   */
  async getRentalObjectHandlers(rentalObjectId: string, tenantId: string): Promise<CaseHandlerScope[]> {
    const db = container.resolve<any>('Database');

    const result = await db
      .select()
      .from(caseHandlerScopes)
      .where(
        and(
          eq(caseHandlerScopes.tenantId, tenantId),
          eq(caseHandlerScopes.status, 'active'),
          or(
            eq(caseHandlerScopes.scopeType, 'all'),
            and(
              eq(caseHandlerScopes.scopeType, 'specific'),
              eq(caseHandlerScopes.rentalObjectId, rentalObjectId)
            )
          )
        )
      );

    return result;
  }
}

// Singleton instance
let serviceInstance: CaseHandlerScopeService | null = null;

/**
 * Get the singleton CaseHandlerScopeService instance
 */
export function getCaseHandlerScopeService(): CaseHandlerScopeService {
  if (!serviceInstance) {
    serviceInstance = new CaseHandlerScopeService();
  }
  return serviceInstance;
}

export { CaseHandlerScopeService };
