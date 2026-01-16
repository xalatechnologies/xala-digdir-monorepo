/**
 * Notification Zod Schemas
 * Validation schemas for notification domain
 */
import { z } from 'zod';

/**
 * Notification Type Enum
 */
export const NotificationTypeSchema = z.enum(['email', 'sms']);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

/**
 * Notification Status Enum
 */
export const NotificationStatusSchema = z.enum(['pending', 'sent', 'delivered', 'failed', 'cancelled']);
export type NotificationStatus = z.infer<typeof NotificationStatusSchema>;

/**
 * Send Notification DTO
 */
export const SendNotificationSchema = z.object({
  userId: z.string().uuid().optional(),
  type: NotificationTypeSchema,
  recipient: z.string().min(1).max(255),
  subject: z.string().max(500).optional(),
  body: z.string().min(1).max(10000),
  metadata: z.record(z.unknown()).optional(),
});

export type SendNotificationDTO = z.infer<typeof SendNotificationSchema>;

/**
 * Delivery Report Query Params
 */
export const DeliveryReportQuerySchema = z.object({
  status: NotificationStatusSchema.optional(),
  type: NotificationTypeSchema.optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type DeliveryReportQueryParams = z.infer<typeof DeliveryReportQuerySchema>;

/**
 * Delivery Attempt Status Enum
 */
export const DeliveryAttemptStatusSchema = z.enum(['success', 'failed', 'retrying']);
export type DeliveryAttemptStatus = z.infer<typeof DeliveryAttemptStatusSchema>;

/**
 * Full Notification Schema
 */
export const NotificationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  type: NotificationTypeSchema,
  recipient: z.string().min(1).max(255),
  subject: z.string().max(500).optional().nullable(),
  body: z.string().min(1),
  contentHash: z.string().length(64),
  status: NotificationStatusSchema.default('pending'),
  sentAt: z.coerce.date().optional().nullable(),
  deliveredAt: z.coerce.date().optional().nullable(),
  failedAt: z.coerce.date().optional().nullable(),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Delivery Attempt Schema
 */
export const DeliveryAttemptSchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid(),
  attemptNumber: z.number().int().positive(),
  status: DeliveryAttemptStatusSchema,
  error: z.string().optional().nullable(),
  retriedAt: z.coerce.date(),
  nextRetryAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
});

export type DeliveryAttempt = z.infer<typeof DeliveryAttemptSchema>;

/**
 * Update Notification Status DTO
 */
export const UpdateNotificationStatusSchema = z.object({
  status: NotificationStatusSchema,
  sentAt: z.coerce.date().optional(),
  deliveredAt: z.coerce.date().optional(),
  failedAt: z.coerce.date().optional(),
});

export type UpdateNotificationStatusDTO = z.infer<typeof UpdateNotificationStatusSchema>;

/**
 * Create Delivery Attempt DTO
 */
export const CreateDeliveryAttemptSchema = z.object({
  notificationId: z.string().uuid(),
  attemptNumber: z.number().int().positive(),
  status: DeliveryAttemptStatusSchema,
  error: z.string().optional(),
  nextRetryAt: z.coerce.date().optional(),
});

export type CreateDeliveryAttemptDTO = z.infer<typeof CreateDeliveryAttemptSchema>;
