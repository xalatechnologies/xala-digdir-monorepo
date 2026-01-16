/**
 * BaseController Unit Tests
 *
 * Test coverage:
 * 1. Response methods (ok, created, noContent)
 * 2. Error methods (RFC 7807 compliance)
 * 3. RBAC helpers (hasPermission, canAccessResource)
 * 4. User context extraction
 * 5. Audit metadata creation
 * 6. Pagination metadata creation
 * 7. Fastify reply helpers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BaseController,
  type UserContext,
  type PaginationMeta,
  type ProblemDetails,
} from '../../../apps/api/src/core/base.controller';
import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Concrete implementation for testing
 */
class TestController extends BaseController {
  // Expose protected methods for testing
  public testOk<T>(data: T, meta?: PaginationMeta) {
    return this.ok(data, meta);
  }

  public testCreated<T>(data: T) {
    return this.created(data);
  }

  public testNoContent() {
    return this.noContent();
  }

  public testBadRequest(detail: string, errors?: Record<string, string[]>) {
    return this.badRequest(detail, errors);
  }

  public testUnauthorized(detail?: string) {
    return this.unauthorized(detail);
  }

  public testForbidden(detail?: string) {
    return this.forbidden(detail);
  }

  public testNotFound(detail?: string) {
    return this.notFound(detail);
  }

  public testConflict(detail: string) {
    return this.conflict(detail);
  }

  public testUnprocessableEntity(detail: string, errors?: Record<string, string[]>) {
    return this.unprocessableEntity(detail, errors);
  }

  public testInternalServerError(detail?: string) {
    return this.internalServerError(detail);
  }

  public testHasPermission(user: UserContext, permission: string) {
    return this.hasPermission(user, permission);
  }

  public testIsTenantMember(user: UserContext, tenantId: string) {
    return this.isTenantMember(user, tenantId);
  }

  public testCanAccessResource(user: UserContext, resourceTenantId: string, permission: string) {
    return this.canAccessResource(user, resourceTenantId, permission);
  }

  public testGetUserContext(request: FastifyRequest) {
    return this.getUserContext(request);
  }

  public testRequireAuth(request: FastifyRequest) {
    return this.requireAuth(request);
  }

  public testCreateAuditMetadata(
    request: FastifyRequest,
    action: string,
    resourceType: string,
    resourceId?: string,
    changes?: Record<string, unknown>
  ) {
    return this.createAuditMetadata(request, action, resourceType, resourceId, changes);
  }

  public testCreatePaginationMeta(page: number, pageSize: number, totalCount: number) {
    return this.createPaginationMeta(page, pageSize, totalCount);
  }

  public testSendOk<T>(reply: FastifyReply, data: T, meta?: PaginationMeta) {
    return this.sendOk(reply, data, meta);
  }

  public testSendCreated<T>(reply: FastifyReply, data: T) {
    return this.sendCreated(reply, data);
  }

  public testSendNoContent(reply: FastifyReply) {
    return this.sendNoContent(reply);
  }

  public testSendError(reply: FastifyReply, problem: ProblemDetails) {
    return this.sendError(reply, problem);
  }
}

/**
 * Mock users for testing
 */
const mockUsers: Record<string, UserContext> = {
  citizen: {
    id: 'user-citizen-1',
    tenantId: 'kommune-oslo',
    role: 'CITIZEN',
  },
  caseworker: {
    id: 'user-caseworker-1',
    tenantId: 'kommune-oslo',
    role: 'CASEWORKER',
    organizationId: 'org-1',
  },
  admin: {
    id: 'user-admin-1',
    tenantId: 'kommune-oslo',
    role: 'ADMIN',
    organizationId: 'org-1',
  },
  saasAdmin: {
    id: 'user-saas-admin-1',
    tenantId: 'xala-platform',
    role: 'SAAS_ADMIN',
  },
};

/**
 * Create mock Fastify request
 */
function createMockRequest(user: UserContext | null): FastifyRequest {
  return {
    user,
    ip: '192.168.1.1',
    headers: {
      'user-agent': 'Mozilla/5.0 (test)',
    },
  } as any;
}

/**
 * Create mock Fastify reply
 */
function createMockReply(): FastifyReply {
  const reply = {
    statusCode: 200,
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockResolvedValue(undefined),
  };
  return reply as any;
}

