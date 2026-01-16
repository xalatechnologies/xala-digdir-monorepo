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
  unique,
} from 'drizzle-orm/pg-core';

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
  // Subscription & Plan references
  subscriptionPlanId: uuid('subscription_plan_id'),
  // License key (stored as hash only, never plaintext)
  licenseKeyHash: text('license_key_hash'),
  licenseKeyRotatedAt: timestamp('license_key_rotated_at'),
  // Seat limits (overrides plan defaults when set)
  seatLimits: jsonb('seat_limits').default({
    maxUsers: 5,
    maxOrganizations: 1,
    maxListings: 10,
    maxBookingsPerMonth: 100,
    maxStorageMb: 500,
  }),
  // Branding reference (active branding version ID)
  brandingVersionId: uuid('branding_version_id'),
  
  // Feature flags and category controls
  featureFlags: jsonb('feature_flags').notNull().default({}),
  enabledRentalObjectCategories: text('enabled_rental_object_categories').array().notNull().default(['LOCALE', 'ARRANGEMENT']),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('tenants_slug_idx').on(table.slug),
  statusIdx: index('tenants_status_idx').on(table.status),
  subscriptionPlanIdx: index('tenants_subscription_plan_idx').on(table.subscriptionPlanId),
}));

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('other'),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  // Brønnøysund sync fields
  externalOrgId: varchar('external_org_id', { length: 50 }),
  source: varchar('source', { length: 50 }).default('manual'),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('orgs_tenant_idx').on(table.tenantId),
  slugIdx: index('orgs_slug_idx').on(table.tenantId, table.slug),
  externalOrgIdx: index('orgs_external_org_idx').on(table.externalOrgId),
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
  nationalId: varchar('national_id', { length: 11 }), // Norwegian national identity number (fødselsnummer)
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  demoToken: varchar('demo_token', { length: 100 }), // Demo login token for testing
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
}, (table) => ({
  tenantEmailIdx: index('users_tenant_email_idx').on(table.tenantId, table.email),
  tenantIdx: index('users_tenant_idx').on(table.tenantId),
  nationalIdIdx: index('users_national_id_idx').on(table.nationalId),
  demoTokenIdx: index('users_demo_token_idx').on(table.demoToken),
}));

// ============================================================================
// Sessions & Authentication
// ============================================================================

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull().unique(),
  accessTokenJti: text('access_token_jti'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastRefreshedAt: timestamp('last_refreshed_at'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  revokedReason: text('revoked_reason'),
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
  tenantIdx: index('sessions_tenant_idx').on(table.tenantId),
  refreshTokenHashIdx: index('sessions_refresh_token_hash_idx').on(table.refreshTokenHash),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  userTenantIdx: index('sessions_user_tenant_idx').on(table.userId, table.tenantId),
}));

export const orgMemberships = pgTable('org_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  orgRole: varchar('org_role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('org_memberships_user_idx').on(table.userId),
  orgIdx: index('org_memberships_org_idx').on(table.orgId),
  userOrgIdx: index('org_memberships_user_org_idx').on(table.userId, table.orgId),
}));

export const accessGrants = pgTable('access_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  grantedBy: uuid('granted_by').notNull().references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('access_grants_tenant_idx').on(table.tenantId),
  orgIdx: index('access_grants_org_idx').on(table.orgId),
  rentalObjectIdx: index('access_grants_rental_object_idx').on(table.rentalObjectId),
  orgRentalObjectIdx: index('access_grants_org_rental_object_idx').on(table.orgId, table.rentalObjectId),
}));

export const permissionAssignments = pgTable('permission_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => listings.id, { onDelete: 'cascade' }),
  permissions: jsonb('permissions').notNull().default([]),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('permission_assignments_org_idx').on(table.orgId),
  userIdx: index('permission_assignments_user_idx').on(table.userId),
  rentalObjectIdx: index('permission_assignments_rental_object_idx').on(table.rentalObjectId),
  orgUserRentalObjectIdx: index('permission_assignments_org_user_rental_object_idx').on(table.orgId, table.userId, table.rentalObjectId),
}));

export const caseHandlerScopes = pgTable('case_handler_scopes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scopeType: varchar('scope_type', { length: 50 }).notNull(),
  rentalObjectId: uuid('rental_object_id').references(() => listings.id, { onDelete: 'cascade' }),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('case_handler_scopes_tenant_idx').on(table.tenantId),
  userIdx: index('case_handler_scopes_user_idx').on(table.userId),
  scopeTypeIdx: index('case_handler_scopes_scope_type_idx').on(table.scopeType),
  rentalObjectIdx: index('case_handler_scopes_rental_object_idx').on(table.rentalObjectId),
  userScopeIdx: index('case_handler_scopes_user_scope_idx').on(table.userId, table.scopeType, table.rentalObjectId),
}));

