/**
 * Compliance Tables: Audit Logs
 * Audit and compliance tracking
 *
 * Platform-agnostic audit logging for any SaaS application.
 */
import {
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { complianceSchema } from '../schemas';
import { tenants, users } from '../core';

export const auditLogs = complianceSchema.table('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }),
  severity: varchar('severity', { length: 20 }).notNull().default('info'),
  metadata: jsonb('metadata').default({}),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('audit_logs_tenant_idx').on(table.tenantId, table.timestamp),
  resourceIdx: index('audit_logs_resource_idx').on(table.resource, table.resourceId),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
