/**
 * Monitoring Zod Schemas
 * Validation schemas for audit, alerts, and incidents
 */
import { z } from 'zod';

// ============================================================================
// Audit Log Schemas
// ============================================================================

export const AuditSeveritySchema = z.enum(['debug', 'info', 'warn', 'error', 'critical']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional().nullable(),
  userId: z.string().uuid().optional().nullable(),
  action: z.string().max(100),
  resource: z.string().max(100),
  resourceId: z.string().max(255).optional().nullable(),
  severity: AuditSeveritySchema.default('info'),
  metadata: z.record(z.unknown()).optional().default({}),
  ipAddress: z.string().ip().optional().nullable(),
  userAgent: z.string().optional().nullable(),
  timestamp: z.coerce.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const CreateAuditLogSchema = z.object({
  action: z.string().max(100),
  resource: z.string().max(100),
  resourceId: z.string().max(255).optional(),
  severity: AuditSeveritySchema.optional().default('info'),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateAuditLogDTO = z.infer<typeof CreateAuditLogSchema>;

export const AuditLogQuerySchema = z.object({
  action: z.string().optional(),
  resource: z.string().optional(),
  userId: z.string().uuid().optional(),
  tenantId: z.string().uuid().optional(),
  severity: AuditSeveritySchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type AuditLogQueryParams = z.infer<typeof AuditLogQuerySchema>;

// ============================================================================
// Alert Schemas
// ============================================================================

export const AlertTypeSchema = z.enum(['threshold', 'anomaly', 'pattern', 'event']);
export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertSeveritySchema = z.enum(['info', 'warning', 'error', 'critical']);
export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;

export const AlertConditionSchema = z.object({
  metric: z.string(),
  operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq', 'ne']),
  threshold: z.number(),
  duration: z.number().optional(), // seconds
});

export type AlertCondition = z.infer<typeof AlertConditionSchema>;

export const AlertSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(255),
  type: AlertTypeSchema.default('threshold'),
  condition: AlertConditionSchema,
  severity: AlertSeveritySchema.default('warning'),
  enabled: z.boolean().default(true),
  channels: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional().default({}),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Alert = z.infer<typeof AlertSchema>;

export const CreateAlertSchema = z.object({
  name: z.string().min(1).max(255),
  type: AlertTypeSchema.optional().default('threshold'),
  condition: AlertConditionSchema,
  severity: AlertSeveritySchema.optional().default('warning'),
  enabled: z.boolean().optional().default(true),
  channels: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateAlertDTO = z.infer<typeof CreateAlertSchema>;

export const UpdateAlertSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  condition: AlertConditionSchema.optional(),
  severity: AlertSeveritySchema.optional(),
  enabled: z.boolean().optional(),
  channels: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type UpdateAlertDTO = z.infer<typeof UpdateAlertSchema>;

// ============================================================================
// Incident Schemas
// ============================================================================

export const IncidentStatusSchema = z.enum(['open', 'investigating', 'identified', 'monitoring', 'resolved']);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

export const IncidentSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentTimelineEntrySchema = z.object({
  timestamp: z.coerce.date(),
  status: IncidentStatusSchema,
  message: z.string(),
  userId: z.string().uuid().optional(),
});

export type IncidentTimelineEntry = z.infer<typeof IncidentTimelineEntrySchema>;

export const IncidentSchema = z.object({
  id: z.string().uuid(),
  alertId: z.string().uuid().optional().nullable(),
  title: z.string().max(255),
  description: z.string().optional().nullable(),
  status: IncidentStatusSchema.default('open'),
  severity: IncidentSeveritySchema.default('medium'),
  affectedServices: z.array(z.string()).default([]),
  assignee: z.string().max(255).optional().nullable(),
  timeline: z.array(IncidentTimelineEntrySchema).default([]),
  resolvedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Incident = z.infer<typeof IncidentSchema>;

export const CreateIncidentSchema = z.object({
  alertId: z.string().uuid().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  severity: IncidentSeveritySchema.optional().default('medium'),
  affectedServices: z.array(z.string()).optional(),
  assignee: z.string().max(255).optional(),
});

export type CreateIncidentDTO = z.infer<typeof CreateIncidentSchema>;

export const UpdateIncidentStatusSchema = z.object({
  status: IncidentStatusSchema,
  message: z.string().max(1000).optional(),
});

export type UpdateIncidentStatusDTO = z.infer<typeof UpdateIncidentStatusSchema>;

export const AddIncidentCommentSchema = z.object({
  message: z.string().min(1).max(1000),
});

export type AddIncidentCommentDTO = z.infer<typeof AddIncidentCommentSchema>;
