/**
 * Module Schema
 * Database tables for module-based feature flags
 */

import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { platformSchema } from './schemas';

// ============================================================================
// Modules & Feature Flags
// ============================================================================

/**
 * Module catalog - all available modules in the platform
 * Populated via seeds, updated on deploys
 */
export const modules = platformSchema.table('modules', {
  key: varchar('key', { length: 50 }).primaryKey(),
  name: jsonb('name').notNull().default({ no: '', en: '' }),
  description: jsonb('description').default({ no: '', en: '' }),
  category: varchar('category', { length: 50 }).notNull(),
  dependencies: text('dependencies').array().notNull().default([]),
  capabilities: text('capabilities').array().notNull().default([]),
  isCore: boolean('is_core').notNull().default(false),
  defaultEnabled: boolean('default_enabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('modules_category_idx').on(table.category),
  isCoreIdx: index('modules_is_core_idx').on(table.isCore),
}));

/**
 * Tenant-specific module overrides
 * Controls which modules are enabled/disabled per tenant
 */
export const tenantModules = platformSchema.table('tenant_modules', {
  tenantId: uuid('tenant_id').notNull(), // FK to platform.tenants(id)
  moduleKey: varchar('module_key', { length: 50 }).notNull(), // FK to platform.modules(key)
  isEnabled: boolean('is_enabled').notNull().default(false),
  config: jsonb('config').default({}),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by'), // FK to platform.users(id)
}, (table) => ({
  pk: primaryKey({ columns: [table.tenantId, table.moduleKey] }),
  tenantIdx: index('tenant_modules_tenant_idx').on(table.tenantId),
  moduleKeyIdx: index('tenant_modules_module_key_idx').on(table.moduleKey),
  enabledIdx: index('tenant_modules_enabled_idx').on(table.tenantId, table.isEnabled),
}));

/**
 * Organization-specific module overrides
 * Optional - allows orgs within a tenant to have different settings
 */
export const orgModules = platformSchema.table('org_modules', {
  tenantId: uuid('tenant_id').notNull(), // FK to platform.tenants(id)
  orgId: uuid('org_id').notNull(), // FK to platform.organizations(id)
  moduleKey: varchar('module_key', { length: 50 }).notNull(), // FK to platform.modules(key)
  isEnabled: boolean('is_enabled').notNull().default(false),
  config: jsonb('config').default({}),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedBy: uuid('updated_by'), // FK to platform.users(id)
}, (table) => ({
  pk: primaryKey({ columns: [table.orgId, table.moduleKey] }),
  tenantIdx: index('org_modules_tenant_idx').on(table.tenantId),
  orgIdx: index('org_modules_org_idx').on(table.orgId),
  moduleKeyIdx: index('org_modules_module_key_idx').on(table.moduleKey),
}));

/**
 * Module change audit log
 * Tracks all module state changes for compliance
 */
export const moduleAudit = platformSchema.table('module_audit', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(), // FK to platform.tenants(id)
  orgId: uuid('org_id'), // FK to platform.organizations(id)
  moduleKey: varchar('module_key', { length: 50 }).notNull(),
  actorUserId: uuid('actor_user_id'), // FK to platform.users(id)
  action: varchar('action', { length: 20 }).notNull(), // 'enable', 'disable', 'config_update'
  oldState: jsonb('old_state'), // { enabled: boolean, config: {} }
  newState: jsonb('new_state').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('module_audit_tenant_idx').on(table.tenantId),
  moduleKeyIdx: index('module_audit_module_key_idx').on(table.moduleKey),
  actorIdx: index('module_audit_actor_idx').on(table.actorUserId),
  createdAtIdx: index('module_audit_created_at_idx').on(table.createdAt),
  tenantModuleIdx: index('module_audit_tenant_module_idx').on(table.tenantId, table.moduleKey),
}));
