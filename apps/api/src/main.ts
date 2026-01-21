/**
 * Domain API - Main Entry Point
 * Domain-specific API server for Digilist rental booking
 *
 * IMPORTANT: This API is DOMAIN-ONLY
 * - Platform modules (auth, tenant, user, etc.) are in platform-api (port 4001)
 * - This API handles: rental-objects, bookings, calendar, seasons, etc.
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from monorepo root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../../.env') });

import mercurius from 'mercurius';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { container } from './core/container';
import { moduleLoader } from './core/module';
import { createFastifyApp } from './adapters/fastify.adapter';
import { typeDefs, createResolvers, createGraphQLContext } from './graphql/schema';
import * as schema from './database/schema/index';

// Import JWT service (shared with platform API)
import { JwtService } from './core/auth/jwt.service';

// ============================================================================
// DOMAIN MODULES ONLY
// ============================================================================

// Rental Objects
import { RentalObjectModule, RentalObjectController, RentalObjectService, RentalObjectRepository } from './modules/rental-objects';
import { CategoriesController } from './modules/rental-objects/rental-object.controller';

// Bookings
import { BookingModule, BookingController, BookingService, BookingRepository } from './modules/booking';

// Calendar & Availability
import { CalendarController } from './modules/calendar/calendar.controller';
import { CalendarService } from './modules/calendar/calendar.service';
import { AvailabilityController } from './modules/availability/availability.controller';
import { BlocksController } from './modules/blocks/blocks.controller';

// Seasons & Leases
import { SeasonsController } from './modules/seasons/seasons.controller';
import { SeasonalLeaseController } from './modules/seasonal-lease/seasonal-lease.controller';

// Custody
import { CustodyModule, CustodyController, CustodyService, CustodyEvaluator } from './modules/custody';

// Search & Discovery
import { SearchController } from './modules/search/search.controller';
import { ReviewsController } from './modules/reviews/reviews.controller';
import { PublicController } from './modules/public/public.controller';

// Pricing & Discounts
import { PricingController } from './modules/pricing/pricing.controller';
import { DiscountCodesController } from './modules/discount-codes/discount-codes.controller';

// Conversations & Messages
import { ConversationsController } from './modules/conversations/conversations.controller';
import { MessagesController } from './modules/messages/messages.controller';

// Dashboard & Reports
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { ReportsController } from './modules/reports/reports.controller';

// Allocations
import { AllocationsController } from './modules/allocations/allocations.controller';

// Backoffice Domain Controllers
import { BackofficeUserGroupsController, BackofficePriceRulesController, BackofficeRentalObjectsController } from './modules/backoffice/backoffice.controller';

// Profile & Favorites
import { ProfileController } from './modules/profile/profile.controller';
import { favoritesRoutes } from './modules/favorites/favorites.routes';

// Amenities & Addons
import { amenitiesRoutes } from './modules/amenities/amenities.routes';
import { addonsRoutes } from './modules/addons/addons.routes';

// Help, Share, Widgets
import { HelpController } from './modules/help/help.controller';
import { ShareController } from './modules/share/share.controller';
import { WidgetsController } from './modules/widgets/widgets.controller';

// Domain-specific routes
import scannerRoutes from './routes/scanners.routes';
import { i18nRoutes } from './routes/i18n.routes';
import { navigationRoutes } from './routes/navigation.routes';

/**
 * Initialize SDK adapters (mock for demo)
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
    email: {
      send: async (options: { to: string; subject: string; html: string }): Promise<void> => {
        console.log(`[EMAIL] To: ${options.to}, Subject: ${options.subject}`);
      },
    },
  };
}

/**
 * Bootstrap the domain API
 */
