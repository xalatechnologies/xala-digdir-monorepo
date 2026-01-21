/**
 * Platform API - Main Entry Point
 * Domain-agnostic API server for platform services
 *
 * IMPORTANT: This API is PLATFORM-ONLY
 * - NO @digilist/* imports allowed
 * - NO domain-specific modules (rental, booking, etc.)
 * - Only platform infrastructure services
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

import { container } from './core/container';
import { createFastifyApp } from './adapters/fastify.adapter';

// Import platform modules ONLY
import { HealthController } from './modules/health';

/**
 * Initialize platform adapters (mock for development)
 */
async function initializeAdapters() {
  return {
    log: {
      info: (msg: string, meta?: object) => console.log(`[INFO] ${msg}`, meta || ''),
      warn: (msg: string, meta?: object) => console.warn(`[WARN] ${msg}`, meta || ''),
      error: (msg: string, meta?: object) => console.error(`[ERROR] ${msg}`, meta || ''),
    },
    cache: {
      get: async <T>(key: string): Promise<T | null> => null,
      set: async (key: string, value: unknown, ttl?: number): Promise<void> => {},
      delete: async (key: string): Promise<void> => {},
    },
    analytics: {
      track: async (event: string, properties?: object): Promise<void> => {},
      identify: async (userId: string, traits?: object): Promise<void> => {},
    },
  };
}

/**
 * Bootstrap the platform API
 */
async function bootstrap() {
  console.log('Starting Platform API...\n');

  // Initialize platform adapters
  const adapters = await initializeAdapters();
  console.log('Adapters initialized');

  // Register adapters in container
  container.registerValue('Adapters', adapters);

  // Register controllers
  // NOTE: Add platform controllers here as they are implemented
  // Example: AuthController, TenantController, UserController, AuditController
  container.registerFactory('HealthController', () => new HealthController());
  console.log('Controllers registered');

  // Platform controllers list
  // IMPORTANT: Only platform-agnostic controllers belong here
  const controllers = [
    HealthController,
    // TODO: Add platform modules as they are migrated:
    // AuthController,
    // TenantController,
    // UserController,
    // AuditController,
    // NotificationsController,
    // SaasController,
    // StorageController,
    // TranslationsController,
  ];

  // Create Fastify app with controllers
  const app = await createFastifyApp(controllers, {
    adapters,
    onError: async (info) => {
      // Error audit logging
      adapters.log.error('API Error', {
        errorType: info.errorType,
        errorMessage: info.errorMessage,
        statusCode: info.statusCode,
        method: info.method,
        url: info.url,
        correlationId: info.correlationId,
        userId: info.userId,
        tenantId: info.tenantId,
      });
    },
  });
  console.log('REST routes registered');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  const port = parseInt(process.env.PLATFORM_API_PORT || process.env.PORT || '4001');
  const host = process.env.HOST || '0.0.0.0';

  await app.listen({ port, host });

  console.log('\n' + '='.repeat(50));
  console.log(`Platform API running on http://${host}:${port}`);
  console.log('='.repeat(50));
  console.log('\nEndpoints:');
  console.log(`  Health:     GET  http://localhost:${port}/health`);
  console.log(`  Liveness:   GET  http://localhost:${port}/health/live`);
  console.log(`  Readiness:  GET  http://localhost:${port}/health/ready`);
  console.log(`  API Docs:   GET  http://localhost:${port}/docs`);
  console.log('');
  console.log('NOTE: This is a platform-only API.');
  console.log('      Domain-specific endpoints are in apps/api (port 4000).');
  console.log('');
}

bootstrap().catch((error) => {
  console.error('Failed to start Platform API:', error);
  process.exit(1);
});
