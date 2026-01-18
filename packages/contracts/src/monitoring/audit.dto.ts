/**
 * Audit Correlation DTOs
 * Audit log correlation and analysis
 */

export interface AuditCorrelationDTO {
  correlationId: string;
  events: AuditEventDTO[];
  timeline: AuditTimelineDTO;
  relatedIncidents: string[];
  summary: AuditCorrelationSummaryDTO;
}

export interface AuditEventDTO {
  id: string;
  timestamp: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditTimelineDTO {
  startTime: string;
  endTime: string;
  duration: number;
  eventCount: number;
  events: AuditTimelineEventDTO[];
}

export interface AuditTimelineEventDTO {
  timestamp: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
}

export interface AuditCorrelationSummaryDTO {
  totalEvents: number;
  successCount: number;
  failureCount: number;
  uniqueUsers: number;
  uniqueResources: number;
  affectedTenants: string[];
}

export interface AuditFilterDTO {
  correlationId?: string;
  action?: string[];
  resource?: string[];
  userId?: string;
  tenantId?: string;
  status?: ('success' | 'failure')[];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AuditListResponseDTO {
  data: AuditEventDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditStatisticsDTO {
  totalEvents: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byStatus: Record<'success' | 'failure', number>;
  topUsers: Array<{ userId: string; count: number }>;
  recentActivity: AuditEventDTO[];
}
