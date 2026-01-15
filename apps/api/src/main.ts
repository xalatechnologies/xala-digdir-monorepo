/**
 * Unified API - Main Entry Point
 * Enterprise-grade modular API with repository pattern, Zod validation, and GraphQL
 */

// Load environment variables from monorepo root .env file
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

// ES module compatibility: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load .env from current directory first (production), then from monorepo root (development)
const envPathProduction = resolve(__dirname, '.env');
const envPathDevelopment = resolve(__dirname, '../../../.env');
const envPath = existsSync(envPathProduction) ? envPathProduction : envPathDevelopment;

config({ path: envPath });

import 'reflect-metadata';
import mercurius from 'mercurius';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { container } from './core/container';
import { moduleLoader } from './core/module';
import { createFastifyApp } from './adapters/fastify.adapter';
import { typeDefs, createResolvers, createGraphQLContext } from './graphql/schema';
import * as schema from './database/schema/index';

// Import modules
import { TenantModule, TenantController, TenantService, TenantRepository } from './modules/tenant';
import { RentalObjectModule as ListingModule, RentalObjectController as ListingController, RentalObjectService as ListingService, RentalObjectRepository as ListingRepository } from './modules/rental-objects';
import { BookingModule, BookingController, BookingService, BookingRepository } from './modules/booking';
import { UserModule, UserController, UserService, UserRepository } from './modules/user';
import { MonitoringModule, MonitoringController, MonitoringService, AuditLogRepository, AlertRepository, IncidentRepository } from './modules/monitoring';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import { CalendarModule, CalendarController, ListingCalendarConfigController, AvailabilityMatrixController, CalendarService } from './modules/calendar';
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
import { 
  CategoriesController, 
  TimeModesController,
  PricingUnitsController,
  StatusesController,
  SystemConfigController,
  SchemaController,
  IntegrationsConfigController,
} from './modules/configuration/configuration.controller';
import { ConfigurationRepository } from './modules/configuration/configuration.repository';
import { ConfigurationService } from './modules/configuration/configuration.service';
// Phase 3: Integrations, Widgets, Share
import { IntegrationsController } from './modules/integrations/integrations.controller';
import { WidgetsController } from './modules/widgets/widgets.controller';
import { ShareController } from './modules/share/share.controller';
import { HelpController } from './modules/help/help.controller';
import { IdPortenAuthController } from './modules/auth/idporten.controller';
import { IdPortenOIDCAuthController } from './modules/auth/idporten-oidc.controller';
import { NotificationsController } from './modules/notifications/notifications.controller';
import { PushNotificationsController, PushNotificationsService, PushNotificationsRepository } from './modules/push-notifications';
import {
  NotificationSystemController,
  NotificationService,
  NotificationRepository,
} from './modules/notification-system';
import { registerWebSocketRoutes, getNotificationBroadcastFunction } from './modules/websocket/websocket.controller';
// Phase 4: Pricing, User Groups, Backoffice
import { PricingController } from './modules/pricing/pricing.controller';
import { UserGroupController } from './modules/user-groups/user-group.controller';
import { BackofficeUserGroupsController, BackofficePriceRulesController, BackofficeListingsController } from './modules/backoffice/backoffice.controller';
// Phase 5: Search, Seasons, Blocks
import { SearchController } from './modules/search/search.controller';
import { SeasonsController, PriorityRulesController } from './modules/seasons/seasons.controller';
import { BlocksController } from './modules/blocks/blocks.controller';
import { SeasonApplicationsController } from './modules/season-applications/season-applications.controller';
// Phase 6: Profile
import { ProfileController } from './modules/profile/profile.controller';
// Phase 7: Reviews
import { ReviewsController, ListingReviewsController } from './modules/reviews/reviews.controller';
// Phase 8: Vipps Webhooks
import { VippsWebhookController } from './modules/webhooks/vipps-webhook.controller';
// Phase 9: GDPR Consent
import { GdprController, GdprService, GdprRepository } from './modules/gdpr';

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
    new BookingService(container.resolve('BookingRepository'), container.resolve('ListingRepository'), adapters)
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
  container.registerFactory('CalendarService', () =>
    new CalendarService(adapters)
  );
  
  // Configuration module (schema-driven settings)
  container.registerFactory('ConfigurationRepository', () => new ConfigurationRepository(db));
  container.registerFactory('ConfigurationService', () =>
    new ConfigurationService(container.resolve('ConfigurationRepository'))
  );

  console.log('✓ Services registered');

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
  // ID-porten auth controllers via Signicat (no dependencies)
  container.registerFactory('IdPortenAuthController', () =>
    new IdPortenAuthController()
  );
  container.registerFactory('IdPortenOIDCAuthController', () =>
    new IdPortenOIDCAuthController()
  );
  // Notifications controller (no dependencies)
  container.registerFactory('NotificationsController', () => 
    new NotificationsController()
  );
  
  // Push Notifications (preferences, subscriptions)
  container.registerFactory('PushNotificationsRepository', () =>
    new PushNotificationsRepository(db)
  );
  container.registerFactory('PushNotificationsService', () =>
    new PushNotificationsService(container.resolve('PushNotificationsRepository'))
  );
  container.registerFactory('PushNotificationsController', () =>
    new PushNotificationsController(container.resolve('PushNotificationsService'))
  );
  
  // Notification System (full notification system with templates, channels, delivery)
  container.registerFactory('NotificationRepository', () =>
    new NotificationRepository(db)
  );
  container.registerFactory('NotificationService', () =>
    new NotificationService(
      container.resolve('NotificationRepository'),
      container.resolve('PushNotificationsRepository')
    )
  );
  container.registerFactory('NotificationSystemController', () =>
    new NotificationSystemController(container.resolve('NotificationService'))
  );
  
  // GDPR Consent (consent management, data subject requests)
  container.registerFactory('GdprRepository', () =>
    new GdprRepository(db)
  );
  container.registerFactory('GdprService', () =>
    new GdprService(container.resolve('GdprRepository'))
  );
  container.registerFactory('GdprController', () =>
    new GdprController(container.resolve('GdprService'))
  );
  console.log('✓ Controllers registered');

  // Load modules
  await moduleLoader.load(TenantModule);
  await moduleLoader.load(ListingModule);
  await moduleLoader.load(BookingModule);
  await moduleLoader.load(UserModule);
  await moduleLoader.load(MonitoringModule);
  await moduleLoader.load(CalendarModule);
  console.log('✓ Modules loaded');

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
    ListingCalendarConfigController,
    // Note: AvailabilityMatrixController removed - functionality covered by AvailabilityController
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
    // Configuration module (schema-driven categories, time modes, pricing units, etc.)
    CategoriesController,
    TimeModesController,
    PricingUnitsController,
    StatusesController,
    SystemConfigController,
    SchemaController,
    IntegrationsConfigController,
    // Phase 3: Integrations, Widgets, Share
    IntegrationsController,
    WidgetsController,
    ShareController,
    // ID-porten (BankID) via Signicat authentication
    IdPortenAuthController,
    IdPortenOIDCAuthController,
    // Notifications
    NotificationsController,
    PushNotificationsController,
    // Phase 4: Pricing, User Groups, Backoffice
    PricingController,
    UserGroupController,
    BackofficeUserGroupsController,
    BackofficePriceRulesController,
    BackofficeListingsController,
    // Phase 5: Search, Seasons, Blocks
    SearchController,
    SeasonsController,
    PriorityRulesController,
    BlocksController,
    SeasonApplicationsController,
    // Phase 6: Profile
    ProfileController,
    // Phase 7: Reviews
    ReviewsController,
    // Phase 8: Vipps Webhooks
    VippsWebhookController,
    // Phase 9: GDPR Consent
    GdprController,
  ];

  // Create Fastify app with controllers
  const app = await createFastifyApp(controllers, { adapters });
  console.log('✓ REST routes registered');

  // Register Notification System routes (custom registration)
  const notificationSystemController = container.resolve('NotificationSystemController') as NotificationSystemController;
  notificationSystemController.registerRoutes(app);
  console.log('✓ Notification system routes registered');

  // Register WebSocket routes for real-time events
  await registerWebSocketRoutes(app);
  console.log('✓ WebSocket routes registered');

  // Wire up WebSocket broadcast to notification service for real-time delivery
  const notificationService = container.resolve('NotificationService') as NotificationService;
  notificationService.setWebSocketBroadcast(getNotificationBroadcastFunction());
  console.log('✓ Notification WebSocket broadcast connected');

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
  console.log(`  Listings: GET  http://localhost:${port}/api/listings`);
  console.log(`  Bookings: GET  http://localhost:${port}/api/bookings`);
  console.log(`  Audit:    GET  http://localhost:${port}/api/audit`);
  console.log(`  WebSocket:     ws://localhost:${port}/ws/audit`);
  console.log('');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
