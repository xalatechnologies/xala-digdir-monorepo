/**
 * Unified API - Main Entry Point
 * Enterprise-grade modular API with repository pattern, Zod validation, and GraphQL
 */
import 'reflect-metadata';
import mercurius from 'mercurius';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { container } from './core/container';
import { moduleLoader } from './core/module';
import { createFastifyApp } from './adapters/fastify.adapter';
import { typeDefs, createResolvers, createGraphQLContext } from './graphql/schema';
import * as schema from './database/schema/index';
import { logger } from './core/logger';

// Import modules
import { TenantModule, TenantController, TenantService, TenantRepository } from './modules/tenant';
import { ListingModule, ListingController, ListingService, ListingRepository } from './modules/listing';
import { BookingModule, BookingController, BookingService, BookingRepository } from './modules/booking';
import { UserModule, UserController, UserService, UserRepository } from './modules/user';
import { MonitoringModule, MonitoringController, MonitoringService, AuditLogRepository, AlertRepository, IncidentRepository } from './modules/monitoring';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { CalendarController } from './modules/calendar/calendar.controller';
import { SeasonalLeaseController } from './modules/seasonal-lease/seasonal-lease.controller';
import { MessagesController } from './modules/messages/messages.controller';
import { ReportsController } from './modules/reports/reports.controller';
import { OrganizationsController } from './modules/organizations/organizations.controller';
import { ConversationsController } from './modules/conversations/conversations.controller';
import { AllocationsController } from './modules/allocations/allocations.controller';
import { AvailabilityController } from './modules/availability/availability.controller';
// Phase 2: Auth, RBAC, Public, Audit, Settings
import { AuthController } from './modules/auth/auth.controller';
import { AuthzController } from './modules/authz/authz.controller';
import { PublicController } from './modules/public/public.controller';
import { AuditController } from './modules/audit/audit.controller';
import { SettingsController } from './modules/settings/settings.controller';
import { DiscountCodesController } from './modules/discount-codes/discount-codes.controller';
import { HealthController } from './modules/health/health.controller';
import { CategoriesController } from './modules/listing/listing.controller';
// Phase 3: Integrations, Widgets, Share
import { IntegrationsController } from './modules/integrations/integrations.controller';
import { WidgetsController } from './modules/widgets/widgets.controller';
import { ShareController } from './modules/share/share.controller';
import { HelpController } from './modules/help/help.controller';
import { SignicatAuthController } from './modules/auth/signicat.controller';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { registerWebSocketRoutes } from './modules/websocket/websocket.controller';
// Phase 4: Pricing, User Groups, Backoffice
import { PricingController } from './modules/pricing/pricing.controller';
import { UserGroupController } from './modules/user-groups/user-group.controller';
import { BackofficeUserGroupsController, BackofficePriceRulesController, BackofficeListingsController } from './modules/backoffice/backoffice.controller';
// Phase 5: Search, Seasons, Blocks
import { SearchController } from './modules/search/search.controller';
import { SeasonsController } from './modules/seasons/seasons.controller';
import { BlocksController } from './modules/blocks/blocks.controller';
// Phase 6: Profile
import { ProfileController } from './modules/profile/profile.controller';
// Phase 7: Reviews
import { ReviewsController, ListingReviewsController } from './modules/reviews/reviews.controller';

/**
 * Initialize SDK adapters (mock for demo)
 */
async function initializeAdapters() {
  // In production, use: import { initializeAdapters } from '@xalatechnologies/platform';
  return {
    log: {
      info: (msg: string, meta?: object) => logger.info(meta || {}, msg),
      warn: (msg: string, meta?: object) => logger.warn(meta || {}, msg),
      error: (msg: string, meta?: object) => logger.error(meta || {}, msg),
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
        logger.info({ to: options.to, subject: options.subject }, '[EMAIL] Email sent');
      },
    },
  };
}

/**
 * Bootstrap the application
 */