// ============================================================================
// Plans & Subscriptions
// ============================================================================

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull().default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  billingPeriod: varchar('billing_period', { length: 20 }).notNull().default('monthly'),
  seatLimits: jsonb('seat_limits').default({
    maxUsers: 5,
    maxOrganizations: 1,
    maxListings: 10,
    maxBookingsPerMonth: 100,
    maxStorageMb: 500,
  }),
  entitlements: jsonb('entitlements').default({
    modules: {
      rating: false,
      recommendations: false,
      feedback: true,
      favorites: true,
      share: true,
      recurringBookings: false,
    },
    integrations: {
      visma: false,
      rco: false,
      acos: false,
      outlook: false,
      vipps: false,
    },
    features: {
      customBranding: false,
      advancedReporting: false,
      apiAccess: false,
      prioritySupport: false,
    },
  }),
  trialDays: integer('trial_days').default(0),
  isPublic: boolean('is_public').notNull().default(true),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('plans_slug_idx').on(table.slug),
  statusIdx: index('plans_status_idx').on(table.status),
  displayOrderIdx: index('plans_display_order_idx').on(table.displayOrder),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }).unique(),
  planId: uuid('plan_id').references(() => plans.id, { onDelete: 'set null' }),
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
  planIdx: index('subscriptions_plan_idx').on(table.planId),
}));

// ============================================================================
// Feature Flags
// ============================================================================

export const featureFlagsCatalog = pgTable('feature_flags_catalog', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull().default('boolean'),
  defaultValue: jsonb('default_value').notNull().default(false),
  category: varchar('category', { length: 50 }).notNull().default('module'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyIdx: index('feature_flags_catalog_key_idx').on(table.key),
  categoryIdx: index('feature_flags_catalog_category_idx').on(table.category),
  statusIdx: index('feature_flags_catalog_status_idx').on(table.status),
}));

export const tenantFeatureFlags = pgTable('tenant_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  featureFlagId: uuid('feature_flag_id').notNull().references(() => featureFlagsCatalog.id, { onDelete: 'cascade' }),
  value: jsonb('value').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  reason: text('reason'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tenant_feature_flags_tenant_idx').on(table.tenantId),
  featureFlagIdx: index('tenant_feature_flags_flag_idx').on(table.featureFlagId),
  tenantFlagUnique: unique('tenant_feature_flags_unique').on(table.tenantId, table.featureFlagId),
}));

export const orgFeatureFlags = pgTable('org_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  featureFlagId: uuid('feature_flag_id').notNull().references(() => featureFlagsCatalog.id, { onDelete: 'cascade' }),
  value: jsonb('value').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  reason: text('reason'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  orgIdx: index('org_feature_flags_org_idx').on(table.organizationId),
  featureFlagIdx: index('org_feature_flags_flag_idx').on(table.featureFlagId),
  orgFlagUnique: unique('org_feature_flags_unique').on(table.organizationId, table.featureFlagId),
}));

// ============================================================================
// Category Entitlements (Rental Object Category Access Control)
// ============================================================================

export const categoryEntitlements = pgTable('category_entitlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 100 }).notNull(),
  enabled: boolean('enabled').notNull().default(true),
  restrictions: jsonb('restrictions').default({}),
  reason: text('reason'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('category_entitlements_tenant_idx').on(table.tenantId),
  orgIdx: index('category_entitlements_org_idx').on(table.organizationId),
  categoryIdx: index('category_entitlements_category_idx').on(table.category),
  tenantCategoryUnique: unique('category_entitlements_tenant_unique').on(table.tenantId, table.category),
  orgCategoryUnique: unique('category_entitlements_org_unique').on(table.organizationId, table.category),
}));

// ============================================================================
// Rental Objects (V3 Model)
// ============================================================================

export const rentalObjects = pgTable('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  
  // Core
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  
  // V3 Model: Category + Time Mode + Features
  categoryKey: varchar('category_key', { length: 50 }).notNull().default('LOKALER_OG_BANER'),
  timeMode: varchar('time_mode', { length: 20 }).notNull().default('PERIOD'),
  features: jsonb('features').notNull().default([]),
  ruleSetKey: varchar('rule_set_key', { length: 50 }),
  
  // Status & workflow
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  requiresApproval: boolean('requires_approval').notNull().default(false),
  
  // Capacity & inventory
  capacity: integer('capacity'),
  inventoryTotal: integer('inventory_total'),
  
  // Content
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  metadata: jsonb('metadata').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('rental_objects_tenant_idx').on(table.tenantId),
  categoryIdx: index('rental_objects_category_key_idx').on(table.categoryKey),
  timeModeIdx: index('rental_objects_time_mode_idx').on(table.timeMode),
  statusIdx: index('rental_objects_status_idx').on(table.status),
  slugIdx: index('rental_objects_slug_idx').on(table.tenantId, table.slug),
}));

