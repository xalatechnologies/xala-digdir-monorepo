/**
 * Core Tables: Users
 * User identity and profile information
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

export const users = platformSchema.table('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  externalId: varchar('external_id', { length: 255 }), // ID-porten PID
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  displayName: varchar('display_name', { length: 200 }),
  avatarUrl: text('avatar_url'),
  locale: varchar('locale', { length: 10 }).default('nb'),
  timezone: varchar('timezone', { length: 50 }).default('Europe/Oslo'),
  preferences: jsonb('preferences').default({}),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('users_tenant_idx').on(table.tenantId),
  emailIdx: index('users_email_idx').on(table.email),
  externalIdIdx: index('users_external_id_idx').on(table.externalId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
