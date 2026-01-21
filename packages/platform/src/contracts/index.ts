/**
 * @xalatechnologies/platform/contracts
 *
 * API contracts: Zod schemas, TypeScript types, and projections
 *
 * Provides:
 * - Validation schemas (Zod) for API requests/responses
 * - Projection schemas for UI-ready DTOs
 * - TypeScript types inferred from schemas
 * - RFC 7807 Problem Details schema
 *
 * @example
 * ```tsx
 * import {
 *   CreateBookingSchema,
 *   BookingProjection,
 *   ProblemDetailsSchema,
 * } from '@xalatechnologies/platform/contracts';
 *
 * // Validate input
 * const result = CreateBookingSchema.safeParse(input);
 * if (!result.success) {
 *   console.error(result.error);
 * }
 *
 * // Use projection type
 * function BookingCard({ booking }: { booking: BookingProjection }) {
 *   return <Card>{booking.title}</Card>;
 * }
 * ```
 */

import { z } from 'zod';

// Common schemas
export const UUIDSchema = z.string().uuid();
export const SlugSchema = z.string().regex(/^[a-z0-9-]+$/);
export const EmailSchema = z.string().email();
export const DateSchema = z.string().datetime();

// Metadata schema (key-value store for extensibility)
export const MetadataSchema = z.record(z.unknown()).optional().default({});
export type Metadata = z.infer<typeof MetadataSchema>;

// Timestamps schema (for audit)
export const TimestampsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Timestamps = z.infer<typeof TimestampsSchema>;

// ISO 4217 Currency codes
export const CurrencyCodeSchema = z.enum(['NOK', 'SEK', 'DKK', 'EUR', 'USD', 'GBP']);
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Sort order schema
export const SortOrderSchema = z.enum(['asc', 'desc']);
export type SortOrder = z.infer<typeof SortOrderSchema>;

// RFC 7807 Problem Details
export const ProblemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  correlationId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

// Paginated response schema factory
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  });
}

// =============================================================================
// Custody/Delegation Contracts (Platform Access Control)
// =============================================================================

export const CustodyScopeSchema = z.enum(['CUSTODY', 'VIEW', 'MANAGE', 'ADMIN']);
export type CustodyScope = z.infer<typeof CustodyScopeSchema>;

export const CustodyGrantStatusSchema = z.enum(['ACTIVE', 'PENDING', 'REVOKED', 'EXPIRED']);
export type CustodyGrantStatus = z.infer<typeof CustodyGrantStatusSchema>;

export const CustodyGrantSchema = z.object({
  id: UUIDSchema,
  resourceId: UUIDSchema,
  resourceType: z.string(),
  granteeId: UUIDSchema,
  granteeType: z.enum(['user', 'organization', 'group']),
  scopes: z.array(CustodyScopeSchema),
  status: CustodyGrantStatusSchema,
  grantedBy: UUIDSchema,
  grantedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  metadata: MetadataSchema,
});
export type CustodyGrant = z.infer<typeof CustodyGrantSchema>;

export const CustodySubgrantSchema = z.object({
  id: UUIDSchema,
  parentGrantId: UUIDSchema,
  granteeId: UUIDSchema,
  granteeType: z.enum(['user', 'organization', 'group']),
  scope: CustodyScopeSchema,
  grantedBy: UUIDSchema,
  grantedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  metadata: MetadataSchema,
});
export type CustodySubgrant = z.infer<typeof CustodySubgrantSchema>;

export const CreateCustodyGrantDTOSchema = z.object({
  granteeId: UUIDSchema,
  granteeType: z.enum(['user', 'organization', 'group']),
  scopes: z.array(CustodyScopeSchema),
  expiresAt: z.coerce.date().optional(),
  metadata: MetadataSchema,
});
export type CreateCustodyGrantDTO = z.infer<typeof CreateCustodyGrantDTOSchema>;