async function bootstrap() {
  logger.info('🚀 Starting Unified API...\n');

  // Initialize platform adapters
  const adapters = await initializeAdapters();
  logger.info('✓ Adapters initialized');

  // Register adapters in container
  container.registerValue('Adapters', adapters);

  // Connect to PostgreSQL database (required in production)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error('❌ DATABASE_URL environment variable is required');
    logger.error('   Set DATABASE_URL to connect to your PostgreSQL database');
    process.exit(1);
  }

  // PostgreSQL connection
  const sql = postgres(databaseUrl, { max: 10 });
  const db = drizzle(sql, { schema });
  logger.info('✓ PostgreSQL database connected');
  container.registerValue('Database', db);

  // Register repositories
  container.registerFactory('TenantRepository', () => new TenantRepository(db));
  container.registerFactory('ListingRepository', () => new ListingRepository(db));
  container.registerFactory('BookingRepository', () => new BookingRepository(db));
  container.registerFactory('UserRepository', () => new UserRepository(db));
  container.registerFactory('AuditLogRepository', () => new AuditLogRepository(db));
  container.registerFactory('AlertRepository', () => new AlertRepository(db));
  container.registerFactory('IncidentRepository', () => new IncidentRepository(db));

  // Register services
  container.registerFactory('TenantService', () => 
    new TenantService(container.resolve('TenantRepository'), adapters)
  );
  container.registerFactory('ListingService', () => 
    new ListingService(container.resolve('ListingRepository'), adapters)
  );
  container.registerFactory('BookingService', () => 
    new BookingService(container.resolve('BookingRepository'), adapters)
  );
  container.registerFactory('UserService', () => 
    new UserService(container.resolve('UserRepository'), adapters)
  );
  container.registerFactory('MonitoringService', () => 
    new MonitoringService(
      container.resolve('AuditLogRepository'),
      container.resolve('AlertRepository'),
      container.resolve('IncidentRepository'),
      adapters
    )
  );

  logger.info('✓ Services registered');

  // Register controllers with their dependencies
  container.registerFactory('TenantController', () => 
    new TenantController(container.resolve('TenantService'))
  );
  container.registerFactory('ListingController', () => 
    new ListingController(container.resolve('ListingService'))
  );
  container.registerFactory('BookingController', () => 
    new BookingController(container.resolve('BookingService'))
  );
  container.registerFactory('UserController', () => 
    new UserController(container.resolve('UserService'))
  );
  container.registerFactory('MonitoringController', () => 
    new MonitoringController(container.resolve('MonitoringService'))
  );
  // Signicat auth controller (no dependencies)
  container.registerFactory('SignicatAuthController', () => 
    new SignicatAuthController()
  );
  // Notifications controller (no dependencies)
  container.registerFactory('NotificationsController', () =>
    new NotificationsController()
  );
  logger.info('✓ Controllers registered');

  // Load modules
  await moduleLoader.load(TenantModule);
  await moduleLoader.load(ListingModule);
  await moduleLoader.load(BookingModule);
  await moduleLoader.load(UserModule);
  await moduleLoader.load(MonitoringModule);
  logger.info('✓ Modules loaded');

  // Get controllers (core + backoffice modules)
  const controllers = [
    TenantController, 
    ListingController, 
    BookingController, 
    UserController, 
    MonitoringController,
    // Backoffice modules
    DashboardController,
    CalendarController,
    SeasonalLeaseController,
    MessagesController,
    ReportsController,
    OrganizationsController,
    ConversationsController,
    AllocationsController,
    AvailabilityController,
    // Phase 2: Auth, RBAC, Public, Audit, Settings
    AuthController,
    AuthzController,
    PublicController,
    AuditController,
    SettingsController,
    HelpController,
    DiscountCodesController,
    HealthController,
    CategoriesController,
    // Phase 3: Integrations, Widgets, Share
    IntegrationsController,
    WidgetsController,
    ShareController,
    // Signicat eID Hub authentication
    SignicatAuthController,
    // Notifications
    NotificationsController,
    // Phase 4: Pricing, User Groups, Backoffice
    PricingController,
    UserGroupController,
    BackofficeUserGroupsController,
    BackofficePriceRulesController,
    BackofficeListingsController,
    // Phase 5: Search, Seasons, Blocks
    SearchController,
    SeasonsController,
    BlocksController,
    // Phase 6: Profile
    ProfileController,
    // Phase 7: Reviews
    ReviewsController,
  ];

  // Create Fastify app with controllers
  const app = await createFastifyApp(controllers, { adapters });
  logger.info('✓ REST routes registered');

  // Register WebSocket routes for real-time events
  await registerWebSocketRoutes(app);
  logger.info('✓ WebSocket routes registered');

  // Register GraphQL (Mercurius)
  await app.register(mercurius, {
    schema: typeDefs,
    resolvers: createResolvers(container) as any,
    context: (request: any) => createGraphQLContext(request),
    graphiql: true, // Enable GraphiQL playground
    path: '/graphql',
  });
  logger.info('✓ GraphQL endpoint registered at /graphql');

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('\n👋 Shutting down gracefully...');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start server
  const port = parseInt(process.env.PORT || '4000');
  const host = process.env.HOST || '0.0.0.0';

  await app.listen({ port, host });

  logger.info('\n' + '='.repeat(50));
  logger.info(`🎉 Unified API running on http://${host}:${port}`);
  logger.info('='.repeat(50));
  logger.info('\nEndpoints:');
  logger.info(`  Health:   GET  http://localhost:${port}/health`);
  logger.info(`  GraphQL:  POST http://localhost:${port}/graphql`);
  logger.info(`  Tenants:  GET  http://localhost:${port}/api/tenants`);
  logger.info(`  Listings: GET  http://localhost:${port}/api/listings`);
  logger.info(`  Bookings: GET  http://localhost:${port}/api/bookings`);
  logger.info(`  Audit:    GET  http://localhost:${port}/api/audit`);
  logger.info(`  WebSocket:     ws://localhost:${port}/ws/audit`);
  logger.info('');
}

bootstrap().catch((error) => {
  logger.error({ error }, '❌ Failed to start server');
  process.exit(1);
});
