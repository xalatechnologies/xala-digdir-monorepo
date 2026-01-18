/**
 * GDPR Requests Schema
 * Tracks data subject rights requests (export, deletion)
 */
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { tenants, users } from './base-tables';

export const gdprRequests = pgTable('gdpr_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestType: varchar('request_type', { length: 50 }).notNull(), // 'export' | 'deletion'
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  processedBy: uuid('processed_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at').notNull(), // 30 days from request for GDPR compliance
  metadata: jsonb('metadata').default({}),
}, (table) => ({
  tenantIdx: index('gdpr_requests_tenant_idx').on(table.tenantId),
  userIdx: index('gdpr_requests_user_idx').on(table.userId),
  statusIdx: index('gdpr_requests_status_idx').on(table.status),
  tenantStatusIdx: index('gdpr_requests_tenant_status_idx').on(table.tenantId, table.status),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type GdprRequest = typeof gdprRequests.$inferSelect;
export type NewGdprRequest = typeof gdprRequests.$inferInsert;
