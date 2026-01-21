/**
 * Menu System Schema
 * Database-driven navigation menu system for any SaaS application
 *
 * Tables:
 * - roles: Canonical role definitions
 * - permissions: Permission definitions
 * - role_permissions: Role-permission join
 * - feature_flags: Feature flag definitions
 * - tenant_feature_flags: Per-tenant flag overrides
 * - menu_templates: Versioned menu templates
 * - menu_categories: Smart category groupings
 * - menu_items: Menu item tree
 * - menu_item_permissions: Item-permission join
 * - menu_item_flags: Item-flag join
 * - tenant_menu_assignments: Template assignments
 * - role_menu_overrides: Per-role customizations
 */

import {
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  index,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { saasSchema } from '../schemas';

// =============================================================================
// Roles
// =============================================================================

export const roles = saasSchema.table('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  scope: varchar('scope', { length: 20 }).notNull(),
  nameNb: varchar('name_nb', { length: 100 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  descriptionNb: text('description_nb'),
  descriptionEn: text('description_en'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('roles_code_idx').on(table.code),
  scopeIdx: index('roles_scope_idx').on(table.scope),
}));

// =============================================================================
// Permissions
// =============================================================================

export const permissions = saasSchema.table('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 50 }),
  descriptionNb: text('description_nb'),
  descriptionEn: text('description_en'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('permissions_code_idx').on(table.code),
  categoryIdx: index('permissions_category_idx').on(table.category),
}));

// =============================================================================
// Role Permissions (Join)
// =============================================================================

export const rolePermissions = saasSchema.table('role_permissions', {
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
  roleIdx: index('role_permissions_role_idx').on(table.roleId),
  permissionIdx: index('role_permissions_permission_idx').on(table.permissionId),
}));

// =============================================================================
// Feature Flags
// =============================================================================

export const featureFlags = saasSchema.table('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().default('BOOLEAN'),
  defaultValue: jsonb('default_value').notNull().default('false'),
  descriptionNb: text('description_nb'),
  descriptionEn: text('description_en'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  codeIdx: index('feature_flags_code_idx').on(table.code),
  typeIdx: index('feature_flags_type_idx').on(table.type),
}));

// =============================================================================
// Tenant Feature Flags
// =============================================================================

export const tenantFeatureFlags = saasSchema.table('tenant_feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  featureFlagId: uuid('feature_flag_id').notNull().references(() => featureFlags.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').notNull(),
  value: jsonb('value'),
  effectiveFrom: timestamp('effective_from'),
  effectiveTo: timestamp('effective_to'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tenant_feature_flags_tenant_idx').on(table.tenantId),
  flagIdx: index('tenant_feature_flags_flag_idx').on(table.featureFlagId),
  effectiveIdx: index('tenant_feature_flags_effective_idx').on(table.effectiveFrom, table.effectiveTo),
  tenantFlagUnique: unique('tenant_feature_flags_tenant_flag_unique').on(table.tenantId, table.featureFlagId),
}));

// =============================================================================
// Menu Templates
// =============================================================================

export const menuTemplates = saasSchema.table('menu_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).notNull(),
  version: integer('version').notNull().default(1),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'),
  nameNb: varchar('name_nb', { length: 100 }),
  nameEn: varchar('name_en', { length: 100 }),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
}, (table) => ({
  codeIdx: index('menu_templates_code_idx').on(table.code),
  statusIdx: index('menu_templates_status_idx').on(table.status),
  codeStatusIdx: index('menu_templates_code_status_idx').on(table.code, table.status),
  codeVersionUnique: unique('menu_templates_code_version_unique').on(table.code, table.version),
}));

// =============================================================================
// Menu Categories
// =============================================================================

export const menuCategories = saasSchema.table('menu_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => menuTemplates.id, { onDelete: 'cascade' }),
  key: varchar('key', { length: 50 }).notNull(),
  labelNb: varchar('label_nb', { length: 100 }).notNull(),
  labelEn: varchar('label_en', { length: 100 }).notNull(),
  iconKey: varchar('icon_key', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isCollapsible: boolean('is_collapsible').notNull().default(false),
  defaultExpanded: boolean('default_expanded').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  templateIdx: index('menu_categories_template_idx').on(table.templateId),
  keyIdx: index('menu_categories_key_idx').on(table.key),
  orderIdx: index('menu_categories_order_idx').on(table.templateId, table.sortOrder),
  templateKeyUnique: unique('menu_categories_template_key_unique').on(table.templateId, table.key),
}));

// =============================================================================
// Menu Items
// =============================================================================

