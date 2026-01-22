/**
 * PaymentStatusBadge Component
 *
 * Badge displaying payment status with appropriate colors.
 */

import React from 'react';

export interface PaymentStatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: 'var(--ds-color-warning-base-default)',
  paid: 'var(--ds-color-success-base-default)',
  failed: 'var(--ds-color-danger-base-default)',
  refunded: 'var(--ds-color-info-base-default)',
};

const statusLabels: Record<string, string> = {
  pending: 'Venter',
  paid: 'Betalt',
  failed: 'Mislyktes',
  refunded: 'Refundert',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps): React.ReactElement {
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
