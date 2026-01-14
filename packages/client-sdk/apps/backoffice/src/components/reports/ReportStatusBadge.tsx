/**
 * ReportStatusBadge
 *
 * Status badge component for report generation jobs.
 * Displays status with appropriate color coding and Norwegian labels.
 */
import * as React from 'react';
import { StatusTag, type StatusBadgeConfig, type BadgeColor } from '@xala/ds';
import type { ReportJobStatus } from '@digilist/client-sdk';

// =============================================================================
// Report Job Status Badge
// =============================================================================

const reportStatusConfig: Record<ReportJobStatus, StatusBadgeConfig> = {
  pending: { color: 'info', label: 'Venter' },
  processing: { color: 'warning', label: 'Behandler' },
  completed: { color: 'success', label: 'Fullført' },
  failed: { color: 'danger', label: 'Feilet' },
};

export interface ReportStatusBadgeProps {
  /** The report job status */
  status: ReportJobStatus;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component for displaying report generation status.
 *
 * @example
 * ```tsx
 * <ReportStatusBadge status="completed" size="sm" />
 * <ReportStatusBadge status="processing" />
 * <ReportStatusBadge status="failed" size="md" />
 * ```
 */
export function ReportStatusBadge({ status, size = 'sm' }: ReportStatusBadgeProps): React.ReactElement {
  const config = reportStatusConfig[status] || { color: 'neutral' as BadgeColor, label: status };
  return <StatusTag color={config.color} size={size}>{config.label}</StatusTag>;
}
