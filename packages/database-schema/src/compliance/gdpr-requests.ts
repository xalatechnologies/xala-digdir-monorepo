/**
 * GDPR Requests Table
 * Tracks data subject access requests, deletion requests, etc.
 */

import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { complianceSchema } from '../schemas';
import { tenants, users } from '../core';

export const gdprRequests = complianceSchema.table('gdpr_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'set null' }),
  
  // Request details
  requestType: varchar('request_type', { length: 50 }).notNull(), // 'access', 'deletion', 'rectification', 'portability'
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'rejected'
  priority: varchar('priority', { length: 20 }).default('normal'), // 'low', 'normal', 'high', 'urgent'
  
  // Requester information
  requesterEmail: varchar('requester_email', { length: 255 }).notNull(),
  requesterName: varchar('requester_name', { length: 255 }),
  requesterNationalId: varchar('requester_national_id', { length: 11 }),
  
  // Request content
  description: text('description'),
  requestData: jsonb('request_data').default('{}'), // Additional structured data
  
  // Processing
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  processingNotes: text('processing_notes'),
  responseData: jsonb('response_data').default('{}'), // Response/export data
  
  // Compliance tracking
  dueDate: timestamp('due_date'), // Legal deadline (typically 30 days)
  completedAt: timestamp('completed_at'),
  rejectionReason: text('rejection_reason'),
  
  // Metadata
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type GdprRequest = typeof gdprRequests.$inferSelect;
export type NewGdprRequest = typeof gdprRequests.$inferInsert;