export const menuItems = saasSchema.table('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => menuTemplates.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => menuCategories.id, { onDelete: 'set null' }),
  parentId: uuid('parent_id'),
  key: varchar('key', { length: 100 }).notNull(),
  labelNb: varchar('label_nb', { length: 150 }).notNull(),
  labelEn: varchar('label_en', { length: 150 }).notNull(),
  descriptionNb: varchar('description_nb', { length: 300 }),
  descriptionEn: varchar('description_en', { length: 300 }),
  route: varchar('route', { length: 200 }).notNull(),
  iconKey: varchar('icon_key', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isSection: boolean('is_section').notNull().default(false),
  visibilityScope: varchar('visibility_scope', { length: 20 }).notNull().default('TENANT'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  templateIdx: index('menu_items_template_idx').on(table.templateId),
  categoryIdx: index('menu_items_category_idx').on(table.categoryId),
  parentIdx: index('menu_items_parent_idx').on(table.parentId),
  keyIdx: index('menu_items_key_idx').on(table.key),
  orderIdx: index('menu_items_order_idx').on(table.templateId, table.categoryId, table.sortOrder),
  templateKeyUnique: unique('menu_items_template_key_unique').on(table.templateId, table.key),
}));

// =============================================================================
// Menu Item Permissions (Join)
// =============================================================================

export const menuItemPermissions = saasSchema.table('menu_item_permissions', {
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.menuItemId, table.permissionId] }),
  itemIdx: index('menu_item_permissions_item_idx').on(table.menuItemId),
  permIdx: index('menu_item_permissions_perm_idx').on(table.permissionId),
}));

// =============================================================================
// Menu Item Flags (Join)
// =============================================================================

export const menuItemFlags = saasSchema.table('menu_item_flags', {
  menuItemId: uuid('menu_item_id').notNull().references(() => menuItems.id, { onDelete: 'cascade' }),
  featureFlagId: uuid('feature_flag_id').notNull().references(() => featureFlags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.menuItemId, table.featureFlagId] }),
  itemIdx: index('menu_item_flags_item_idx').on(table.menuItemId),
  flagIdx: index('menu_item_flags_flag_idx').on(table.featureFlagId),
}));

// =============================================================================
// Tenant Menu Assignments
// =============================================================================

export const tenantMenuAssignments = saasSchema.table('tenant_menu_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  templateId: uuid('template_id').notNull().references(() => menuTemplates.id, { onDelete: 'cascade' }),
  effectiveFrom: timestamp('effective_from').notNull().defaultNow(),
  effectiveTo: timestamp('effective_to'),
  assignedBy: uuid('assigned_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('tenant_menu_assignments_tenant_idx').on(table.tenantId),
  templateIdx: index('tenant_menu_assignments_template_idx').on(table.templateId),
  effectiveIdx: index('tenant_menu_assignments_effective_idx').on(table.effectiveFrom, table.effectiveTo),
}));

// =============================================================================
// Role Menu Overrides
// =============================================================================

export const roleMenuOverrides = saasSchema.table('role_menu_overrides', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => menuTemplates.id, { onDelete: 'cascade' }),
  roleCode: varchar('role_code', { length: 50 }).notNull(),
  hiddenItemKeys: text('hidden_item_keys').array().notNull().default([]),
  forcedItemKeys: text('forced_item_keys').array().notNull().default([]),
  customOrder: jsonb('custom_order'),
  customLabels: jsonb('custom_labels'),
  notes: text('notes'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  templateIdx: index('role_menu_overrides_template_idx').on(table.templateId),
  roleIdx: index('role_menu_overrides_role_idx').on(table.roleCode),
  templateRoleUnique: unique('role_menu_overrides_template_role_unique').on(table.templateId, table.roleCode),
}));

// =============================================================================
// Type Exports
// =============================================================================

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type NewFeatureFlag = typeof featureFlags.$inferInsert;
export type TenantFeatureFlag = typeof tenantFeatureFlags.$inferSelect;
export type NewTenantFeatureFlag = typeof tenantFeatureFlags.$inferInsert;
export type MenuTemplate = typeof menuTemplates.$inferSelect;
export type NewMenuTemplate = typeof menuTemplates.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type NewMenuCategory = typeof menuCategories.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;
export type TenantMenuAssignment = typeof tenantMenuAssignments.$inferSelect;
export type NewTenantMenuAssignment = typeof tenantMenuAssignments.$inferInsert;
export type RoleMenuOverride = typeof roleMenuOverrides.$inferSelect;
export type NewRoleMenuOverride = typeof roleMenuOverrides.$inferInsert;