async function bootstrap() {
  console.log('Starting Domain API...\n');

  // Initialize platform adapters
  const adapters = await initializeAdapters();
  console.log('Adapters initialized');

  // Register adapters in container
  container.registerValue('Adapters', adapters);

  // Connect to PostgreSQL database
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 10 });
  const db = drizzle(sql, { schema });
  console.log('PostgreSQL database connected');
  container.registerValue('Database', db);

  // Validate JWT secret (for validating tokens from platform API)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET environment variable is required');
    process.exit(1);
  }

  // Register JWT service (for token validation)
  container.registerFactory('JwtService', () => new JwtService(jwtSecret));
  console.log('JWT service registered');

  // ============================================================================
  // DOMAIN REPOSITORIES
  // ============================================================================
  container.registerFactory('RentalObjectRepository', () => new RentalObjectRepository(db));
  container.registerFactory('BookingRepository', () => new BookingRepository(db));

  // ============================================================================
  // DOMAIN SERVICES
  // ============================================================================
  container.registerFactory('RentalObjectService', () =>
    new RentalObjectService(container.resolve('RentalObjectRepository'), adapters)
  );
  container.registerFactory('BookingService', () =>
    new BookingService(
      container.resolve('BookingRepository'),
      container.resolve('RentalObjectRepository'),
      adapters
    )
  );
  container.registerFactory('CustodyService', () => new CustodyService(db, adapters));
  container.registerFactory('CustodyEvaluator', () => new CustodyEvaluator(db));
  container.registerFactory('CalendarService', () => new CalendarService(adapters));

  console.log('Domain services registered');

  // ============================================================================
  // DOMAIN CONTROLLERS
  // ============================================================================
  container.registerFactory('RentalObjectController', () =>
    new RentalObjectController(container.resolve('RentalObjectService'))
  );
  container.registerFactory('BookingController', () =>
    new BookingController(container.resolve('BookingService'))
  );
  container.registerFactory('CustodyController', () =>
    new CustodyController(container.resolve('CustodyService'))
  );
  container.registerFactory('AvailabilityController', () =>
    new AvailabilityController(container.resolve('CalendarService'))
  );

  console.log('Domain controllers registered');

  // Load domain modules
  await moduleLoader.load(RentalObjectModule);
  await moduleLoader.load(BookingModule);
  await moduleLoader.load(CustodyModule);
  console.log('Domain modules loaded');

  // Domain controllers list
  const controllers = [
    // Rental Objects
    RentalObjectController,
    CategoriesController,
    // Bookings
    BookingController,
    // Calendar & Availability
    CalendarController,
    AvailabilityController,
    BlocksController,
    // Seasons & Leases
    SeasonsController,
    SeasonalLeaseController,
    // Custody
    CustodyController,
    // Search & Discovery
    SearchController,
    ReviewsController,
    PublicController,
    // Pricing & Discounts
    PricingController,
    DiscountCodesController,
    // Conversations & Messages
    ConversationsController,
    MessagesController,
    // Dashboard & Reports
    DashboardController,
    ReportsController,
    // Allocations
    AllocationsController,
    // Backoffice Domain
    BackofficeUserGroupsController,
    BackofficePriceRulesController,
    BackofficeRentalObjectsController,
    // Profile
    ProfileController,
    // Help, Share, Widgets
    HelpController,
    ShareController,
    WidgetsController,
  ];

  // Create Fastify app with controllers
  const app = await createFastifyApp(controllers, {
    adapters,
    onError: async (info) => {
      // Log errors (audit logging is in platform API)
      adapters.log.error('API Error', {
        errorType: info.errorType,
        errorMessage: info.errorMessage,
        statusCode: info.statusCode,
        method: info.method,
        url: info.url,
        correlationId: info.correlationId,
      });
    },
  });
  console.log('REST routes registered');

  // Register Fastify plugin routes
  await app.register(amenitiesRoutes, { prefix: '/api' });
  await app.register(addonsRoutes, { prefix: '/api' });
  await app.register(favoritesRoutes, { prefix: '/api' });
  await app.register(i18nRoutes, { prefix: '/api' });
  await app.register(navigationRoutes, { prefix: '/api' });
  await app.register(scannerRoutes);
  console.log('Fastify plugin routes registered');

  // Register GraphQL (Mercurius)
  await app.register(mercurius, {
    schema: typeDefs,
    resolvers: createResolvers(container) as any,
    context: (request: any) => createGraphQLContext(request),
    graphiql: true,
    path: '/graphql',
  });
  console.log('GraphQL endpoint registered at /graphql');

  // Health check endpoint (domain API)
  app.get('/health', async () => ({
    status: 'ok',
    service: 'domain-api',
    timestamp: new Date().toISOString(),
  }));

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  const port = parseInt(process.env.PORT || '4000');
  const host = process.env.HOST || '0.0.0.0';

  await app.listen({ port, host });

  console.log('\n' + '='.repeat(50));
  console.log(`Domain API running on http://${host}:${port}`);
  console.log('='.repeat(50));
  console.log('\nEndpoints:');
  console.log(`  Health:         GET  http://localhost:${port}/health`);
  console.log(`  GraphQL:        POST http://localhost:${port}/graphql`);
  console.log(`  Rental Objects: GET  http://localhost:${port}/api/rental-objects`);
  console.log(`  Bookings:       GET  http://localhost:${port}/api/bookings`);
  console.log(`  Calendar:       GET  http://localhost:${port}/api/calendar`);
  console.log(`  Seasons:        GET  http://localhost:${port}/api/seasons`);
  console.log('');
  console.log('NOTE: This is a domain-only API.');
  console.log('      Platform endpoints (auth, user, tenant) are in platform-api (port 4001).');
  console.log('');
}

bootstrap().catch((error) => {
  console.error('Failed to start Domain API:', error);
  process.exit(1);
});