// ============================================================================
// Bookings
// ============================================================================

export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('bookings_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('bookings_rental_object_idx').on(table.rentalObjectId),
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
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
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
  rentalObjectIdx: index('allocations_rental_object_idx').on(table.rentalObjectId),
  timeIdx: index('allocations_time_idx').on(table.startTime, table.endTime),
}));

// ============================================================================
// Seasonal Leases
// ============================================================================

export const seasonalLeases = pgTable('seasonal_leases', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
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
  rentalObjectIdx: index('seasonal_leases_rental_object_idx').on(table.rentalObjectId),
  orgIdx: index('seasonal_leases_org_idx').on(table.organizationId),
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
// Branding & White-Label
// ============================================================================

export const brandingTokens = pgTable('branding_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }).unique(),
  name: varchar('name', { length: 255 }),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 50 }),
  secondaryColor: varchar('secondary_color', { length: 50 }),
  accentColor: varchar('accent_color', { length: 50 }),
  tokens: jsonb('tokens').default({}),
  typography: jsonb('typography').default({}),
  activeVersionId: uuid('active_version_id'),
  previewVersionId: uuid('preview_version_id'),
  previewMode: boolean('preview_mode').notNull().default(false),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('branding_tokens_tenant_idx').on(table.tenantId),
}));

export const brandingVersions = pgTable('branding_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  brandingTokensId: uuid('branding_tokens_id').notNull().references(() => brandingTokens.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
  snapshot: jsonb('snapshot').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('branding_versions_tenant_idx').on(table.tenantId),
  brandingTokensIdx: index('branding_versions_tokens_idx').on(table.brandingTokensId),
  versionIdx: index('branding_versions_version_idx').on(table.brandingTokensId, table.version),
  statusIdx: index('branding_versions_status_idx').on(table.status),
  tenantVersionUnique: unique('branding_versions_tenant_version_unique').on(table.tenantId, table.version),
}));
// GDPR Requests
// ============================================================================

export { gdprRequests } from './gdpr-requests';

// ============================================================================
// Type Exports
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type OrgMembership = typeof orgMemberships.$inferSelect;
export type NewOrgMembership = typeof orgMemberships.$inferInsert;
export type AccessGrant = typeof accessGrants.$inferSelect;
export type NewAccessGrant = typeof accessGrants.$inferInsert;
export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type NewPermissionAssignment = typeof permissionAssignments.$inferInsert;
export type CaseHandlerScope = typeof caseHandlerScopes.$inferSelect;
export type NewCaseHandlerScope = typeof caseHandlerScopes.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type RentalObject = typeof rentalObjects.$inferSelect;
export type NewRentalObject = typeof rentalObjects.$inferInsert;
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
export type SeasonalLease = typeof seasonalLeases.$inferSelect;
export type NewSeasonalLease = typeof seasonalLeases.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type FeatureFlagCatalog = typeof featureFlagsCatalog.$inferSelect;
export type NewFeatureFlagCatalog = typeof featureFlagsCatalog.$inferInsert;
export type TenantFeatureFlag = typeof tenantFeatureFlags.$inferSelect;
export type NewTenantFeatureFlag = typeof tenantFeatureFlags.$inferInsert;
export type OrgFeatureFlag = typeof orgFeatureFlags.$inferSelect;
export type NewOrgFeatureFlag = typeof orgFeatureFlags.$inferInsert;
export type CategoryEntitlement = typeof categoryEntitlements.$inferSelect;
export type NewCategoryEntitlement = typeof categoryEntitlements.$inferInsert;
export type BrandingToken = typeof brandingTokens.$inferSelect;
export type NewBrandingToken = typeof brandingTokens.$inferInsert;
export type BrandingVersion = typeof brandingVersions.$inferSelect;
export type NewBrandingVersion = typeof brandingVersions.$inferInsert;
export type { GdprRequest, NewGdprRequest } from './gdpr-requests';

// =============================================================================
// LEGACY ALIASES (for backwards compatibility)
// =============================================================================
// These exports maintain compatibility with code still using "listing" terminology.
// All new code should use "rentalObject" terminology.

/** @deprecated Use rentalObjects instead */
export const listings = rentalObjects;

/** @deprecated Use RentalObject instead */
export type Listing = RentalObject;

/** @deprecated Use NewRentalObject instead */
export type NewListing = NewRentalObject;

// Stub exports for seasons module (pending implementation)
export const seasons = pgTable('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const seasonApplications = pgTable('season_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const priorityRules = pgTable('priority_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  priority: integer('priority').notNull().default(0),
  conditions: jsonb('conditions').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
