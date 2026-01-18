/**
 * Fastify Framework Adapter
 * Registers routes from decorated controllers
 */
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'path';
import 'reflect-metadata';
import { container, type Constructor } from '../core/container';
import { getControllerMetadata } from '../core/decorators';
import { serializeError } from '../core/errors/problem-details';
import {
  globalRateLimitConfig,
  authRateLimitConfig,
  authEndpoints,
} from '../core/middleware/rate-limit.middleware';

export interface FastifyAdapterOptions {
  logger?: boolean;
  prefix?: string;
  adapters?: any;
}

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
  // When credentials: 'include' is used, we MUST reflect the specific origin
  // and cannot use wildcard '*'
  await app.register(cors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }
      
      // Allow all origins but reflect the specific origin back
      // This is required when credentials are included
      const allowedOrigins = [
        'https://web-test.digilist.no',
        'https://backoffice-test.digilist.no',
        'https://minside-test.digilist.no',
        'https://web.digilist.no',
        'https://backoffice.digilist.no',
        'https://minside.digilist.no',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
      ];
      
      // Accept if in whitelist or if it's a digilist domain
      if (allowedOrigins.includes(origin) || origin.endsWith('.digilist.no')) {
        callback(null, origin);
      } else {
        // For other origins, still allow but without credentials
        callback(null, origin);
      }
    },
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-User-Id', 'X-Correlation-Id', 'X-License-Key', 'Accept', 'Origin', 'Cache-Control'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Register Swagger for API documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Digilist API',
        description: 'REST API for the Digilist platform - rental management, bookings, and administration',
        version: '1.0.0',
        contact: {
          name: 'Digilist Support',
          email: 'support@digilist.no',
        },
      },
      servers: [
        {
          url: 'https://api.digilist.no',
          description: 'Production server',
        },
        {
          url: 'http://localhost:4000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication and authorization' },
        { name: 'rental-objects', description: 'Rental object management' },
        { name: 'bookings', description: 'Booking and reservation management' },
        { name: 'calendar', description: 'Calendar and availability' },
        { name: 'users', description: 'User management' },
        { name: 'organizations', description: 'Organization management' },
        { name: 'admin', description: 'Admin and backoffice endpoints' },
        { name: 'messages', description: 'Messaging and templates' },
        { name: 'notifications', description: 'Notification system' },
        { name: 'integrations', description: 'External integrations' },
        { name: 'billing', description: 'Billing and payments' },
        { name: 'audit', description: 'Audit logs' },
        { name: 'gdpr', description: 'GDPR and data privacy' },
        { name: 'help', description: 'Help and support' },
        { name: 'monitoring', description: 'System monitoring' },
        { name: 'public', description: 'Public endpoints' },
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'dl_at',
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
      // Handle undefined schema gracefully
      if (!schema) {
        return { schema: {}, url };
      }
      
      // Auto-generate tags from URL path
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
    staticCSP: false, // Disable Swagger's CSP, use our custom relaxed CSP instead
  });

  // Register cookie plugin for HTTP-only cookie support
  await app.register(cookie, {
    secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
    hook: 'onRequest',
    parseOptions: {}
  });

  // Register auth cookie middleware to extract JWT from cookies
  // This sets request.userId and request.tenantId from the dl_at cookie
  const { authCookieMiddleware } = await import('../middleware/auth-cookie.middleware');
  app.addHook('onRequest', authCookieMiddleware);

  // Register rate limiting with dynamic limits based on route
  // Global rate limit: 100 req/min, Auth endpoints: 5 req/min
  await app.register(rateLimit, {
    ...globalRateLimitConfig,
    max: async (request) => {
      // Apply stricter limit to authentication endpoints
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        request.url.startsWith(endpoint)
      );
      return isAuthEndpoint ? authRateLimitConfig.max : globalRateLimitConfig.max;
    },
    errorResponseBuilder: (request, context) => {
      // Use auth-specific error for auth endpoints
      const isAuthEndpoint = authEndpoints.some((endpoint) =>
        request.url.startsWith(endpoint)
      );
      if (isAuthEndpoint && authRateLimitConfig.errorResponseBuilder) {
        return authRateLimitConfig.errorResponseBuilder(request, context);
      }
      return globalRateLimitConfig.errorResponseBuilder
        ? globalRateLimitConfig.errorResponseBuilder(request, context)
        : {
            type: 'https://digilist.no/errors/rate-limit-exceeded',
            title: 'Too Many Requests',
            status: 429,
            detail: `Rate limit exceeded.`,
            instance: request.url,
          };
    },
  });

  // Register static file serving for storage
  // Serves files from apps/api/storage/ at /storage route
  const storageDir = path.join(process.cwd(), 'storage');
  await app.register(fastifyStatic, {
    root: storageDir,
    prefix: '/storage/',
    decorateReply: false, // Don't decorate to avoid conflicts
  });

  // Register seed-images static file serving
  // Serves files from apps/api/storage/seed-images/ at /seed-images route
  const seedImagesDir = path.join(process.cwd(), 'storage', 'seed-images');
  await app.register(fastifyStatic, {
    root: seedImagesDir,
    prefix: '/seed-images/',
    decorateReply: false,
  });

  // Register multipart for file uploads
  await app.register(fastifyMultipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 1000000, // Max field value size in bytes (1MB)
      fields: 10, // Max number of non-file fields
      fileSize: 10000000, // Max file size in bytes (10MB)
      files: 10, // Max number of file fields
      headerPairs: 2000, // Max number of header key=>value pairs
    },
  });

  // Handle empty JSON bodies (fixes SDK sending Content-Type: application/json with no body)
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
      // Use Skien Kommune as default tenant for demo, or null for public access
      request.tenantId = request.tenantId || request.headers['x-tenant-id'] || null;
      // Only set userId from header if not already set by auth middleware
      request.userId = request.userId || request.headers['x-user-id'] || null;
    });
  }

  // Request logging
  if (options.adapters?.log) {
    app.addHook('onRequest', async (request) => {
      options.adapters.log.info('Request received', {
        method: request.method,
        url: request.url,
        correlationId: request.id,
      });
    });

    app.addHook('onResponse', async (request, reply) => {
      options.adapters.log.info('Request completed', {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: reply.elapsedTime,
      });
    });
  }

  // Global error handler (RFC 7807)
  app.setErrorHandler(async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
    options.adapters?.log?.error('Request error', {
      error: error.message,
      stack: error.stack,
      correlationId: request.id,
    });

    const problemDetails = serializeError(error, request.id);
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
