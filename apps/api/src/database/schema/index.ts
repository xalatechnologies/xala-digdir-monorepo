/**
 * Drizzle ORM Database Schema
 * Consolidated from all existing APIs
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  decimal,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ============================================================================
// System Configuration Tables (Schema-Driven)
// All enums, categories, and configurable options are stored here
// ============================================================================

/**
 * Rental Object Categories
 * Main category types for rental objects (e.g., LOKALER_OG_BANER, UTSTYR_OG_INVENTAR)
 */
export const rentalObjectCategories = pgTable('rental_object_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  descriptionEn: text('description_en'),
  icon: varchar('icon', { length: 100 }),
  examples: jsonb('examples').default([]),
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('rental_object_categories_code_idx').on(table.code),
  enabledIdx: index('rental_object_categories_enabled_idx').on(table.enabled),
  sortOrderIdx: index('rental_object_categories_sort_idx').on(table.sortOrder),
}));

/**
 * Rental Object Subcategories
 * Subcategories linked to main categories
 */
export const rentalObjectSubcategories = pgTable('rental_object_subcategories', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => rentalObjectCategories.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('rental_object_subcategories_category_idx').on(table.categoryId),
  codeIdx: uniqueIndex('rental_object_subcategories_code_idx').on(table.categoryId, table.code),
  enabledIdx: index('rental_object_subcategories_enabled_idx').on(table.enabled),
}));

/**
 * Booking Time Modes
 * How bookings are made (PERIOD, SLOT, ALL_DAY)
 */
export const bookingTimeModes = pgTable('booking_time_modes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  descriptionEn: text('description_en'),
  calendarBehavior: varchar('calendar_behavior', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('booking_time_modes_code_idx').on(table.code),
  enabledIdx: index('booking_time_modes_enabled_idx').on(table.enabled),
}));

/**
 * Pricing Units
 * Units for pricing (hour, day, booking, week, month)
 */
export const pricingUnits = pgTable('pricing_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  durationMinutes: integer('duration_minutes'), // null for 'booking' type
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('pricing_units_code_idx').on(table.code),
  enabledIdx: index('pricing_units_enabled_idx').on(table.enabled),
}));

/**
 * Rental Object Statuses
 * Status values (draft, published, archived, etc.)
 */
export const rentalObjectStatuses = pgTable('rental_object_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  color: varchar('color', { length: 50 }), // For UI display
  allowedTransitions: jsonb('allowed_transitions').default([]), // Which statuses can transition to this
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('rental_object_statuses_code_idx').on(table.code),
  enabledIdx: index('rental_object_statuses_enabled_idx').on(table.enabled),
}));

/**
 * Booking Statuses
 * Status values for bookings (pending, confirmed, cancelled, etc.)
 */
export const bookingStatuses = pgTable('booking_statuses', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  description: text('description'),
  color: varchar('color', { length: 50 }),
  allowedTransitions: jsonb('allowed_transitions').default([]),
  isFinal: boolean('is_final').default(false), // No further transitions allowed
  sortOrder: integer('sort_order').notNull().default(0),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: uniqueIndex('booking_statuses_code_idx').on(table.code),
  enabledIdx: index('booking_statuses_enabled_idx').on(table.enabled),
}));

/**
 * System Configurations
 * Generic key-value configuration store for tenant-specific and global settings
 */
export const systemConfigurations = pgTable('system_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }), // null = global
  key: varchar('key', { length: 255 }).notNull(),
  value: jsonb('value').notNull(),
  valueType: varchar('value_type', { length: 50 }).notNull().default('string'), // string, number, boolean, json
  description: text('description'),
  isPublic: boolean('is_public').default(false), // Can be exposed to frontend
  isEditable: boolean('is_editable').default(true), // Can be modified via API
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantKeyIdx: uniqueIndex('system_configurations_tenant_key_idx').on(table.tenantId, table.key),
  publicIdx: index('system_configurations_public_idx').on(table.isPublic),
}));

