/**
 * Rental Objects Schema (V3 Canonical Model)
 * 
 * 4 Categories + 3 Time Modes + 3 Features
 */
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tenants, organizations, users } from './index';

// =============================================================================
// RENTAL OBJECT CATEGORIES (Seed table - source of truth)
// =============================================================================

export const rentalObjectCategories = pgTable('rental_object_categories', {
  key: varchar('key', { length: 50 }).primaryKey(),
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  defaultTimeMode: varchar('default_time_mode', { length: 20 }).notNull().default('PERIOD'),
  allowedTimeModes: jsonb('allowed_time_modes').notNull().default([]),
  allowedFeatures: jsonb('allowed_features').notNull().default([]),
  uiIcon: varchar('ui_icon', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

// =============================================================================
// BOOKING TIME MODES (Seed table - source of truth)
// =============================================================================

export const bookingTimeModes = pgTable('booking_time_modes', {
  key: varchar('key', { length: 20 }).primaryKey(),
  titleNb: varchar('title_nb', { length: 50 }).notNull(),
  titleEn: varchar('title_en', { length: 50 }).notNull(),
  calendarUiVariant: varchar('calendar_ui_variant', { length: 30 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

// =============================================================================
// RENTAL OBJECT FEATURES (Seed table - source of truth)
// =============================================================================

export const rentalObjectFeatures = pgTable('rental_object_features', {
  key: varchar('key', { length: 50 }).primaryKey(),
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  description: text('description'),
});

// =============================================================================
// RULE SETS (Reusable booking rules)
// =============================================================================

export const ruleSets = pgTable('rule_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  timeMode: varchar('time_mode', { length: 20 }).notNull(),
  rules: jsonb('rules').notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// =============================================================================
// RENTAL OBJECTS (Main entity)
// =============================================================================

export const rentalObjects = pgTable('rental_objects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  
  // Core fields
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  
  // Category & Mode (V3 Model)
  categoryKey: varchar('category_key', { length: 50 }).notNull().default('LOKALER_OG_BANER'),
  timeMode: varchar('time_mode', { length: 20 }).notNull().default('PERIOD'),
  features: jsonb('features').notNull().default([]), // ['INVENTORY', 'SHARED_CAPACITY', 'PACKAGES']
  
  // Rule set reference
  ruleSetKey: varchar('rule_set_key', { length: 50 }),
  
  // Status & approval
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  requiresApproval: boolean('requires_approval').notNull().default(false),
  
  // Capacity & inventory
  capacity: integer('capacity'),
  inventoryTotal: integer('inventory_total'),
  
  // Media & content
  images: jsonb('images').default([]),
  pricing: jsonb('pricing').default({}),
  metadata: jsonb('metadata').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('rental_objects_tenant_idx').on(table.tenantId),
  categoryIdx: index('rental_objects_category_idx').on(table.categoryKey),
  timeModeIdx: index('rental_objects_time_mode_idx').on(table.timeMode),
  statusIdx: index('rental_objects_status_idx').on(table.status),
  slugIdx: index('rental_objects_slug_idx').on(table.tenantId, table.slug),
}));

// =============================================================================
// BLACKOUTS (Calendar blocks)
// =============================================================================

export const blackouts = pgTable('blackouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reason: text('reason'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  rentalObjectIdx: index('blackouts_rental_object_idx').on(table.rentalObjectId),
  timeIdx: index('blackouts_time_idx').on(table.startTime, table.endTime),
}));

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RentalObjectCategory = typeof rentalObjectCategories.$inferSelect;
export type BookingTimeMode = typeof bookingTimeModes.$inferSelect;
export type RentalObjectFeature = typeof rentalObjectFeatures.$inferSelect;
export type RuleSet = typeof ruleSets.$inferSelect;
export type RentalObject = typeof rentalObjects.$inferSelect;
export type NewRentalObject = typeof rentalObjects.$inferInsert;
export type Blackout = typeof blackouts.$inferSelect;
export type NewBlackout = typeof blackouts.$inferInsert;
