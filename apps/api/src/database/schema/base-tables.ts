/**
 * Base Tables
 * Core platform tables that are referenced by other schema files.
 * Extracted to break circular dependencies.
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { platformSchema, domainSchema } from './schemas';

// ============================================================================
// Tenants
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

// ============================================================================
// Organizations
// ============================================================================

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
// Users
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
// Rental Objects (Base definition for references)
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

// Legacy alias
export const listings = rentalObjects;

// ============================================================================
// Type Exports
// ============================================================================

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RentalObject = typeof rentalObjects.$inferSelect;
export type NewRentalObject = typeof rentalObjects.$inferInsert;
export type Listing = RentalObject;
export type NewListing = NewRentalObject;