// ============================================================================
// Tenants & Organizations
// ============================================================================

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('tenants_slug_idx').on(table.slug),
  statusIdx: index('tenants_status_idx').on(table.status),
}));

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('other'),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('orgs_tenant_idx').on(table.tenantId),
  slugIdx: index('orgs_slug_idx').on(table.tenantId, table.slug),
}));

// ============================================================================
// Users & RBAC
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nationalId: varchar('national_id', { length: 11 }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  tenantEmailIdx: index('users_tenant_email_idx').on(table.tenantId, table.email),
  tenantIdx: index('users_tenant_idx').on(table.tenantId),
  nationalIdIdx: index('users_national_id_idx').on(table.nationalId),
}));

// ============================================================================
// Subscriptions & Billing
// ============================================================================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }).unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('subscriptions_tenant_idx').on(table.tenantId),
}));

// ============================================================================
// Listings (Rental Objects / Utleieobjekter)
// ============================================================================

export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  
  // Category system (4 main categories)
  category: varchar('category', { length: 50 }).notNull().default('LOKALER_OG_BANER'),
  subcategory: varchar('subcategory', { length: 100 }),
  tags: jsonb('tags').default([]),
  
  // Booking configuration
  timeMode: varchar('time_mode', { length: 20 }).default('PERIOD'),
  bookingFeatures: jsonb('booking_features').default({}),
  
  // Common fields
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  description: text('description'),
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  capacity: integer('capacity'),
  fixedLocation: boolean('fixed_location').default(true),
  metadata: jsonb('metadata').default({}),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('listings_tenant_idx').on(table.tenantId),
  statusIdx: index('listings_status_idx').on(table.status),
  categoryIdx: index('listings_category_idx').on(table.category),
  subcategoryIdx: index('listings_subcategory_idx').on(table.subcategory),
  slugIdx: index('listings_slug_idx').on(table.tenantId, table.slug),
  timeModeIdx: index('listings_time_mode_idx').on(table.timeMode),
}));


// ============================================================================
// Bookings
// ============================================================================

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('bookings_tenant_idx').on(table.tenantId),
  listingIdx: index('bookings_listing_idx').on(table.listingId),
  userIdx: index('bookings_user_idx').on(table.userId),
  statusIdx: index('bookings_status_idx').on(table.status),
}));

// ============================================================================
// Monitoring & Alerts
// ============================================================================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }),
  severity: varchar('severity', { length: 20 }).notNull().default('info'),
  metadata: jsonb('metadata').default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('audit_logs_tenant_idx').on(table.tenantId, table.timestamp),
  resourceIdx: index('audit_logs_resource_idx').on(table.resource, table.resourceId),
}));

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('threshold'),
  condition: jsonb('condition').notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('warning'),
  enabled: boolean('enabled').default(true),
  channels: jsonb('channels').default([]),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertId: uuid('alert_id').references(() => alerts.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('open'),
  severity: varchar('severity', { length: 20 }).notNull().default('medium'),
  affectedServices: jsonb('affected_services').default([]),
  assignee: varchar('assignee', { length: 255 }),
  timeline: jsonb('timeline').default([]),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('incidents_status_idx').on(table.status),
  severityIdx: index('incidents_severity_idx').on(table.severity),
}));

// ============================================================================
// Usage Tracking
// ============================================================================

export const usage = pgTable('usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  metric: varchar('metric', { length: 100 }).notNull(),
  value: integer('value').notNull(),
  period: varchar('period', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  tenantMetricIdx: index('usage_tenant_metric_idx').on(table.tenantId, table.metric, table.timestamp),
}));

// ============================================================================
// Allocations (Calendar Events, Time Blocking)
// ============================================================================

export const allocations = pgTable('allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('confirmed'),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  recurring: jsonb('recurring').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('allocations_tenant_idx').on(table.tenantId),
  listingIdx: index('allocations_listing_idx').on(table.listingId),
  timeIdx: index('allocations_time_idx').on(table.startTime, table.endTime),
}));

// ============================================================================
// Seasons & Seasonal Leases
// ============================================================================

