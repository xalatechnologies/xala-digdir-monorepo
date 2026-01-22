/**
 * Core Tables: Organizations
 * Kommune/organization management
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
import { platformSchema } from '../schemas';
import { tenants } from './tenants';

export const organizations = platformSchema.table('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  orgNumber: varchar('org_number', { length: 20 }), // Norwegian org number
  type: varchar('type', { length: 50 }).default('kommune'),
  logoUrl: text('logo_url'),
  website: text('website'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: jsonb('address').default({}),
  settings: jsonb('settings').default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('organizations_tenant_idx').on(table.tenantId),
  slugIdx: index('organizations_slug_idx').on(table.tenantId, table.slug),
  orgNumberIdx: index('organizations_org_number_idx').on(table.orgNumber),
}));

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
