/**
 * Fastify Framework Adapter
 * Registers routes from decorated controllers
 */
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import 'reflect-metadata';
import { container, type Constructor } from '../core/container';
import { getControllerMetadata } from '../core/decorators';
import { serializeError } from '../core/errors/problem-details';

export interface ErrorAuditInfo {
  error: Error;
  errorType: string;
  errorMessage: string;
  statusCode: number;
  correlationId: string;
  method: string;
  url: string;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FastifyAdapterOptions {
  logger?: boolean;
  prefix?: string;
  adapters?: {
    log?: {
      info: (msg: string, meta?: object) => void;
      warn: (msg: string, meta?: object) => void;
      error: (msg: string, meta?: object) => void;
    };
  };
  onError?: (info: ErrorAuditInfo) => Promise<void>;
}

/**
 * Rate limit configuration
 */
const globalRateLimitConfig = {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: (request: FastifyRequest, context: { max: number; ttl: number }) => ({
    type: 'https://platform.xalatechnologies.com/errors/rate-limit-exceeded',
    title: 'Too Many Requests',
    status: 429,
    detail: `Rate limit exceeded. Maximum ${context.max} requests per minute.`,
    instance: request.url,
  }),
};

const authRateLimitConfig = {
  max: 5,
  timeWindow: '1 minute',
  errorResponseBuilder: (request: FastifyRequest, context: { max: number; ttl: number }) => ({
    type: 'https://platform.xalatechnologies.com/errors/auth-rate-limit-exceeded',
    title: 'Too Many Authentication Attempts',
    status: 429,
    detail: `Too many authentication attempts. Maximum ${context.max} per minute.`,
    instance: request.url,
  }),
};

const authEndpoints = ['/api/auth/login', '/api/auth/callback', '/api/auth/token'];

/**
 * Create and configure Fastify app with registered controllers
 */
export async function createFastifyApp(
  controllers: Constructor[],
  options: FastifyAdapterOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    requestIdLogLabel: 'correlationId',
  });

  // Security headers middleware
  app.addHook('onSend', async (request, reply) => {
    // Relax CSP for Swagger UI documentation
    if (request.url.startsWith('/docs')) {
      reply.header('Content-Security-Policy',
        "default-src 'self'; " +
        "base-uri 'self'; " +
        "font-src 'self' https: data:; " +
        "frame-ancestors 'self'; " +
        "img-src 'self' data: validator.swagger.io; " +
        "object-src 'none'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https:; " +
        "upgrade-insecure-requests"
      );
    } else {
      // Strict CSP for all other routes
      reply.header('Content-Security-Policy', "default-src 'self'");
    }

    // Prevent clickjacking attacks
    reply.header('X-Frame-Options', 'DENY');

    // Prevent MIME-sniffing
    reply.header('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy but still useful for older browsers)
    reply.header('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  });

  // Enable CORS with credentials support
  await app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow all origins but reflect the specific origin back
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5177',
        'http://localhost:5178',
        'http://localhost:3000',
      ];

      // Accept if in whitelist
      if (allowedOrigins.includes(origin) || origin.endsWith('.xalatechnologies.com')) {
        callback(null, origin);
      } else {
        callback(null, origin);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-User-Id', 'X-Correlation-Id', 'Accept', 'Origin', 'Cache-Control'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Register Swagger for API documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Platform API',
        description: 'REST API for Xala Technologies Platform - Domain-agnostic platform services',
        version: '1.0.0',
        contact: {
          name: 'Xala Technologies',
          email: 'support@xalatechnologies.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:4001',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'health', description: 'Health checks and readiness probes' },
        { name: 'auth', description: 'Authentication and authorization' },
        { name: 'users', description: 'User management' },
        { name: 'tenants', description: 'Tenant management' },
        { name: 'audit', description: 'Audit logs' },
        { name: 'notifications', description: 'Notification system' },
        { name: 'saas', description: 'SaaS administration' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'platform_at',
            description: 'HTTP-only cookie containing JWT access token',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token in Authorization header',
          },
        },
      },
    },
    transform: ({ schema, url }) => {
      if (!schema) {
        return { schema: {}, url };
      }

      const pathParts = url.split('/').filter(Boolean);
      const tag = pathParts[1] || 'general';

      return {
        schema: {
          ...schema,
          tags: schema.tags || [tag],
        },
        url,
      };
    },
  });

  // Register Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: false,
  });

  // Register cookie plugin for HTTP-only cookie support
  await app.register(cookie, {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    hook: 'onRequest',
    parseOptions: {}
  });

  // Register rate limiting with dynamic limits based on route
  await app.register(rateLimit, {
    ...globalRateLimitConfig,
    max: async (request) => {
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        request.url.startsWith(endpoint)
      );
      return isAuthEndpoint ? authRateLimitConfig.max : globalRateLimitConfig.max;
    },
    errorResponseBuilder: (request, context) => {
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        request.url.startsWith(endpoint)
      );
      if (isAuthEndpoint && authRateLimitConfig.errorResponseBuilder) {
        return authRateLimitConfig.errorResponseBuilder(request, context);
      }
      return globalRateLimitConfig.errorResponseBuilder
        ? globalRateLimitConfig.errorResponseBuilder(request, context)
        : {
            type: 'https://platform.xalatechnologies.com/errors/rate-limit-exceeded',
            title: 'Too Many Requests',
            status: 429,
            detail: `Rate limit exceeded.`,
            instance: request.url,
          };
    },
  });

  // Handle empty JSON bodies
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    if (!body || body === '') {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  // Inject adapters into requests
  if (options.adapters) {
    app.decorateRequest('adapters', null);
    app.decorateRequest('tenantId', null);
    app.decorateRequest('userId', null);

    app.addHook('onRequest', async (request: any) => {
      request.adapters = options.adapters;
      request.tenantId = request.tenantId || request.headers['x-tenant-id'] || null;
      request.userId = request.userId || request.headers['x-user-id'] || null;
    });
  }

  // Request logging
  if (options.adapters?.log) {
    app.addHook('onRequest', async (request) => {
      options.adapters?.log?.info('Request received', {
        method: request.method,
        url: request.url,
        correlationId: request.id,
      });
    });

    app.addHook('onResponse', async (request, reply) => {
      options.adapters?.log?.info('Request completed', {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: reply.elapsedTime,
      });
    });
  }

  // Global error handler (RFC 7807) with audit logging
  app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorType = error?.constructor?.name || typeof error;

    const problemDetails = serializeError(error, request.id);
    const isServerError = problemDetails.status >= 500;

    options.adapters?.log?.error('Request error', {
      method: request.method,
      url: request.url,
      error: errorMessage,
      stack: errorStack,
      errorType,
      statusCode: problemDetails.status,
      correlationId: request.id,
      userId: (request as { userId?: string }).userId,
      tenantId: (request as { tenantId?: string }).tenantId,
      ...(process.env.NODE_ENV !== 'production' && { fullError: error }),
    });

    if (isServerError && options.onError) {
      try {
        await options.onError({
          error,
          errorType,
          errorMessage,
          statusCode: problemDetails.status,
          correlationId: request.id as string,
          method: request.method,
          url: request.url,
          userId: (request as { userId?: string }).userId,
          tenantId: (request as { tenantId?: string }).tenantId,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
        });
      } catch (auditError) {
        options.adapters?.log?.error('Failed to audit error', { auditError });
      }
    }

    return reply
      .status(problemDetails.status)
      .header('Content-Type', 'application/problem+json')
      .send(problemDetails);
  });

  // Register controllers
  for (const Controller of controllers) {
    await registerController(app, Controller, options.prefix);
  }

  return app;
}

/**
 * Register a controller's routes with Fastify
 */
async function registerController(
  app: FastifyInstance,
  Controller: Constructor,
  globalPrefix?: string
): Promise<void> {
  const metadata = getControllerMetadata(Controller);
  const controllerInstance = container.resolve(Controller.name);
  const prefix = joinPaths(globalPrefix, metadata.prefix);

  for (const route of metadata.routes) {
    const path = joinPaths(prefix, route.path);
    const handler = (controllerInstance as any)[route.handler].bind(controllerInstance);

    switch (route.method) {
      case 'GET':
        app.get(path, handler);
        break;
      case 'POST':
        app.post(path, handler);
        break;
      case 'PUT':
        app.put(path, handler);
        break;
      case 'PATCH':
        app.patch(path, handler);
        break;
      case 'DELETE':
        app.delete(path, handler);
        break;
    }
  }
}

/**
 * Join path segments, ensuring result starts with /
 */
function joinPaths(...paths: (string | undefined)[]): string {
  const joined = paths
    .filter(Boolean)
    .map((p) => p!.replace(/^\/+|\/+$/g, ''))
    .filter((p) => p.length > 0)
    .join('/');
  return joined ? `/${joined}` : '/';
}