export const CreateCustodySubgrantDTOSchema = z.object({
  parentGrantId: UUIDSchema,
  granteeId: UUIDSchema,
  granteeType: z.enum(['user', 'organization', 'group']),
  scopes: z.array(CustodyScopeSchema),
  expiresAt: z.coerce.date().optional(),
  metadata: MetadataSchema,
});
export type CreateCustodySubgrantDTO = z.infer<typeof CreateCustodySubgrantDTOSchema>;

export const BulkAssignCustodyGrantDTOSchema = z.object({
  resourceId: UUIDSchema,
  resourceType: z.string(),
  grants: z.array(CreateCustodyGrantDTOSchema),
});
export type BulkAssignCustodyGrantDTO = z.infer<typeof BulkAssignCustodyGrantDTOSchema>;

// =============================================================================
// Monitoring Contracts (Platform Observability)
// =============================================================================

// Incident severity and status enums
export const IncidentSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type IncidentSeverity = z.infer<typeof IncidentSeveritySchema>;

export const IncidentStatusSchema = z.enum(['open', 'acknowledged', 'investigating', 'resolved', 'closed']);
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;

// Incident DTO
export const IncidentDTOSchema = z.object({
  id: UUIDSchema,
  title: z.string(),
  description: z.string().optional(),
  severity: IncidentSeveritySchema,
  status: IncidentStatusSchema,
  source: z.string(),
  affectedServices: z.array(z.string()).optional(),
  tenantId: UUIDSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  acknowledgedAt: z.coerce.date().optional(),
  acknowledgedBy: UUIDSchema.optional(),
  resolvedAt: z.coerce.date().optional(),
  resolvedBy: UUIDSchema.optional(),
  resolution: z.string().optional(),
  metadata: MetadataSchema,
});
export type IncidentDTO = z.infer<typeof IncidentDTOSchema>;

export const IncidentListResponseDTOSchema = z.object({
  data: z.array(IncidentDTOSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type IncidentListResponseDTO = z.infer<typeof IncidentListResponseDTOSchema>;

export const IncidentFilterDTOSchema = z.object({
  status: IncidentStatusSchema.optional(),
  severity: IncidentSeveritySchema.optional(),
  source: z.string().optional(),
  tenantId: UUIDSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type IncidentFilterDTO = z.infer<typeof IncidentFilterDTOSchema>;

export const CreateIncidentDTOSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  severity: IncidentSeveritySchema,
  source: z.string(),
  affectedServices: z.array(z.string()).optional(),
  tenantId: UUIDSchema.optional(),
  metadata: MetadataSchema,
});
export type CreateIncidentDTO = z.infer<typeof CreateIncidentDTOSchema>;

export const UpdateIncidentDTOSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  severity: IncidentSeveritySchema.optional(),
  status: IncidentStatusSchema.optional(),
  affectedServices: z.array(z.string()).optional(),
  metadata: MetadataSchema,
});
export type UpdateIncidentDTO = z.infer<typeof UpdateIncidentDTOSchema>;

export const AcknowledgeIncidentDTOSchema = z.object({
  acknowledgedBy: UUIDSchema,
  notes: z.string().optional(),
});
export type AcknowledgeIncidentDTO = z.infer<typeof AcknowledgeIncidentDTOSchema>;

export const ResolveIncidentDTOSchema = z.object({
  resolvedBy: UUIDSchema,
  resolution: z.string(),
  rootCause: z.string().optional(),
});
export type ResolveIncidentDTO = z.infer<typeof ResolveIncidentDTOSchema>;

// Synthetic Monitor DTOs
export const SyntheticMonitorStatusSchema = z.enum(['active', 'paused', 'disabled']);
export type SyntheticMonitorStatus = z.infer<typeof SyntheticMonitorStatusSchema>;

export const SyntheticMonitorDTOSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  interval: z.number(), // in seconds
  timeout: z.number(), // in milliseconds
  status: SyntheticMonitorStatusSchema,
  lastRunAt: z.coerce.date().optional(),
  lastStatus: z.enum(['success', 'failure', 'timeout']).optional(),
  lastResponseTime: z.number().optional(), // in milliseconds
  tenantId: UUIDSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  metadata: MetadataSchema,
});
export type SyntheticMonitorDTO = z.infer<typeof SyntheticMonitorDTOSchema>;

