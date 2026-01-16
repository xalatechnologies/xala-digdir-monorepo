/**
 * Rental Object Domain Model - Seed Tables as Source of Truth
 * 
 * 4 Categories + 3 Time Modes + Features
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

// =============================================================================
// RENTAL OBJECT CATEGORIES (4 hovedkategorier)
// =============================================================================

export const rentalObjectCategories = pgTable('rental_object_categories', {
  key: varchar('key', { length: 50 }).primaryKey(), // LOKALER_OG_BANER, etc
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  defaultTimeMode: varchar('default_time_mode', { length: 20 }).notNull().default('PERIOD'),
  allowedTimeModes: jsonb('allowed_time_modes').notNull().default(['PERIOD', 'SLOT', 'ALL_DAY']),
  allowedFeatures: jsonb('allowed_features').notNull().default([]),
  uiIcon: varchar('ui_icon', { length: 50 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

// =============================================================================
// BOOKING TIME MODES (3 tidsmoduser)
// =============================================================================

export const bookingTimeModes = pgTable('booking_time_modes', {
  key: varchar('key', { length: 20 }).primaryKey(), // PERIOD, SLOT, ALL_DAY
  titleNb: varchar('title_nb', { length: 50 }).notNull(),
  titleEn: varchar('title_en', { length: 50 }).notNull(),
  calendarUiVariant: varchar('calendar_ui_variant', { length: 30 }).notNull(), // timeline, slot-grid, day-cards
  sortOrder: integer('sort_order').notNull().default(0),
});

// =============================================================================
// RENTAL OBJECT FEATURES (tilleggsfunksjoner)
// =============================================================================

export const rentalObjectFeatures = pgTable('rental_object_features', {
  key: varchar('key', { length: 50 }).primaryKey(), // INVENTORY, SHARED_CAPACITY, PACKAGES
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  description: text('description'),
});

// =============================================================================
// RULE SETS (gjenbrukbare regler)
// =============================================================================

export const ruleSets = pgTable('rule_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 50 }).notNull().unique(), // RS_LOKALE_STANDARD, etc
  titleNb: varchar('title_nb', { length: 100 }).notNull(),
  titleEn: varchar('title_en', { length: 100 }).notNull(),
  timeMode: varchar('time_mode', { length: 20 }).notNull(),
  rules: jsonb('rules').notNull().default({}), // Flexible rule config
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type RentalObjectCategory = typeof rentalObjectCategories.$inferSelect;
export type BookingTimeMode = typeof bookingTimeModes.$inferSelect;
export type RentalObjectFeature = typeof rentalObjectFeatures.$inferSelect;
export type RuleSet = typeof ruleSets.$inferSelect;
