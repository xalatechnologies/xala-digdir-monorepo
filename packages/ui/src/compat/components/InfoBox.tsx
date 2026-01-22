/**
 * InfoBox - Information display box
 */

import React from 'react';
import { Paragraph } from '@digdir/designsystemet-react';

export interface InfoBoxProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
  info: {
    bg: 'var(--ds-color-info-surface-default)',
    border: 'var(--ds-color-info-border-default)',
    text: 'var(--ds-color-info-text-default)',
  },
  success: {
    bg: 'var(--ds-color-success-surface-default)',
    border: 'var(--ds-color-success-border-default)',
    text: 'var(--ds-color-success-text-default)',
  },
  warning: {
    bg: 'var(--ds-color-warning-surface-default)',
    border: 'var(--ds-color-warning-border-default)',
    text: 'var(--ds-color-warning-text-default)',
  },
  danger: {
    bg: 'var(--ds-color-danger-surface-default)',
    border: 'var(--ds-color-danger-border-default)',
    text: 'var(--ds-color-danger-text-default)',
  },
};

export function InfoBox({
  title,
  children,
  variant = 'info',
  icon,
  className,
}: InfoBoxProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={className}
      style={{
        padding: 'var(--ds-spacing-4)',
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: 'var(--ds-border-radius-md)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)' }}>
        {icon && <div style={{ color: styles.text, flexShrink: 0 }}>{icon}</div>}
        <div>
          {title && (
            <Paragraph style={{ fontWeight: 600, color: styles.text, marginBottom: 'var(--ds-spacing-1)' }}>
              {title}
            </Paragraph>
          )}
          <div style={{ color: styles.text }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
