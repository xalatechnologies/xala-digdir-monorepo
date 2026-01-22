/**
 * BookingStatusBadge Component
 *
 * Badge displaying booking status with appropriate colors.
 */

import React from 'react';

export interface BookingStatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: 'var(--ds-color-warning-base-default)',
  confirmed: 'var(--ds-color-success-base-default)',
  cancelled: 'var(--ds-color-danger-base-default)',
  completed: 'var(--ds-color-info-base-default)',
};

const statusLabels: Record<string, string> = {
  pending: 'Venter',
  confirmed: 'Bekreftet',
  cancelled: 'Kansellert',
  completed: 'Fullført',
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps): React.ReactElement {
  const color = statusColors[status] || 'var(--ds-color-neutral-base-default)';
  const label = statusLabels[status] || status;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: color,
        color: 'white',
      }}
    >
      {label}
    </span>
  );
}
