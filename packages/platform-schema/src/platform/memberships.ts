/**
 * Platform Tables: Memberships
 * Organization membership and permissions
 *
 * Platform-agnostic membership tables for any SaaS application.
 * Note: Domain-specific access grants and permission assignments should be
 * defined in domain packages that extend these base tables.
 */
import {
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { platformSchema } from '../schemas';
import { tenants, users, organizations } from '../core';

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

/**
 * Generic permission assignments table
 * Domain-specific implementations should extend this with resource-specific foreign keys
 */
export const permissionAssignments = platformSchema.table('permission_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resourceType: varchar('resource_type', { length: 50 }).notNull(),
  resourceId: uuid('resource_id').notNull(),
  permissions: jsonb('permissions').notNull().default([]),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('permission_assignments_tenant_idx').on(table.tenantId),
  orgIdx: index('permission_assignments_org_idx').on(table.orgId),
  userIdx: index('permission_assignments_user_idx').on(table.userId),
  resourceIdx: index('permission_assignments_resource_idx').on(table.resourceType, table.resourceId),
  orgUserResourceIdx: index('permission_assignments_org_user_resource_idx').on(table.orgId, table.userId, table.resourceType, table.resourceId),
}));

/**
 * Generic case handler scopes table
 * For managing which users can handle which types of cases
 */
export const caseHandlerScopes = platformSchema.table('case_handler_scopes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scopeType: varchar('scope_type', { length: 50 }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('case_handler_scopes_tenant_idx').on(table.tenantId),
  userIdx: index('case_handler_scopes_user_idx').on(table.userId),
  scopeTypeIdx: index('case_handler_scopes_scope_type_idx').on(table.scopeType),
  resourceIdx: index('case_handler_scopes_resource_idx').on(table.resourceType, table.resourceId),
  userScopeIdx: index('case_handler_scopes_user_scope_idx').on(table.userId, table.scopeType, table.resourceType, table.resourceId),
}));

export type OrgMembership = typeof orgMemberships.$inferSelect;
export type NewOrgMembership = typeof orgMemberships.$inferInsert;
export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type NewPermissionAssignment = typeof permissionAssignments.$inferInsert;
export type CaseHandlerScope = typeof caseHandlerScopes.$inferSelect;
export type NewCaseHandlerScope = typeof caseHandlerScopes.$inferInsert;
