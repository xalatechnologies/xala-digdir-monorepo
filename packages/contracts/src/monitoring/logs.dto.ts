/**
 * Logs DTOs
 * System log viewing and filtering
 */

export interface LogEntryDTO {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  tenantId?: string;
  userId?: string;
  requestId?: string;
  context?: Record<string, unknown>;
  stackTrace?: string;
  tags: string[];
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogFilterDTO {
  level?: LogLevel[];
  service?: string[];
  tenantId?: string;
  userId?: string;
  requestId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface LogListResponseDTO {
  data: LogEntryDTO[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LogStatisticsDTO {
  totalLogs: number;
  byLevel: Record<LogLevel, number>;
  byService: Record<string, number>;
  errorRate: number;
  topErrors: LogErrorSummaryDTO[];
}

export interface LogErrorSummaryDTO {
  message: string;
  count: number;
  lastOccurrence: string;
  service: string;
}

export interface LogExportRequestDTO {
  filter: LogFilterDTO;
  format: 'json' | 'csv' | 'txt';
}
