/**
 * Drizzle ORM Database Schema
 * Consolidated from all existing APIs
 */
import {
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

// Import schema definitions (centralized to avoid circular dependencies)
import { platformSchema, domainSchema, complianceSchema, monitoringSchema, saasSchema } from './schemas';

// Re-export schemas
export { platformSchema, domainSchema, complianceSchema, monitoringSchema, saasSchema };

// ============================================================================
// Tenants & Organizations
// ============================================================================

export const tenants = platformSchema.table('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  subscriptionPlanId: uuid('subscription_plan_id'),
  licenseKeyHash: text('license_key_hash'),
  licenseKeyRotatedAt: timestamp('license_key_rotated_at'),
  seatLimits: jsonb('seat_limits').default({
    maxUsers: 5,
    maxOrganizations: 1,
    maxListings: 10,
    maxBookingsPerMonth: 100,
    maxStorageMb: 500,
  }),
  brandingVersionId: uuid('branding_version_id'),
  featureFlags: jsonb('feature_flags').notNull().default({}),
  enabledRentalObjectCategories: text('enabled_rental_object_categories').array().notNull().default(['LOCALE', 'ARRANGEMENT']),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('tenants_slug_idx').on(table.slug),
  statusIdx: index('tenants_status_idx').on(table.status),
  subscriptionPlanIdx: index('tenants_subscription_plan_idx').on(table.subscriptionPlanId),
}));

