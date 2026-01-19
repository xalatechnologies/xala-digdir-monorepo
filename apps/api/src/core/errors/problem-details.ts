/**
 * RFC 7807 Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
import { z } from 'zod';

/**
 * Problem Details Schema (RFC 7807)
 */
export const ProblemDetailsSchema = z.object({
  type: z.string().url().optional().default('about:blank'),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  errors: z.array(z.object({
    field: z.string().optional(),
    message: z.string(),
    code: z.string().optional(),
  })).optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(
    public readonly title: string,
    public readonly status: number,
    public readonly detail?: string,
    public readonly type?: string,
    public readonly errors?: Array<{ field?: string; message: string; code?: string }>
  ) {
    super(detail || title);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  toProblemDetails(correlationId?: string): ProblemDetails {
    return {
      type: this.type || 'about:blank',
      title: this.title,
      status: this.status,
      detail: this.detail,
      correlationId,
      timestamp: new Date().toISOString(),
      errors: this.errors,
    };
  }
}

/**
 * Common Error Classes
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'Resource Not Found',
      404,
      id ? `${resource} with id '${id}' was not found` : `${resource} not found`,
      '/errors/not-found'
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(errors: Array<{ field?: string; message: string; code?: string }>) {
    super(
      'Validation Failed',
      400,
      'One or more validation errors occurred',
      '/errors/validation',
      errors
    );
    this.name = 'ValidationError';
  }
}

export class BadRequestError extends AppError {
  constructor(detail: string) {
    super(
      'Bad Request',
      400,
      detail,
      '/errors/bad-request'
    );
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(detail?: string) {
    super(
      'Unauthorized',
      401,
      detail || 'Authentication is required',
      '/errors/unauthorized'
    );
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(detail?: string) {
    super(
      'Forbidden',
      403,
      detail || 'You do not have permission to access this resource',
      '/errors/forbidden'
    );
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(detail: string) {
    super(
      'Conflict',
      409,
      detail,
      '/errors/conflict'
    );
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Too Many Requests',
      429,
      `Rate limit exceeded${retryAfter ? `. Retry after ${retryAfter} seconds` : ''}`,
      '/errors/rate-limit'
    );
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(detail?: string) {
    super(
      'Internal Server Error',
      500,
      detail || 'An unexpected error occurred',
      '/errors/internal'
    );
    this.name = 'InternalError';
  }
}

export class DatabaseError extends AppError {
  constructor(detail?: string, public readonly originalError?: Error) {
    super(
      'Database Error',
      503,
      detail || 'A database error occurred',
      '/errors/database'
    );
    this.name = 'DatabaseError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string, retryAfter?: number) {
    super(
      'Service Unavailable',
      503,
      `${service} is temporarily unavailable${retryAfter ? `. Retry after ${retryAfter} seconds` : ''}`,
      '/errors/service-unavailable'
    );
    this.name = 'ServiceUnavailableError';
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string, timeoutMs: number) {
    super(
      'Request Timeout',
      408,
      `${operation} timed out after ${timeoutMs}ms`,
      '/errors/timeout'
    );
    this.name = 'TimeoutError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, detail?: string) {
    super(
      'External Service Error',
      502,
      detail || `Failed to communicate with ${service}`,
      '/errors/external-service'
    );
    this.name = 'ExternalServiceError';
  }
}

/**
 * Error serializer for HTTP responses
 */
export function serializeError(error: unknown, correlationId?: string): ProblemDetails {
  if (error instanceof AppError) {
    return error.toProblemDetails(correlationId);
  }

  if (error instanceof Error) {
    return {
      type: '/errors/internal',
      title: 'Internal Server Error',
      status: 500,
      detail: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
      correlationId,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    type: '/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    correlationId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create Problem Details object for HTTP error responses
 * Helper function for creating RFC7807 compliant error objects
 */
export function createProblemDetails(options: {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ field?: string; message: string; code?: string }>;
}): ProblemDetails {
  return {
    type: `/errors/${options.type}`,
    title: options.title,
    status: options.status,
    detail: options.detail,
    instance: options.instance,
    timestamp: new Date().toISOString(),
    errors: options.errors,
  };
}
