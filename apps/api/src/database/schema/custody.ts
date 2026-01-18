/**
 * Rental Object Custody & Delegation Hierarchy Schema
 * 
 * Implements the normalized model for resource-scoped delegation.
 */
import {
  pgSchema,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants, users, organizations, rentalObjects } from './index';

const domainSchema = pgSchema('domain');

/**
 * Main custody grants table
 * Allows delegating responsibility to a User or an Organization
 */
export const rentalObjectCustodyGrants = domainSchema.table('rental_object_custody_grants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  
  granteeType: varchar('grantee_type', { length: 20 }).notNull(), // 'USER' | 'ORG'
  granteeId: uuid('grantee_id').notNull(),
  
  scopes: text('scopes').array().notNull().default([]),
  canSubdelegate: boolean('can_subdelegate').notNull().default(false),
  
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  reason: text('reason'),
  
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'), // 'ACTIVE' | 'REVOKED'
  
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedByUserId: uuid('revoked_by_user_id').references(() => users.id),
}, (table) => ({
  tenantIdx: index('ro_custody_grants_tenant_idx').on(table.tenantId),
  roIdx: index('ro_custody_grants_ro_idx').on(table.rentalObjectId),
  granteeIdx: index('ro_custody_grants_grantee_idx').on(table.granteeType, table.granteeId),
  uniqueActiveGrant: unique('ro_custody_grants_unique_active').on(
    table.tenantId, 
    table.rentalObjectId, 
    table.granteeType, 
    table.granteeId
  ),
}));

/**
 * Relations for custody grants
 */
export const rentalObjectCustodyGrantsRelations = relations(rentalObjectCustodyGrants, ({ one, many }) => ({
  tenant: one(tenants, { fields: [rentalObjectCustodyGrants.tenantId], references: [tenants.id] }),
  rentalObject: one(rentalObjects, { fields: [rentalObjectCustodyGrants.rentalObjectId], references: [rentalObjects.id] }),
  createdByUser: one(users, { fields: [rentalObjectCustodyGrants.createdByUserId], references: [users.id], relationName: 'custody_created_by' }),
  revokedByUser: one(users, { fields: [rentalObjectCustodyGrants.revokedByUserId], references: [users.id], relationName: 'custody_revoked_by' }),
  subgrants: many(rentalObjectCustodySubgrants),
}));

/**
 * Subgrants table for organization members
 * Only allowed when parent grant is ORG with can_subdelegate=true
 */
export const rentalObjectCustodySubgrants = domainSchema.table('rental_object_custody_subgrants', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  parentGrantId: uuid('parent_grant_id').notNull().references(() => rentalObjectCustodyGrants.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  memberUserId: uuid('member_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  scopes: text('scopes').array().notNull().default([]),
  
  effectiveFrom: timestamp('effective_from', { withTimezone: true }),
  effectiveTo: timestamp('effective_to', { withTimezone: true }),
  
  status: varchar('status', { length: 20 }).notNull().default('ACTIVE'),
  
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedByUserId: uuid('revoked_by_user_id').references(() => users.id),
}, (table) => ({
  tenantIdx: index('ro_custody_subgrants_tenant_idx').on(table.tenantId),
  parentIdx: index('ro_custody_subgrants_parent_idx').on(table.parentGrantId),
  memberIdx: index('ro_custody_subgrants_member_idx').on(table.memberUserId),
  orgIdx: index('ro_custody_subgrants_org_idx').on(table.orgId),
}));

/**
 * Relations for custody subgrants
 */
export const rentalObjectCustodySubgrantsRelations = relations(rentalObjectCustodySubgrants, ({ one }) => ({
  tenant: one(tenants, { fields: [rentalObjectCustodySubgrants.tenantId], references: [tenants.id] }),
  parentGrant: one(rentalObjectCustodyGrants, { fields: [rentalObjectCustodySubgrants.parentGrantId], references: [rentalObjectCustodyGrants.id] }),
  organization: one(organizations, { fields: [rentalObjectCustodySubgrants.orgId], references: [organizations.id] }),
  memberUser: one(users, { fields: [rentalObjectCustodySubgrants.memberUserId], references: [users.id] }),
  createdByUser: one(users, { fields: [rentalObjectCustodySubgrants.createdByUserId], references: [users.id], relationName: 'subcustody_created_by' }),
  revokedByUser: one(users, { fields: [rentalObjectCustodySubgrants.revokedByUserId], references: [users.id], relationName: 'subcustody_revoked_by' }),
}));

export type RentalObjectCustodyGrant = typeof rentalObjectCustodyGrants.$inferSelect;
export type NewRentalObjectCustodyGrant = typeof rentalObjectCustodyGrants.$inferInsert;
export type RentalObjectCustodySubgrant = typeof rentalObjectCustodySubgrants.$inferSelect;
export type NewRentalObjectCustodySubgrant = typeof rentalObjectCustodySubgrants.$inferInsert;
