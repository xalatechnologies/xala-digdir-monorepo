/**
 * EmptyState - Empty state display component
 */

import React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-spacing-10)',
        textAlign: 'center',
      }}
      className={className}
    >
      {icon && (
        <div style={{
          marginBottom: 'var(--ds-spacing-4)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}>
          {icon}
        </div>
      )}
      <Heading level={3} size="md">
        {title}
      </Heading>
      {description && (
        <Paragraph style={{ marginTop: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '400px' }}>
          {description}
        </Paragraph>
      )}
      {(action || secondaryAction) && (
        <div style={{ marginTop: 'var(--ds-spacing-6)', display: 'flex', gap: 'var(--ds-spacing-3)' }}>
          {action && (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="secondary">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
