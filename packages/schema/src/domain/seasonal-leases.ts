/**
 * Domain Tables: Seasonal Leases
 * Depends on: core/tenants, core/organizations, domain/rental-objects
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  decimal,
  index,
} from 'drizzle-orm/pg-core';
import { domainSchema } from '../schemas';
import { tenants, organizations } from '../core';
import { rentalObjects } from './rental-objects';

export const seasonalLeases = domainSchema.table('seasonal_leases', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  rentalObjectId: uuid('rental_object_id').notNull().references(() => rentalObjects.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  weekdays: jsonb('weekdays').default([]),
  startTime: varchar('start_time', { length: 10 }).notNull(),
  endTime: varchar('end_time', { length: 10 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).notNull().default('NOK'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('seasonal_leases_tenant_idx').on(table.tenantId),
  rentalObjectIdx: index('seasonal_leases_rental_object_idx').on(table.rentalObjectId),
  orgIdx: index('seasonal_leases_org_idx').on(table.organizationId),
}));

export type SeasonalLease = typeof seasonalLeases.$inferSelect;
export type NewSeasonalLease = typeof seasonalLeases.$inferInsert;
