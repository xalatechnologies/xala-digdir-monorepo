/**
 * Domain Tables: Allocations and Blocks
 * Used for calendar availability management - blocks, blackouts, and reserved periods
 * Depends on: core/tenants, core/users, domain/rental-objects, domain/bookings
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  index,
} from 'drizzle-orm/pg-core';
import { domainSchema } from '../schemas';
import { tenants, users } from '../core';
import { rentalObjects } from './rental-objects';
import { bookings } from './bookings';

// =============================================================================
// Allocations Table
// Represents time blocks on the calendar (confirmed bookings, blocks, blackouts)
// =============================================================================
export const allocations = domainSchema.table('allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('confirmed'),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  notes: text('notes'),
  recurring: jsonb('recurring').default({}),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('allocations_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('allocations_rental_object_idx').on(table.rentalObjectId),
  timeIdx: index('allocations_time_idx').on(table.startTime, table.endTime),
}));

export type Allocation = typeof allocations.$inferSelect;
export type NewAllocation = typeof allocations.$inferInsert;

// =============================================================================
// Blocks Table
// Represents explicit blocks/blackouts on the calendar (maintenance, holidays, etc.)
// =============================================================================
export const blocks = domainSchema.table('blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  reason: text('reason'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  allDay: boolean('all_day').notNull().default(false),
  recurring: boolean('recurring').notNull().default(false),
  recurrenceRule: text('recurrence_rule'),
  visibility: varchar('visibility', { length: 20 }).notNull().default('public'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('blocks_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('blocks_rental_object_idx').on(table.rentalObjectId),
  timeRangeIdx: index('blocks_time_range_idx').on(table.startDate, table.endDate),
  statusIdx: index('blocks_status_idx').on(table.status),
}));

export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