export const organizations = platformSchema.table('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('other'),
  settings: jsonb('settings').default({}),
  status: varchar('status', { length: 50 }).notNull().default('active'),
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

export const users = platformSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  nationalId: varchar('national_id', { length: 11 }),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  demoToken: varchar('demo_token', { length: 100 }),
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

export const sessions = platformSchema.table('sessions', {
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

export const orgMemberships = platformSchema.table('org_memberships', {
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

export const accessGrants = domainSchema.table('access_grants', {
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

export const permissionAssignments = platformSchema.table('permission_assignments', {
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

export const caseHandlerScopes = platformSchema.table('case_handler_scopes', {
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

export const plans = saasSchema.table('plans', {
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

export const subscriptions = saasSchema.table('subscriptions', {
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

export const featureFlagsCatalog = saasSchema.table('feature_flags_catalog', {
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

export const tenantFeatureFlags = saasSchema.table('tenant_feature_flags', {
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

export const orgFeatureFlags = saasSchema.table('org_feature_flags', {
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

export const categoryEntitlements = saasSchema.table('category_entitlements', {
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
export const rentalObjects = domainSchema.table('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  categoryKey: varchar('category_key', { length: 50 }).notNull().default('LOKALER_OG_BANER'),
  timeMode: varchar('time_mode', { length: 20 }).notNull().default('PERIOD'),
  features: jsonb('features').notNull().default([]),
  ruleSetKey: varchar('rule_set_key', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  requiresApproval: boolean('requires_approval').notNull().default(false),
  capacity: integer('capacity'),
  inventoryTotal: integer('inventory_total'),
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('rental_objects_tenant_idx').on(table.tenantId),
  categoryIdx: index('rental_objects_category_key_idx').on(table.categoryKey),
  timeModeIdx: index('rental_objects_time_mode_idx').on(table.timeMode),
  statusIdx: index('rental_objects_status_idx').on(table.status),
  slugIdx: index('rental_objects_slug_idx').on(table.tenantId, table.slug),
}));

// Legacy alias for backward compatibility
export const listings = rentalObjects;

// ============================================================================
// Bookings
// ============================================================================

export const bookings = domainSchema.table('bookings', {
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
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('bookings_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('bookings_rental_object_idx').on(table.rentalObjectId),
  userIdx: index('bookings_user_idx').on(table.userId),
  statusIdx: index('bookings_status_idx').on(table.status),
}));

// ============================================================================
// Reports
// ============================================================================

export const reports = domainSchema.table('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'BOOKINGS' | 'REVENUE' | 'USAGE' | 'AUDIT'
  format: varchar('format', { length: 10 }).notNull().default('JSON'), // 'PDF' | 'XLSX' | 'CSV' | 'JSON'
  status: varchar('status', { length: 20 }).notNull().default('QUEUED'), // 'QUEUED' | 'GENERATING' | 'READY' | 'FAILED'
  parameters: jsonb('parameters').default({}),
  metadata: jsonb('metadata').default({}),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('reports_tenant_idx').on(table.tenantId),
  userIdx: index('reports_user_idx').on(table.userId),
  statusIdx: index('reports_status_idx').on(table.status),
}));

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

// ============================================================================
// Monitoring & Alerts
// ============================================================================

export const auditLogs = complianceSchema.table('audit_logs', {
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

export const alerts = domainSchema.table('alerts', {
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

export const incidents = monitoringSchema.table('incidents', {
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

export const usage = saasSchema.table('usage', {
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
// Blocks (Calendar Blocking for Rental Objects)
// ============================================================================

export const blocks = domainSchema.table('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  reason: text('reason'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  allDay: boolean('all_day').notNull().default(false),
  recurring: boolean('recurring').notNull().default(false),
  recurrenceRule: text('recurrence_rule'),
  visibility: varchar('visibility', { length: 20 }).notNull().default('public'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('blocks_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('blocks_rental_object_idx').on(table.rentalObjectId),
  timeRangeIdx: index('blocks_time_range_idx').on(table.startDate, table.endDate),
  statusIdx: index('blocks_status_idx').on(table.status),
  tenantRentalObjectTimeIdx: index('blocks_tenant_ro_time_idx').on(
    table.tenantId,
    table.rentalObjectId,
    table.startDate,
    table.endDate
  ),
}));

// ============================================================================
// Allocations (Calendar Events, Time Blocking)
// ============================================================================

export const allocations = domainSchema.table('allocations', {
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

export const seasonalLeases = domainSchema.table('seasonal_leases', {
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

export const conversations = domainSchema.table('conversations', {
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

export const messages = domainSchema.table('messages', {
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
// Amenities & Add-ons
// ============================================================================

export const amenityGroups = domainSchema.table('amenity_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
}, (table) => ({
  tenantCodeIdx: unique('amenity_groups_tenant_code').on(table.tenantId, table.code),
}));

export const amenities = domainSchema.table('amenities', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => amenityGroups.id, { onDelete: 'set null' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconKey: varchar('icon_key', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
}, (table) => ({
  tenantCodeIdx: unique('amenities_tenant_code').on(table.tenantId, table.code),
  groupIdx: index('amenities_group_idx').on(table.groupId),
}));

export const rentalObjectAmenities = domainSchema.table('rental_object_amenities', {
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  amenityId: uuid('amenity_id').notNull().references(() => amenities.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: unique('rental_object_amenities_pk').on(table.tenantId, table.rentalObjectId, table.amenityId),
  roIdx: index('rental_object_amenities_ro_idx').on(table.rentalObjectId),
}));

export const addons = domainSchema.table('addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  pricingModel: varchar('pricing_model', { length: 20 }).notNull().default('PER_BOOKING'),
  basePriceCents: integer('base_price_cents').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  isRequired: boolean('is_required').notNull().default(false),
  maxUnits: integer('max_units'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantCodeIdx: unique('addons_tenant_code').on(table.tenantId, table.code),
}));

export const rentalObjectAddons = domainSchema.table('rental_object_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  addonId: uuid('addon_id').notNull().references(() => addons.id, { onDelete: 'cascade' }),
  isRequired: boolean('is_required').notNull().default(false),
  maxUnits: integer('max_units'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (table) => ({
  roAddonIdx: unique('rental_object_addons_unique').on(table.tenantId, table.rentalObjectId, table.addonId),
}));

export const bookingAddons = domainSchema.table('booking_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  addonId: uuid('addon_id').notNull().references(() => addons.id, { onDelete: 'restrict' }),
  units: integer('units').notNull().default(1),
  priceCents: integer('price_cents').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
}, (table) => ({
  bookingAddonIdx: unique('booking_addons_unique').on(table.tenantId, table.bookingId, table.addonId),
}));

// ============================================================================
// Favorites
// ============================================================================

export const favorites = domainSchema.table('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  tags: text('tags').array().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userRoIdx: unique('favorites_user_ro_unique').on(table.userId, table.rentalObjectId),
  userIdx: index('favorites_user_idx').on(table.userId),
  tenantIdx: index('favorites_tenant_idx').on(table.tenantId),
}));

// ============================================================================
// Categories (for rental objects)
// ============================================================================

export const categories = domainSchema.table('rental_object_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'), // Self-reference handled at application level
  code: varchar('code', { length: 50 }).notNull(),
  key: varchar('key', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
}, (table) => ({
  tenantCodeIdx: unique('categories_tenant_code').on(table.tenantId, table.code),
}));

// ============================================================================
// Branding & White-Label
// ============================================================================

export const brandingTokens = platformSchema.table('branding_tokens', {
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

export const brandingVersions = platformSchema.table('branding_versions', {
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
// ============================================================================
// GDPR Requests
// ============================================================================

export { gdprRequests } from './gdpr-requests';

// ============================================================================
// Notification Preferences (defined inline to avoid circular dependency)
// ============================================================================

export const notificationPreferences = domainSchema.table('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Channel preferences (global toggles)
  inAppEnabled: boolean('in_app_enabled').notNull().default(true),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  smsEnabled: boolean('sms_enabled').notNull().default(false),
  pushEnabled: boolean('push_enabled').notNull().default(true),

  // Notification type preferences
  bookingCreated: boolean('booking_created').notNull().default(true),
  bookingApproved: boolean('booking_approved').notNull().default(true),
  bookingRejected: boolean('booking_rejected').notNull().default(true),
  bookingCancelled: boolean('booking_cancelled').notNull().default(true),
  bookingChanged: boolean('booking_changed').notNull().default(true),

  reminder24h: boolean('reminder_24h').notNull().default(true),
  reminder2h: boolean('reminder_2h').notNull().default(true),

  systemNotifications: boolean('system_notifications').notNull().default(true),
  adminMessages: boolean('admin_messages').notNull().default(true),

  invoiceAvailable: boolean('invoice_available').notNull().default(true),
  paymentStatus: boolean('payment_status').notNull().default(true),

  // Metadata & Timestamps
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('notification_preferences_user_idx').on(table.userId),
  tenantIdx: index('notification_preferences_tenant_idx').on(table.tenantId),
  userTenantIdx: index('notification_preferences_user_tenant_idx').on(table.userId, table.tenantId),
  userTenantUnique: unique('notification_preferences_user_tenant_unique').on(table.userId, table.tenantId),
}));

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;

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
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
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

// Season-related types
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type SeasonApplication = typeof seasonApplications.$inferSelect;
export type NewSeasonApplication = typeof seasonApplications.$inferInsert;
export type PriorityRule = typeof priorityRules.$inferSelect;
export type NewPriorityRule = typeof priorityRules.$inferInsert;

// ============================================================================
// Custody & Delegation
// ============================================================================

export * from './entitlements';
export { 
  rentalObjectCustodyGrants,
  rentalObjectCustodySubgrants,
  rentalObjectCustodyGrantsRelations,
  rentalObjectCustodySubgrantsRelations,
  type RentalObjectCustodyGrant,
  type NewRentalObjectCustodyGrant,
  type RentalObjectCustodySubgrant,
  type NewRentalObjectCustodySubgrant,
} from './custody';

// =============================================================================
// LEGACY ALIASES (for backwards compatibility)
// =============================================================================
// These exports maintain compatibility with code still using "listing" terminology.
// All new code should use "rentalObject" terminology.
// NOTE: listings is already exported from base-tables.ts

// Stub exports for seasons module (pending implementation)
export const seasons = domainSchema.table('seasons', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const seasonApplications = domainSchema.table('season_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  applicantName: varchar('applicant_name', { length: 255 }).notNull(),
  applicantEmail: varchar('applicant_email', { length: 255 }).notNull(),
  applicantPhone: varchar('applicant_phone', { length: 50 }),
  weekday: integer('weekday').notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: varchar('start_time', { length: 10 }).notNull(), // e.g., "09:00"
  endTime: varchar('end_time', { length: 10 }).notNull(), // e.g., "17:00"
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
  rentalObjectIdx: index('season_applications_rental_object_idx').on(table.rentalObjectId),
  orgIdx: index('season_applications_org_idx').on(table.organizationId),
  statusIdx: index('season_applications_status_idx').on(table.status),
}));

export const priorityRules = domainSchema.table('priority_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  seasonId: uuid('season_id').notNull().references(() => seasons.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull().default('custom'),
  priority: integer('priority').notNull().default(0),
  conditions: jsonb('conditions').default({}),
  enabled: boolean('enabled').notNull().default(true),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('priority_rules_tenant_idx').on(table.tenantId),
  seasonIdx: index('priority_rules_season_idx').on(table.seasonId),
}));

// ============================================================================
// Notifications & Delivery Tracking
// ============================================================================

export const notifications = domainSchema.table('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: varchar('type', { length: 50 }).notNull(),
  channel: varchar('channel', { length: 20 }).notNull().default('in_app'),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  contentHash: varchar('content_hash', { length: 64 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  priority: varchar('priority', { length: 20 }).notNull().default('normal'),
  metadata: jsonb('metadata').default({}),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  failedAt: timestamp('failed_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('notifications_tenant_idx').on(table.tenantId),
  userIdx: index('notifications_user_idx').on(table.userId),
  statusIdx: index('notifications_status_idx').on(table.status),
  contentHashIdx: index('notifications_content_hash_idx').on(table.contentHash),
}));

export const deliveryAttempts = domainSchema.table('delivery_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  attemptNumber: integer('attempt_number').notNull().default(1),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  channel: varchar('channel', { length: 20 }).notNull(),
  response: jsonb('response').default({}),
  errorMessage: text('error_message'),
  nextRetryAt: timestamp('next_retry_at'),
  attemptedAt: timestamp('attempted_at').notNull().defaultNow(),
}, (table) => ({
  notificationIdx: index('delivery_attempts_notification_idx').on(table.notificationId),
  statusIdx: index('delivery_attempts_status_idx').on(table.status),
  nextRetryIdx: index('delivery_attempts_next_retry_idx').on(table.nextRetryAt),
}));

// ============================================================================
// Pricing Groups & Rental Object Pricing
// ============================================================================

export const pricingGroups = domainSchema.table('pricing_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('pricing_groups_tenant_idx').on(table.tenantId),
  tenantCodeIdx: unique('pricing_groups_tenant_code').on(table.tenantId, table.code),
}));

export const rentalObjectPricing = domainSchema.table('rental_object_pricing', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  pricingGroupId: uuid('pricing_group_id').notNull().references(() => pricingGroups.id, { onDelete: 'cascade' }),
  basePriceCents: integer('base_price_cents').notNull().default(0),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  priceUnit: varchar('price_unit', { length: 20 }).notNull().default('per_hour'),
  minDuration: integer('min_duration'),
  maxDuration: integer('max_duration'),
  isActive: boolean('is_active').notNull().default(true),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('rental_object_pricing_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('rental_object_pricing_ro_idx').on(table.rentalObjectId),
  pricingGroupIdx: index('rental_object_pricing_group_idx').on(table.pricingGroupId),
  uniquePricing: unique('rental_object_pricing_unique').on(table.tenantId, table.rentalObjectId, table.pricingGroupId),
}));

export const userPricingGroups = domainSchema.table('user_pricing_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pricingGroupId: uuid('pricing_group_id').notNull().references(() => pricingGroups.id, { onDelete: 'cascade' }),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('user_pricing_groups_tenant_idx').on(table.tenantId),
  userIdx: index('user_pricing_groups_user_idx').on(table.userId),
  uniqueUserGroup: unique('user_pricing_groups_unique').on(table.tenantId, table.userId, table.pricingGroupId),
}));

export const organizationPricingGroups = domainSchema.table('organization_pricing_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  pricingGroupId: uuid('pricing_group_id').notNull().references(() => pricingGroups.id, { onDelete: 'cascade' }),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('org_pricing_groups_tenant_idx').on(table.tenantId),
  orgIdx: index('org_pricing_groups_org_idx').on(table.organizationId),
  uniqueOrgGroup: unique('org_pricing_groups_unique').on(table.tenantId, table.organizationId, table.pricingGroupId),
}));
