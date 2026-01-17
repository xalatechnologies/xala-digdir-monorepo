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

// Import JWT service
import { JwtService } from './core/auth/jwt.service';

// Import modules
import { TenantModule, TenantController, TenantService, TenantRepository } from './modules/tenant';
import { RentalObjectModule, RentalObjectController, RentalObjectService, RentalObjectRepository } from './modules/rental-objects';
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
import { AuthzController, MeController } from './modules/authz/authz.controller';
import { PublicController } from './modules/public/public.controller';
import { AuditController } from './modules/audit/audit.controller';
import { SettingsController } from './modules/settings/settings.controller';
import { DiscountCodesController } from './modules/discount-codes/discount-codes.controller';
import { HealthController } from './modules/health/health.controller';
import { CategoriesController } from './modules/rental-objects/rental-object.controller';
// RBAC Controllers (Access Grants, Permissions, Case Handler Scopes)
import { AccessGrantController } from './modules/access-grant/access-grant.controller';
import { PermissionAssignmentController } from './modules/permission-assignment/permission-assignment.controller';
import { CaseHandlerScopeController } from './modules/case-handler-scope/case-handler-scope.controller';
// Phase 3: Integrations, Widgets, Share
import { IntegrationsController } from './modules/integrations/integrations.controller';
import { WidgetsController } from './modules/widgets/widgets.controller';
import { ShareController } from './modules/share/share.controller';
import { HelpController } from './modules/help/help.controller';
import { IdPortenAuthController } from './modules/auth/idporten.controller';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { registerWebSocketRoutes } from './modules/websocket/websocket.controller';
// Phase 4: Pricing, User Groups, Backoffice
import { PricingController } from './modules/pricing/pricing.controller';
import { UserGroupController } from './modules/user-groups/user-group.controller';
import { BackofficeUserGroupsController, BackofficePriceRulesController, BackofficeRentalObjectsController } from './modules/backoffice/backoffice.controller';
// Phase 5: Search, Seasons, Blocks
import { SearchController } from './modules/search/search.controller';
import { SeasonsController } from './modules/seasons/seasons.controller';
import { BlocksController } from './modules/blocks/blocks.controller';
// Phase 6: Profile
import { ProfileController } from './modules/profile/profile.controller';
// Phase 7: Reviews
import { ReviewsController } from './modules/reviews/reviews.controller';
// Phase 8: SaaS Admin & Tenant Admin
import { SaasController } from './modules/saas';
import { TenantAdminController } from './modules/tenant-admin';
// Feature Flags
import { featuresRoutes } from './routes/features.routes';
// Storage
import { StorageController } from './modules/storage/storage.controller';
import { StorageService } from './modules/storage/storage.service';

/**
 * Initialize SDK adapters (mock for demo)
 */
