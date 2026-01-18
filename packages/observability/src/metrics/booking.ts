/**
 * Booking Metrics Helpers
 * High-level helpers for recording booking engine metrics
 */

import { prometheusExporter } from '../exporters/prometheus';
import type { BookingMetricLabels } from '../types';

/**
 * Record booking creation
 */
export function recordBookingCreated(
  mode: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING',
  status: 'success' | 'failure' | 'conflict',
  durationSeconds: number,
  tenantId: string
): void {
  const labels: BookingMetricLabels = {
    action: 'create',
    mode,
    status,
    tenant_id: tenantId,
  };

  // Counter
  prometheusExporter.incrementCounter('booking_created_total', labels);

  // Duration (only for successful bookings)
  if (status === 'success') {
    prometheusExporter.observeHistogram('booking_creation_duration_seconds', durationSeconds, {
      mode,
      tenant_id: tenantId,
    });
  }
}

/**
 * Record booking conflict
 */
export function recordBookingConflict(
  mode: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING',
  tenantId: string
): void {
  prometheusExporter.incrementCounter('booking_conflicts_total', {
    mode,
    tenant_id: tenantId,
  });
}

/**
 * Record booking approval
 */
export function recordBookingApproval(
  action: 'approve' | 'reject',
  tenantId: string
): void {
  prometheusExporter.incrementCounter('booking_approvals_total', {
    action,
    tenant_id: tenantId,
  });
}

/**
 * Record booking cancellation
 */
export function recordBookingCancellation(
  reason: 'user' | 'admin' | 'system' | 'conflict',
  tenantId: string
): void {
  prometheusExporter.incrementCounter('booking_cancellations_total', {
    reason,
    tenant_id: tenantId,
  });
}

/**
 * Booking operation wrapper with metrics
 */
export async function withBookingMetrics<T>(
  mode: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING',
  tenantId: string,
  operationFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await operationFn();
    const duration = (Date.now() - startTime) / 1000;
    recordBookingCreated(mode, 'success', duration, tenantId);
    return result;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    const status = (error as Error).message.includes('conflict') ? 'conflict' : 'failure';
    recordBookingCreated(mode, status, duration, tenantId);
    
    if (status === 'conflict') {
      recordBookingConflict(mode, tenantId);
    }
    
    throw error;
  }
}
