/**
 * Entitlements Schema
 * Isolated schema for entitlements & feature flags system
 * This allows Drizzle Kit to generate migrations without hanging
 */

import { uuid, varchar, boolean, timestamp, jsonb, integer, text, index, unique } from 'drizzle-orm/pg-core';
import { saasSchema } from '../schemas';

// =============================================================================
// Plan Entitlements
// =============================================================================

export const planEntitlements = saasSchema.table('plan_entitlements', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id').notNull(),
  keyType: varchar('key_type', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  defaultEnabled: boolean('default_enabled').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  planKeyIdx: index('plan_entitlements_plan_key_idx').on(table.planId, table.keyType, table.key),
  planKeyUnique: unique('plan_entitlements_plan_key_unique').on(table.planId, table.keyType, table.key),
}));

// =============================================================================
// Tenant Entitlement Overrides
// =============================================================================

export const tenantEntitlementOverrides = saasSchema.table('tenant_entitlement_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  keyType: varchar('key_type', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  enabled: boolean('enabled').notNull(),
  reason: text('reason'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantKeyIdx: index('tenant_overrides_tenant_key_idx').on(table.tenantId, table.keyType, table.key),
  tenantKeyUnique: unique('tenant_overrides_tenant_key_unique').on(table.tenantId, table.keyType, table.key),
}));

// =============================================================================
// Integration Configurations
// =============================================================================

export const integrationConfigs = saasSchema.table('integration_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  integrationKey: varchar('integration_key', { length: 100 }).notNull(),
  configJson: jsonb('config_json').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('MISSING'),
  lastValidatedAt: timestamp('last_validated_at'),
  validationError: text('validation_error'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIntegrationIdx: index('integration_configs_tenant_integration_idx').on(table.tenantId, table.integrationKey),
  tenantIntegrationUnique: unique('integration_configs_tenant_integration_unique').on(table.tenantId, table.integrationKey),
  statusIdx: index('integration_configs_status_idx').on(table.status),
}));

// =============================================================================
// Route Policies
// =============================================================================

export const routePolicies = saasSchema.table('route_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  app: varchar('app', { length: 50 }).notNull(),
  routeKey: varchar('route_key', { length: 200 }).notNull().unique(),
  requiredRoles: jsonb('required_roles').notNull().default('[]'),
  requiredModules: jsonb('required_modules').notNull().default('[]'),
  requiredFeatures: jsonb('required_features').notNull().default('[]'),
  isPublic: boolean('is_public').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  appIdx: index('route_policies_app_idx').on(table.app),
  routeKeyIdx: index('route_policies_route_key_idx').on(table.routeKey),
}));

// =============================================================================
// Navigation Policies
// =============================================================================

export const navPolicies = saasSchema.table('nav_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  app: varchar('app', { length: 50 }).notNull(),
  navItemKey: varchar('nav_item_key', { length: 200 }).notNull(),
  routeKey: varchar('route_key', { length: 200 }),
  requiredRoles: jsonb('required_roles').notNull().default('[]'),
  requiredModules: jsonb('required_modules').notNull().default('[]'),
  requiredFeatures: jsonb('required_features').notNull().default('[]'),
  labelKey: varchar('label_key', { length: 200 }).notNull(),
  iconKey: varchar('icon_key', { length: 100 }),
  parentKey: varchar('parent_key', { length: 200 }),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  appNavItemIdx: index('nav_policies_app_nav_item_idx').on(table.app, table.navItemKey),
  appNavItemUnique: unique('nav_policies_app_nav_item_unique').on(table.app, table.navItemKey),
  appOrderIdx: index('nav_policies_app_order_idx').on(table.app, table.order),
}));

// =============================================================================
// Global Kill Switches
// =============================================================================

export const globalKillSwitches = saasSchema.table('global_kill_switches', {
  id: uuid('id').primaryKey().defaultRandom(),
  keyType: varchar('key_type', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  enabled: boolean('enabled').notNull().default(false),
  reason: text('reason').notNull(),
  environment: varchar('environment', { length: 50 }),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyTypeKeyIdx: index('kill_switches_key_type_key_idx').on(table.keyType, table.key),
  keyTypeKeyEnvUnique: unique('kill_switches_key_type_key_env_unique').on(table.keyType, table.key, table.environment),
}));

// =============================================================================
// Entitlement Audit Log
// =============================================================================

export const entitlementAuditLog = saasSchema.table('entitlement_audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id'),
  action: varchar('action', { length: 100 }).notNull(),
  keyType: varchar('key_type', { length: 50 }),
  key: varchar('key', { length: 100 }),
  before: jsonb('before'),
  after: jsonb('after'),
  actorId: uuid('actor_id'),
  actorType: varchar('actor_type', { length: 50 }),
  correlationId: uuid('correlation_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('entitlement_audit_tenant_idx').on(table.tenantId),
  actionIdx: index('entitlement_audit_action_idx').on(table.action),
  createdAtIdx: index('entitlement_audit_created_at_idx').on(table.createdAt),
  correlationIdx: index('entitlement_audit_correlation_idx').on(table.correlationId),
}));
