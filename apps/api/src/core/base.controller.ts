/**
 * BaseController
 *
 * Base class for all API controllers with:
 * - Standard response formats
 * - RFC 7807 Problem Details error handling
 * - Projection DTO enforcement
 * - RBAC integration hooks
 * - Audit logging helpers
 *
 * @example
 * ```typescript
 * class RentalObjectController extends BaseController {
 *   async getById(request: Request): Promise<Response> {
 *     const domain = await this.service.findById(request.params.id);
 *     if (!domain) {
 *       return this.notFound('Rental object not found');
 *     }
 *
 *     const projection = this.mapper.toDetailsProjection(domain, {
 *       canBook: this.hasPermission(request.user, 'booking:create'),
 *       canEdit: this.hasPermission(request.user, 'rental-object:update'),
 *     });
 *
 *     return this.ok(projection);
 *   }
 * }
 * ```
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Standard pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: PaginationMeta;
}

/**
 * RFC 7807 Problem Details
 * @see https://www.rfc-editor.org/rfc/rfc7807
 */
export interface ProblemDetails {
  type: string; // URI identifying error type
  title: string; // Human-readable summary
  status: number; // HTTP status code
  detail?: string; // Human-readable explanation
  instance?: string; // URI identifying the specific occurrence
  [key: string]: unknown; // Additional properties
}

/**
 * User context from JWT token
 */
export interface UserContext {
  id: string;
  tenantId: string;
  role: 'CITIZEN' | 'CASEWORKER' | 'ADMIN' | 'SAAS_ADMIN';
  organizationId?: string;
  permissions?: string[];
}

/**
 * Audit event metadata
 */
export interface AuditMetadata {
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  changes?: Record<string, unknown>;
}

/**
 * Base controller class with standard response methods and projection enforcement
 */
export abstract class BaseController {
  /**
   * Success response (200 OK)
   */
  protected ok<T>(data: T, meta?: PaginationMeta): ApiResponse<T> {
    return meta ? { data, meta } : { data };
  }

  /**
   * Created response (201 Created)
   */
  protected created<T>(data: T): ApiResponse<T> {
    return { data };
  }

  /**
   * No content response (204 No Content)
   */
  protected noContent(): void {
    // No response body
  }

  /**
   * Bad request error (400 Bad Request)
   */
  protected badRequest(detail: string, errors?: Record<string, string[]>): ProblemDetails {
    return {
      type: '/errors/bad-request',
      title: 'Bad Request',
      status: 400,
      detail,
      ...(errors && { errors }),
    };
  }

  /**
   * Unauthorized error (401 Unauthorized)
   */
  protected unauthorized(detail: string = 'Authentication required'): ProblemDetails {
    return {
      type: '/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail,
    };
  }

  /**
   * Forbidden error (403 Forbidden)
   */
  protected forbidden(detail: string = 'Insufficient permissions'): ProblemDetails {
    return {
      type: '/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail,
    };
  }

  /**
   * Not found error (404 Not Found)
   */
  protected notFound(detail: string = 'Resource not found'): ProblemDetails {
    return {
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail,
    };
  }

  /**
   * Conflict error (409 Conflict)
   */
  protected conflict(detail: string): ProblemDetails {
    return {
      type: '/errors/conflict',
      title: 'Conflict',
      status: 409,
      detail,
    };
  }

  /**
   * Unprocessable entity error (422 Unprocessable Entity)
   */
  protected unprocessableEntity(detail: string, errors?: Record<string, string[]>): ProblemDetails {
    return {
      type: '/errors/unprocessable-entity',
      title: 'Unprocessable Entity',
      status: 422,
      detail,
      ...(errors && { errors }),
    };
  }

  /**
   * Internal server error (500 Internal Server Error)
   */
  protected internalServerError(detail: string = 'An unexpected error occurred'): ProblemDetails {
    return {
      type: '/errors/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      detail,
    };
  }

  /**
   * Check if user has specific permission
   */
  protected hasPermission(user: UserContext, permission: string): boolean {
    // SAAS_ADMIN has all permissions
    if (user.role === 'SAAS_ADMIN') {
      return true;
    }

    // Check explicit permissions array
    if (user.permissions && user.permissions.includes(permission)) {
      return true;
    }

    // Role-based permissions (simplified, should be from RBAC matrix)
    const rolePermissions: Record<string, string[]> = {
      ADMIN: ['rental-object:*', 'booking:*', 'organization:*'],
      CASEWORKER: ['rental-object:read', 'rental-object:update', 'booking:read', 'booking:update'],
      CITIZEN: ['rental-object:read', 'booking:create', 'booking:read'],
    };

    const permissions = rolePermissions[user.role] || [];
    return permissions.some((p) => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -2);
        return permission.startsWith(prefix);
      }
      return p === permission;
    });
  }

  /**
   * Check if user belongs to specific tenant
   */
  protected isTenantMember(user: UserContext, tenantId: string): boolean {
    return user.tenantId === tenantId;
  }

  /**
   * Check if user can access resource (tenant + permission check)
   */
  protected canAccessResource(
    user: UserContext,
    resourceTenantId: string,
    permission: string
  ): boolean {
    return this.isTenantMember(user, resourceTenantId) && this.hasPermission(user, permission);
  }

  /**
   * Extract user context from Fastify request
   */
  protected getUserContext(request: FastifyRequest): UserContext | null {
    // Assumes authentication middleware attaches user to request
    return (request as any).user || null;
  }

  /**
   * Require authenticated user (throw if missing)
   */
  protected requireAuth(request: FastifyRequest): UserContext {
    const user = this.getUserContext(request);
    if (!user) {
      throw this.unauthorized();
    }
    return user;
  }

  /**
   * Create audit metadata from request
   */
  protected createAuditMetadata(
    request: FastifyRequest,
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: Record<string, unknown>
  ): AuditMetadata {
    const user = this.requireAuth(request);
    return {
      tenantId: user.tenantId,
      userId: user.id,
      action,
      resourceType,
      resourceId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      changes,
    };
  }

  /**
   * Create pagination metadata
   */
  protected createPaginationMeta(
    page: number,
    pageSize: number,
    totalCount: number
  ): PaginationMeta {
    const totalPages = Math.ceil(totalCount / pageSize);
    return {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  /**
   * Send success response
   */
  protected async sendOk<T>(reply: FastifyReply, data: T, meta?: PaginationMeta): Promise<void> {
    await reply.status(200).send(this.ok(data, meta));
  }

  /**
   * Send created response
   */
  protected async sendCreated<T>(reply: FastifyReply, data: T): Promise<void> {
    await reply.status(201).send(this.created(data));
  }

  /**
   * Send no content response
   */
  protected async sendNoContent(reply: FastifyReply): Promise<void> {
    await reply.status(204).send();
  }

  /**
   * Send error response
   */
  protected async sendError(reply: FastifyReply, problem: ProblemDetails): Promise<void> {
    await reply.status(problem.status).send(problem);
  }
}
