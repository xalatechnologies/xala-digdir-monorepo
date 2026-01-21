/**
 * Platform Tables: Auth Demo Tokens
 * Secure demo login tokens mapped to roles
 *
 * Platform-agnostic demo authentication for any SaaS application.
 */
import {
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { platformSchema } from '../schemas';
import { tenants, users, organizations } from '../core';

export const authDemoTokens = platformSchema.table('auth_demo_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 50 }).notNull().unique(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyIdx: uniqueIndex('auth_demo_tokens_key_idx').on(table.key),
  tenantIdx: index('auth_demo_tokens_tenant_idx').on(table.tenantId),
  userIdx: index('auth_demo_tokens_user_idx').on(table.userId),
  activeIdx: index('auth_demo_tokens_active_idx').on(table.isActive),
}));

export type AuthDemoToken = typeof authDemoTokens.$inferSelect;
export type NewAuthDemoToken = typeof authDemoTokens.$inferInsert;
