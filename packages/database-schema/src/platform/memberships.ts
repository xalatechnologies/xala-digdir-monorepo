/**
 * Platform Tables: Memberships
 * Organization membership and permissions
 */
import {
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { platformSchema, domainSchema } from '../schemas';
import { tenants, users, organizations } from '../core';
import { rentalObjects, listings } from '../domain';

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

export type OrgMembership = typeof orgMemberships.$inferSelect;
export type NewOrgMembership = typeof orgMemberships.$inferInsert;
export type AccessGrant = typeof accessGrants.$inferSelect;
export type NewAccessGrant = typeof accessGrants.$inferInsert;
export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type NewPermissionAssignment = typeof permissionAssignments.$inferInsert;
export type CaseHandlerScope = typeof caseHandlerScopes.$inferSelect;
export type NewCaseHandlerScope = typeof caseHandlerScopes.$inferInsert;
