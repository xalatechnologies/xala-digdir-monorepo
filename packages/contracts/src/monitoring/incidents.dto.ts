/**
 * Incidents DTOs
 * System incident tracking and management
 */

export interface IncidentDTO {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  impactedTenants?: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'acknowledged';

export interface CreateIncidentDTO {
  title: string;
  description: string;
  severity: IncidentSeverity;
  affectedServices: string[];
  impactedTenants?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  affectedServices?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AcknowledgeIncidentDTO {
  acknowledgedBy: string;
  notes?: string;
}

export interface ResolveIncidentDTO {
  resolvedBy: string;
  resolution: string;
  rootCause?: string;
}

export interface IncidentFilterDTO {
  severity?: IncidentSeverity[];
  status?: IncidentStatus[];
  affectedServices?: string[];
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IncidentListResponseDTO {
  data: IncidentDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