export const SyntheticMonitorListResponseDTOSchema = z.object({
  data: z.array(SyntheticMonitorDTOSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type SyntheticMonitorListResponseDTO = z.infer<typeof SyntheticMonitorListResponseDTOSchema>;

export const SyntheticRunDTOSchema = z.object({
  id: UUIDSchema,
  monitorId: UUIDSchema,
  status: z.enum(['success', 'failure', 'timeout']),
  responseTime: z.number(), // in milliseconds
  statusCode: z.number().optional(),
  error: z.string().optional(),
  runAt: z.coerce.date(),
});
export type SyntheticRunDTO = z.infer<typeof SyntheticRunDTOSchema>;

export const SyntheticRunListResponseDTOSchema = z.object({
  data: z.array(SyntheticRunDTOSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type SyntheticRunListResponseDTO = z.infer<typeof SyntheticRunListResponseDTOSchema>;

export const CreateSyntheticMonitorDTOSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD']).default('GET'),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  interval: z.number(), // in seconds
  timeout: z.number(), // in milliseconds
  tenantId: UUIDSchema.optional(),
  metadata: MetadataSchema,
});
export type CreateSyntheticMonitorDTO = z.infer<typeof CreateSyntheticMonitorDTOSchema>;

export const UpdateSyntheticMonitorDTOSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'HEAD']).optional(),
  headers: z.record(z.string()).optional(),
  body: z.string().optional(),
  interval: z.number().optional(),
  timeout: z.number().optional(),
  status: SyntheticMonitorStatusSchema.optional(),
  metadata: MetadataSchema,
});
export type UpdateSyntheticMonitorDTO = z.infer<typeof UpdateSyntheticMonitorDTOSchema>;

// Grafana Integration DTOs
export const GrafanaDashboardSummarySchema = z.object({
  uid: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  starred: z.boolean().optional(),
  url: z.string().optional(),
});
export type GrafanaDashboardSummary = z.infer<typeof GrafanaDashboardSummarySchema>;

export const GrafanaDashboardListDTOSchema = z.object({
  dashboards: z.array(GrafanaDashboardSummarySchema),
});
export type GrafanaDashboardListDTO = z.infer<typeof GrafanaDashboardListDTOSchema>;

export const GrafanaPanelSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.string(),
  gridPos: z.object({
    h: z.number(),
    w: z.number(),
    x: z.number(),
    y: z.number(),
  }).optional(),
});
export type GrafanaPanel = z.infer<typeof GrafanaPanelSchema>;

export const GrafanaDashboardDTOSchema = z.object({
  uid: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  panels: z.array(GrafanaPanelSchema).optional(),
  url: z.string().optional(),
  version: z.number().optional(),
});
export type GrafanaDashboardDTO = z.infer<typeof GrafanaDashboardDTOSchema>;

export const GrafanaQueryRequestDTOSchema = z.object({
  dashboardUid: z.string(),
  panelId: z.number(),
  from: z.string(), // time range start
  to: z.string(), // time range end
  maxDataPoints: z.number().optional(),
});
export type GrafanaQueryRequestDTO = z.infer<typeof GrafanaQueryRequestDTOSchema>;

export const GrafanaQueryResponseDTOSchema = z.object({
  frames: z.array(z.object({
    name: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      values: z.array(z.unknown()),
    })),
  })),
});
export type GrafanaQueryResponseDTO = z.infer<typeof GrafanaQueryResponseDTOSchema>;

// Log DTOs
export const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'fatal']);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const LogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.coerce.date(),
  level: LogLevelSchema,
  message: z.string(),
  service: z.string(),
  tenantId: UUIDSchema.optional(),
  correlationId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type LogEntry = z.infer<typeof LogEntrySchema>;