describe('BaseController - Response Methods', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  it('should create ok response without pagination', () => {
    const data = { id: '123', name: 'Test' };
    const response = controller.testOk(data);

    expect(response).toEqual({ data });
    expect(response.meta).toBeUndefined();
  });

  it('should create ok response with pagination', () => {
    const data = [{ id: '123' }, { id: '456' }];
    const meta: PaginationMeta = {
      page: 1,
      pageSize: 10,
      totalCount: 25,
      totalPages: 3,
      hasNext: true,
      hasPrevious: false,
    };
    const response = controller.testOk(data, meta);

    expect(response).toEqual({ data, meta });
  });

  it('should create created response', () => {
    const data = { id: '123', name: 'New Resource' };
    const response = controller.testCreated(data);

    expect(response).toEqual({ data });
  });

  it('should create no content response', () => {
    const response = controller.testNoContent();
    expect(response).toBeUndefined();
  });
});

describe('BaseController - Error Methods (RFC 7807)', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  it('should create bad request error', () => {
    const error = controller.testBadRequest('Invalid input');

    expect(error).toMatchObject({
      type: '/errors/bad-request',
      title: 'Bad Request',
      status: 400,
      detail: 'Invalid input',
    });
  });

  it('should create bad request error with validation errors', () => {
    const validationErrors = {
      name: ['Name is required', 'Name must be at least 3 characters'],
      email: ['Invalid email format'],
    };
    const error = controller.testBadRequest('Validation failed', validationErrors);

    expect(error).toMatchObject({
      type: '/errors/bad-request',
      title: 'Bad Request',
      status: 400,
      detail: 'Validation failed',
      errors: validationErrors,
    });
  });

  it('should create unauthorized error', () => {
    const error = controller.testUnauthorized();

    expect(error).toMatchObject({
      type: '/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Authentication required',
    });
  });

  it('should create unauthorized error with custom detail', () => {
    const error = controller.testUnauthorized('Invalid token');

    expect(error).toMatchObject({
      type: '/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid token',
    });
  });

  it('should create forbidden error', () => {
    const error = controller.testForbidden();

    expect(error).toMatchObject({
      type: '/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'Insufficient permissions',
    });
  });

  it('should create forbidden error with custom detail', () => {
    const error = controller.testForbidden('Admin access required');

    expect(error).toMatchObject({
      type: '/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'Admin access required',
    });
  });

  it('should create not found error', () => {
    const error = controller.testNotFound();

    expect(error).toMatchObject({
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Resource not found',
    });
  });

  it('should create not found error with custom detail', () => {
    const error = controller.testNotFound('Rental object not found');

    expect(error).toMatchObject({
      type: '/errors/not-found',
      title: 'Not Found',
      status: 404,
      detail: 'Rental object not found',
    });
  });

  it('should create conflict error', () => {
    const error = controller.testConflict('Resource already exists');

    expect(error).toMatchObject({
      type: '/errors/conflict',
      title: 'Conflict',
      status: 409,
      detail: 'Resource already exists',
    });
  });

  it('should create unprocessable entity error', () => {
    const error = controller.testUnprocessableEntity('Business rule violation');

    expect(error).toMatchObject({
      type: '/errors/unprocessable-entity',
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'Business rule violation',
    });
  });

  it('should create unprocessable entity error with validation errors', () => {
    const validationErrors = {
      capacity: ['Cannot publish without capacity defined'],
    };
    const error = controller.testUnprocessableEntity('Cannot publish', validationErrors);

    expect(error).toMatchObject({
      type: '/errors/unprocessable-entity',
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'Cannot publish',
      errors: validationErrors,
    });
  });

  it('should create internal server error', () => {
    const error = controller.testInternalServerError();

    expect(error).toMatchObject({
      type: '/errors/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  });

  it('should create internal server error with custom detail', () => {
    const error = controller.testInternalServerError('Database connection failed');

    expect(error).toMatchObject({
      type: '/errors/internal-server-error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'Database connection failed',
    });
  });
});

describe('BaseController - RBAC Helpers', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('hasPermission', () => {
    it('should grant all permissions to SAAS_ADMIN', () => {
      expect(controller.testHasPermission(mockUsers.saasAdmin, 'rental-object:delete')).toBe(true);
      expect(controller.testHasPermission(mockUsers.saasAdmin, 'system:configure')).toBe(true);
      expect(controller.testHasPermission(mockUsers.saasAdmin, 'any:permission')).toBe(true);
    });

    it('should grant wildcard permissions to ADMIN', () => {
      expect(controller.testHasPermission(mockUsers.admin, 'rental-object:read')).toBe(true);
      expect(controller.testHasPermission(mockUsers.admin, 'rental-object:update')).toBe(true);
      expect(controller.testHasPermission(mockUsers.admin, 'rental-object:delete')).toBe(true);
      expect(controller.testHasPermission(mockUsers.admin, 'booking:create')).toBe(true);
    });

    it('should grant limited permissions to CASEWORKER', () => {
      expect(controller.testHasPermission(mockUsers.caseworker, 'rental-object:read')).toBe(true);
      expect(controller.testHasPermission(mockUsers.caseworker, 'rental-object:update')).toBe(true);
      expect(controller.testHasPermission(mockUsers.caseworker, 'booking:read')).toBe(true);
      expect(controller.testHasPermission(mockUsers.caseworker, 'booking:update')).toBe(true);
      expect(controller.testHasPermission(mockUsers.caseworker, 'rental-object:delete')).toBe(
        false
      );
      expect(controller.testHasPermission(mockUsers.caseworker, 'organization:update')).toBe(
        false
      );
    });

    it('should grant minimal permissions to CITIZEN', () => {
      expect(controller.testHasPermission(mockUsers.citizen, 'rental-object:read')).toBe(true);
      expect(controller.testHasPermission(mockUsers.citizen, 'booking:create')).toBe(true);
      expect(controller.testHasPermission(mockUsers.citizen, 'booking:read')).toBe(true);
      expect(controller.testHasPermission(mockUsers.citizen, 'rental-object:update')).toBe(false);
      expect(controller.testHasPermission(mockUsers.citizen, 'booking:update')).toBe(false);
    });

    it('should check explicit permissions array if provided', () => {
      const userWithExplicitPermissions: UserContext = {
        ...mockUsers.citizen,
        permissions: ['rental-object:delete', 'special:permission'],
      };

      expect(
        controller.testHasPermission(userWithExplicitPermissions, 'rental-object:delete')
      ).toBe(true);
      expect(
        controller.testHasPermission(userWithExplicitPermissions, 'special:permission')
      ).toBe(true);
    });
  });

  describe('isTenantMember', () => {
    it('should return true for matching tenant', () => {
      expect(controller.testIsTenantMember(mockUsers.citizen, 'kommune-oslo')).toBe(true);
    });

    it('should return false for non-matching tenant', () => {
      expect(controller.testIsTenantMember(mockUsers.citizen, 'kommune-bergen')).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    it('should allow access with matching tenant and permission', () => {
      expect(
        controller.testCanAccessResource(mockUsers.citizen, 'kommune-oslo', 'rental-object:read')
      ).toBe(true);
    });

    it('should deny access with non-matching tenant', () => {
      expect(
        controller.testCanAccessResource(mockUsers.citizen, 'kommune-bergen', 'rental-object:read')
      ).toBe(false);
    });

    it('should deny access without permission', () => {
      expect(
        controller.testCanAccessResource(mockUsers.citizen, 'kommune-oslo', 'rental-object:delete')
      ).toBe(false);
    });

    it('should allow SAAS_ADMIN to access any tenant', () => {
      expect(
        controller.testCanAccessResource(
          mockUsers.saasAdmin,
          'xala-platform',
          'rental-object:delete'
        )
      ).toBe(true);
    });
  });
});

describe('BaseController - User Context', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('getUserContext', () => {
    it('should extract user from request', () => {
      const request = createMockRequest(mockUsers.citizen);
      const user = controller.testGetUserContext(request);

      expect(user).toEqual(mockUsers.citizen);
    });

    it('should return null if no user attached', () => {
      const request = createMockRequest(null);
      const user = controller.testGetUserContext(request);

      expect(user).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return user if authenticated', () => {
      const request = createMockRequest(mockUsers.citizen);
      const user = controller.testRequireAuth(request);

      expect(user).toEqual(mockUsers.citizen);
    });

    it('should throw unauthorized error if not authenticated', () => {
      const request = createMockRequest(null);

      expect(() => controller.testRequireAuth(request)).toThrow();
    });
  });
});

describe('BaseController - Audit Metadata', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  it('should create audit metadata from request', () => {
    const request = createMockRequest(mockUsers.citizen);
    const metadata = controller.testCreateAuditMetadata(
      request,
      'rental-object:create',
      'RentalObject',
      'rental-obj-123',
      { name: 'Updated Name' }
    );

    expect(metadata).toMatchObject({
      tenantId: 'kommune-oslo',
      userId: 'user-citizen-1',
      action: 'rental-object:create',
      resourceType: 'RentalObject',
      resourceId: 'rental-obj-123',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (test)',
      changes: { name: 'Updated Name' },
    });
  });

  it('should create audit metadata without resourceId and changes', () => {
    const request = createMockRequest(mockUsers.admin);
    const metadata = controller.testCreateAuditMetadata(
      request,
      'rental-object:list',
      'RentalObject'
    );

    expect(metadata).toMatchObject({
      tenantId: 'kommune-oslo',
      userId: 'user-admin-1',
      action: 'rental-object:list',
      resourceType: 'RentalObject',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (test)',
    });
    expect(metadata.resourceId).toBeUndefined();
    expect(metadata.changes).toBeUndefined();
  });

  it('should throw if user not authenticated', () => {
    const request = createMockRequest(null);

    expect(() =>
      controller.testCreateAuditMetadata(request, 'action', 'ResourceType')
    ).toThrow();
  });
});

describe('BaseController - Pagination Metadata', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  it('should create pagination metadata for first page', () => {
    const meta = controller.testCreatePaginationMeta(1, 10, 25);

    expect(meta).toEqual({
      page: 1,
      pageSize: 10,
      totalCount: 25,
      totalPages: 3,
      hasNext: true,
      hasPrevious: false,
    });
  });

  it('should create pagination metadata for middle page', () => {
    const meta = controller.testCreatePaginationMeta(2, 10, 25);

    expect(meta).toEqual({
      page: 2,
      pageSize: 10,
      totalCount: 25,
      totalPages: 3,
      hasNext: true,
      hasPrevious: true,
    });
  });

  it('should create pagination metadata for last page', () => {
    const meta = controller.testCreatePaginationMeta(3, 10, 25);

    expect(meta).toEqual({
      page: 3,
      pageSize: 10,
      totalCount: 25,
      totalPages: 3,
      hasNext: false,
      hasPrevious: true,
    });
  });

  it('should handle single page results', () => {
    const meta = controller.testCreatePaginationMeta(1, 10, 5);

    expect(meta).toEqual({
      page: 1,
      pageSize: 10,
      totalCount: 5,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });
  });

  it('should handle empty results', () => {
    const meta = controller.testCreatePaginationMeta(1, 10, 0);

    expect(meta).toEqual({
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    });
  });
});

describe('BaseController - Fastify Reply Helpers', () => {
  let controller: TestController;

  beforeEach(() => {
    controller = new TestController();
  });

  describe('sendOk', () => {
    it('should send 200 response with data', async () => {
      const reply = createMockReply();
      const data = { id: '123', name: 'Test' };

      await controller.testSendOk(reply, data);

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({ data });
    });

    it('should send 200 response with data and pagination', async () => {
      const reply = createMockReply();
      const data = [{ id: '123' }];
      const meta: PaginationMeta = {
        page: 1,
        pageSize: 10,
        totalCount: 25,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      };

      await controller.testSendOk(reply, data, meta);

      expect(reply.status).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({ data, meta });
    });
  });

  describe('sendCreated', () => {
    it('should send 201 response with data', async () => {
      const reply = createMockReply();
      const data = { id: '123', name: 'New Resource' };

      await controller.testSendCreated(reply, data);

      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply.send).toHaveBeenCalledWith({ data });
    });
  });

  describe('sendNoContent', () => {
    it('should send 204 response with no body', async () => {
      const reply = createMockReply();

      await controller.testSendNoContent(reply);

      expect(reply.status).toHaveBeenCalledWith(204);
      expect(reply.send).toHaveBeenCalledWith();
    });
  });

  describe('sendError', () => {
    it('should send error response with correct status', async () => {
      const reply = createMockReply();
      const problem: ProblemDetails = {
        type: '/errors/not-found',
        title: 'Not Found',
        status: 404,
        detail: 'Resource not found',
      };

      await controller.testSendError(reply, problem);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(problem);
    });
  });
});
