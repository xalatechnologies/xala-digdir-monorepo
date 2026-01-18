/**
 * Platform Tables: Sessions
 * Authentication and session management
 */
import {
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { platformSchema } from '../schemas';
import { tenants, users } from '../core';

export const sessions = platformSchema.table('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull().unique(),
  accessTokenJti: text('access_token_jti'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastRefreshedAt: timestamp('last_refreshed_at'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  revokedReason: text('revoked_reason'),
}, (table) => ({
  userIdx: index('sessions_user_idx').on(table.userId),
  tenantIdx: index('sessions_tenant_idx').on(table.tenantId),
  refreshTokenHashIdx: index('sessions_refresh_token_hash_idx').on(table.refreshTokenHash),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  userTenantIdx: index('sessions_user_tenant_idx').on(table.userId, table.tenantId),
}));

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