export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  applicationStartDate: timestamp('application_start_date').notNull(),
  applicationEndDate: timestamp('application_end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  description: text('description'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('seasons_tenant_idx').on(table.tenantId),
  statusIdx: index('seasons_status_idx').on(table.status),
  datesIdx: index('seasons_dates_idx').on(table.startDate, table.endDate),
}));

export const seasonApplications = pgTable('season_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  applicantName: varchar('applicant_name', { length: 255 }).notNull(),
  applicantEmail: varchar('applicant_email', { length: 255 }).notNull(),
  applicantPhone: varchar('applicant_phone', { length: 50 }),
  weekday: integer('weekday').notNull(),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: integer('priority'),
  notes: text('notes'),
  rejectionReason: text('rejection_reason'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('season_applications_tenant_idx').on(table.tenantId),
  seasonIdx: index('season_applications_season_idx').on(table.seasonId),
  listingIdx: index('season_applications_listing_idx').on(table.listingId),
  orgIdx: index('season_applications_org_idx').on(table.organizationId),
  statusIdx: index('season_applications_status_idx').on(table.status),
}));

export const seasonalLeases = pgTable('seasonal_leases', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  listingId: uuid('listing_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  weekdays: jsonb('weekdays').default([]),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('seasonal_leases_tenant_idx').on(table.tenantId),
  listingIdx: index('seasonal_leases_listing_idx').on(table.listingId),
  orgIdx: index('seasonal_leases_org_idx').on(table.organizationId),
}));

export const priorityRules = pgTable('priority_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id').references(() => seasons.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull().default('custom'),
  priority: integer('priority').notNull().default(0),
  conditions: jsonb('conditions').notNull(),
  enabled: boolean('enabled').default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('priority_rules_tenant_idx').on(table.tenantId),
  seasonIdx: index('priority_rules_season_idx').on(table.seasonId),
  typeIdx: index('priority_rules_type_idx').on(table.ruleType),
  enabledIdx: index('priority_rules_enabled_idx').on(table.enabled),
}));

// ============================================================================
// Conversations & Messages
// ============================================================================

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  subject: varchar('subject', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  unreadCount: integer('unread_count').notNull().default(0),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('conversations_tenant_idx').on(table.tenantId),
  userIdx: index('conversations_user_idx').on(table.userId),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 20 }).notNull().default('user'),
  senderId: uuid('sender_id').references(() => users.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  attachments: jsonb('attachments').default([]),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
}));

// ============================================================================
// Type Exports
// ============================================================================

// Configuration Types
export type RentalObjectCategory = typeof rentalObjectCategories.$inferSelect;
export type NewRentalObjectCategory = typeof rentalObjectCategories.$inferInsert;
export type RentalObjectSubcategory = typeof rentalObjectSubcategories.$inferSelect;
export type NewRentalObjectSubcategory = typeof rentalObjectSubcategories.$inferInsert;
export type BookingTimeMode = typeof bookingTimeModes.$inferSelect;
export type NewBookingTimeMode = typeof bookingTimeModes.$inferInsert;
export type PricingUnit = typeof pricingUnits.$inferSelect;
export type NewPricingUnit = typeof pricingUnits.$inferInsert;
export type RentalObjectStatus = typeof rentalObjectStatuses.$inferSelect;
export type NewRentalObjectStatus = typeof rentalObjectStatuses.$inferInsert;
export type BookingStatus = typeof bookingStatuses.$inferSelect;
export type NewBookingStatus = typeof bookingStatuses.$inferInsert;
export type SystemConfiguration = typeof systemConfigurations.$inferSelect;
export type NewSystemConfiguration = typeof systemConfigurations.$inferInsert;

// Entity Types
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type Usage = typeof usage.$inferSelect;
export type NewUsage = typeof usage.$inferInsert;
export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type SeasonApplication = typeof seasonApplications.$inferSelect;
export type NewSeasonApplication = typeof seasonApplications.$inferInsert;
export type SeasonalLease = typeof seasonalLeases.$inferSelect;
export type NewSeasonalLease = typeof seasonalLeases.$inferInsert;
export type PriorityRule = typeof priorityRules.$inferSelect;
export type NewPriorityRule = typeof priorityRules.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

