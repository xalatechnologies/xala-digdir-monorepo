/**
 * Core Tables: Tenants
 * Foundation table - no dependencies on other tables
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { platformSchema } from '../schemas';

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

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