async function initializeAdapters() {
  // In production, use: import { initializeAdapters } from '@xalatechnologies/platform';
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
 * Bootstrap the application
 */
async function bootstrap() {
  console.log('🚀 Starting Unified API...\n');

  // Initialize platform adapters
  const adapters = await initializeAdapters();
  console.log('✓ Adapters initialized');

  // Register adapters in container
  container.registerValue('Adapters', adapters);

  // Connect to PostgreSQL database (required in production)
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    console.error('   Set DATABASE_URL to connect to your PostgreSQL database');
    process.exit(1);
  }

  // PostgreSQL connection
  const sql = postgres(databaseUrl, { max: 10 });
  const db = drizzle(sql, { schema });
  console.log('✓ PostgreSQL database connected');
  container.registerValue('Database', db);

  // Validate JWT secret (required for authentication)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('❌ JWT_SECRET environment variable is required');
    console.error('   Set JWT_SECRET to a secure random string (at least 32 characters)');
    process.exit(1);
  }

  // Register JWT service
  container.registerFactory('JwtService', () => new JwtService(jwtSecret));
  console.log('✓ JWT service registered');

  // Register repositories
  container.registerFactory('TenantRepository', () => new TenantRepository(db));
  container.registerFactory('RentalObjectRepository', () => new RentalObjectRepository(db));
  container.registerFactory('BookingRepository', () => new BookingRepository(db));
  container.registerFactory('UserRepository', () => new UserRepository(db));
  container.registerFactory('AuditLogRepository', () => new AuditLogRepository(db));
  container.registerFactory('AlertRepository', () => new AlertRepository(db));
  container.registerFactory('IncidentRepository', () => new IncidentRepository(db));

  // Register services
  container.registerFactory('TenantService', () => 
    new TenantService(container.resolve('TenantRepository'), adapters)
  );
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

  // TODO: Notification service (requires notifications and deliveryAttempts tables in schema)
  // const { NotificationService } = await import('./modules/notifications/notification.service');
  // const { NotificationRepository } = await import('./modules/notifications/notification.repository');
  // const { DeduplicationService } = await import('./modules/notifications/deduplication.service');
  // const { DeliveryService } = await import('./modules/notifications/delivery.service');

  // container.registerFactory('NotificationRepository', () => new NotificationRepository(db));
  // container.registerFactory('DeduplicationService', () => new DeduplicationService(container.resolve('NotificationRepository'), adapters));
  // container.registerFactory('DeliveryService', () => new DeliveryService(container.resolve('NotificationRepository'), adapters));
  // container.registerFactory('NotificationService', () =>
  //   new NotificationService(
  //     container.resolve('NotificationRepository'),
  //     container.resolve('DeduplicationService'),
  //     container.resolve('DeliveryService'),
  //     adapters
  //   )
  // );

  console.log('✓ Services registered');

  // Register controllers with their dependencies
  container.registerFactory('TenantController', () => 
    new TenantController(container.resolve('TenantService'))
  );
  container.registerFactory('RentalObjectController', () => 
    new RentalObjectController(container.resolve('RentalObjectService'))
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
  // TODO: Notifications controller (disabled until NotificationService is ready)
  // container.registerFactory('NotificationsController', () =>
  //   new NotificationsController(container.resolve('NotificationService'))
  // );
  console.log('✓ Controllers registered');

  // Load modules
  await moduleLoader.load(TenantModule);
  await moduleLoader.load(RentalObjectModule);
  await moduleLoader.load(BookingModule);
  await moduleLoader.load(UserModule);
  await moduleLoader.load(MonitoringModule);
  console.log('✓ Modules loaded');

  // Get controllers (core + backoffice modules)
  const controllers = [
    TenantController, 
    RentalObjectController, 
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
    MeController,
    PublicController,
    AuditController,
    SettingsController,
    HelpController,
    DiscountCodesController,
    HealthController,
    CategoriesController,
    // RBAC Controllers
    AccessGrantController,
    PermissionAssignmentController,
    CaseHandlerScopeController,
    // Phase 3: Integrations, Widgets, Share
    IntegrationsController,
    WidgetsController,
    ShareController,
    // BankID / ID-porten authentication (REST API)
    IdPortenAuthController,
    // TODO: Notifications (disabled until schema tables are added)
    // NotificationsController,
    // Phase 4: Pricing, User Groups, Backoffice
    PricingController,
    UserGroupController,
    BackofficeUserGroupsController,
    BackofficePriceRulesController,
    BackofficeRentalObjectsController,
    // Phase 5: Search, Seasons, Blocks
    SearchController,
    SeasonsController,
    BlocksController,
    // Phase 6: Profile
    ProfileController,
    // Phase 7: Reviews
    ReviewsController,
    // Phase 8: SaaS Admin & Tenant Admin
    SaasController,
    TenantAdminController,
    // Storage
    StorageController,
  ];

  // Create Fastify app with controllers
  const app = await createFastifyApp(controllers, { adapters });
  console.log('✓ REST routes registered');

  // Register WebSocket routes for real-time events
  await registerWebSocketRoutes(app);
  console.log('✓ WebSocket routes registered');

  // Register GraphQL (Mercurius)
  await app.register(mercurius, {
    schema: typeDefs,
    resolvers: createResolvers(container) as any,
    context: (request: any) => createGraphQLContext(request),
    graphiql: true, // Enable GraphiQL playground
    path: '/graphql',
  });
  console.log('✓ GraphQL endpoint registered at /graphql');

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n👋 Shutting down gracefully...');
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
  console.log(`🎉 Unified API running on http://${host}:${port}`);
  console.log('='.repeat(50));
  console.log('\nEndpoints:');
  console.log(`  Health:   GET  http://localhost:${port}/health`);
  console.log(`  GraphQL:  POST http://localhost:${port}/graphql`);
  console.log(`  Tenants:  GET  http://localhost:${port}/api/tenants`);
  console.log(`  Rental Objects: GET  http://localhost:${port}/api/rental-objects`);
  console.log(`  Bookings: GET  http://localhost:${port}/api/bookings`);
  console.log(`  Audit:    GET  http://localhost:${port}/api/audit`);
  console.log(`  WebSocket:     ws://localhost:${port}/ws/audit`);
  console.log('');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