export const LogListResponseDTOSchema = z.object({
  data: z.array(LogEntrySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type LogListResponseDTO = z.infer<typeof LogListResponseDTOSchema>;

export const LogFilterDTOSchema = z.object({
  level: LogLevelSchema.optional(),
  service: z.string().optional(),
  tenantId: UUIDSchema.optional(),
  correlationId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type LogFilterDTO = z.infer<typeof LogFilterDTOSchema>;

export const LogStatisticsDTOSchema = z.object({
  totalCount: z.number(),
  byLevel: z.record(z.number()),
  byService: z.record(z.number()),
  byHour: z.array(z.object({
    hour: z.string(),
    count: z.number(),
  })),
});
export type LogStatisticsDTO = z.infer<typeof LogStatisticsDTOSchema>;

// Audit DTOs (monitoring-specific, not GDPR audit)
export const AuditEventMonitoringSchema = z.object({
  id: UUIDSchema,
  timestamp: z.coerce.date(),
  action: z.string(),
  actor: z.object({
    id: UUIDSchema,
    type: z.enum(['user', 'system', 'service']),
    name: z.string().optional(),
  }),
  resource: z.object({
    id: z.string(),
    type: z.string(),
    name: z.string().optional(),
  }),
  tenantId: UUIDSchema.optional(),
  correlationId: z.string().optional(),
  changes: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type AuditEventMonitoring = z.infer<typeof AuditEventMonitoringSchema>;

export const AuditListResponseDTOSchema = z.object({
  data: z.array(AuditEventMonitoringSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
export type AuditListResponseDTO = z.infer<typeof AuditListResponseDTOSchema>;

export const AuditFilterDTOSchema = z.object({
  action: z.string().optional(),
  actorId: UUIDSchema.optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  tenantId: UUIDSchema.optional(),
  correlationId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
export type AuditFilterDTO = z.infer<typeof AuditFilterDTOSchema>;

export const AuditCorrelationDTOSchema = z.object({
  correlationId: z.string(),
  events: z.array(AuditEventMonitoringSchema),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number(), // in milliseconds
});
export type AuditCorrelationDTO = z.infer<typeof AuditCorrelationDTOSchema>;

export const AuditStatisticsDTOSchema = z.object({
  totalCount: z.number(),
  byAction: z.record(z.number()),
  byResourceType: z.record(z.number()),
  byActor: z.record(z.number()),
  byHour: z.array(z.object({
    hour: z.string(),
    count: z.number(),
  })),
});
export type AuditStatisticsDTO = z.infer<typeof AuditStatisticsDTOSchema>;

// Monitoring Overview DTO
export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const ServiceHealthSchema = z.object({
  name: z.string(),
  status: HealthStatusSchema,
  latency: z.number().optional(), // in milliseconds
  uptime: z.number().optional(), // percentage
  lastCheck: z.coerce.date().optional(),
  message: z.string().optional(),
});
export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;

export const MonitoringOverviewDTOSchema = z.object({
  systemStatus: HealthStatusSchema,
  services: z.array(ServiceHealthSchema),
  incidents: z.object({
    open: z.number(),
    critical: z.number(),
    recent: z.array(IncidentDTOSchema.pick({
      id: true,
      title: true,
      severity: true,
      status: true,
      createdAt: true,
    })),
  }),
  metrics: z.object({
    requestsPerMinute: z.number().optional(),
    averageLatency: z.number().optional(),
    errorRate: z.number().optional(),
    activeUsers: z.number().optional(),
  }),
  alerts: z.array(z.object({
    id: z.string(),
    message: z.string(),
    severity: IncidentSeveritySchema,
    timestamp: z.coerce.date(),
  })).optional(),
});
export type MonitoringOverviewDTO = z.infer<typeof MonitoringOverviewDTOSchema>;

// TODO: Migrate from @xala/contracts
// Schemas
// export * from './schemas';

// Projections
// export * from './projections';

// Types
// export * from './types';
