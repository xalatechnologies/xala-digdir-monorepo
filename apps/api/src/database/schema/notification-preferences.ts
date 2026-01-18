/**
 * Notification Preferences Schema
 * User notification preferences and settings
 */

import {
  pgTable,
  uuid,
  boolean,
  time,
  varchar,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users, tenants } from './base-tables';
import { domainSchema } from './schemas';

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * User notification preferences per tenant
 * Controls which channels and notification types a user receives
 */
export const notificationPreferences = domainSchema.table('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Channel preferences (global toggles)
  inAppEnabled: boolean('in_app_enabled').notNull().default(true),
  emailEnabled: boolean('email_enabled').notNull().default(true),
  smsEnabled: boolean('sms_enabled').notNull().default(false),
  pushEnabled: boolean('push_enabled').notNull().default(true),

  // Notification type preferences
  bookingCreated: boolean('booking_created').notNull().default(true),
  bookingApproved: boolean('booking_approved').notNull().default(true),
  bookingRejected: boolean('booking_rejected').notNull().default(true),
  bookingCancelled: boolean('booking_cancelled').notNull().default(true),
  bookingChanged: boolean('booking_changed').notNull().default(true),

  reminder24h: boolean('reminder_24h').notNull().default(true),
  reminder2h: boolean('reminder_2h').notNull().default(true),

  systemNotifications: boolean('system_notifications').notNull().default(true),
  adminMessages: boolean('admin_messages').notNull().default(true),

  invoiceAvailable: boolean('invoice_available').notNull().default(true),
  paymentStatus: boolean('payment_status').notNull().default(true),

  // Advanced settings
  quietHoursStart: time('quiet_hours_start'),
  quietHoursEnd: time('quiet_hours_end'),
  quietHoursTimezone: varchar('quiet_hours_timezone', { length: 50 }).default('Europe/Oslo'),

  // Metadata
  metadata: jsonb('metadata').default({}),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('notification_preferences_user_idx').on(table.userId),
  tenantIdx: index('notification_preferences_tenant_idx').on(table.tenantId),
  userTenantIdx: index('notification_preferences_user_tenant_idx').on(table.userId, table.tenantId),
  userTenantUnique: unique('notification_preferences_user_tenant_unique').on(table.userId, table.tenantId),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
