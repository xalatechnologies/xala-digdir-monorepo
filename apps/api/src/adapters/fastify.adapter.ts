/**
 * Fastify Framework Adapter
 * Registers routes from decorated controllers
 */
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import 'reflect-metadata';
import { container, type Constructor } from '../core/container';
import { getControllerMetadata } from '../core/decorators';
import { serializeError } from '../core/errors/problem-details';

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

  // Enable CORS for all origins
  await app.register(cors, {
    origin: '*', // Allow ALL origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: '*', // Allow ALL headers
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
      request.tenantId = request.headers['x-tenant-id'] || null;
      request.userId = request.headers['x-user-id'] || null;
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
