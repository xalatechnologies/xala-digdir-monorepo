/**
 * Domain Tables: Bookings
 * Depends on: core/tenants, core/users, core/organizations, domain/rental-objects
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  decimal,
  index,
  integer,
} from 'drizzle-orm/pg-core';
import { domainSchema } from '../schemas';
import { tenants, users, organizations } from '../core';
import { rentalObjects } from './rental-objects';

export const bookings = domainSchema.table('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  version: integer('version').notNull().default(1),
  submittedAt: timestamp('submitted_at'),
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('bookings_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('bookings_rental_object_idx').on(table.rentalObjectId),
  userIdx: index('bookings_user_idx').on(table.userId),
  statusIdx: index('bookings_status_idx').on(table.status),
  organizationIdx: index('bookings_organization_idx').on(table.organizationId),
  approvalQueueIdx: index('bookings_approval_queue_idx').on(table.tenantId, table.status, table.startTime),
  timeRangeIdx: index('bookings_time_range_idx').on(table.rentalObjectId, table.startTime, table.endTime),
}));

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
