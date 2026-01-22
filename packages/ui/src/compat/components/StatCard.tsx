/**
 * StatCard - Statistics/KPI display card
 */

import React from 'react';
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  color = 'neutral',
  onClick,
  className,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
      className={className}
    >
      <Card.Block>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <Paragraph size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {title}
            </Paragraph>
            <Heading level={3} size="lg" style={{ marginTop: 'var(--ds-spacing-1)' }}>
              {value}
            </Heading>
            {description && (
              <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {description}
              </Paragraph>
            )}
            {trend && (
              <Paragraph
                size="sm"
                style={{
                  marginTop: 'var(--ds-spacing-2)',
                  color: trend.direction === 'up' ? 'var(--ds-color-success-text-default)' : 'var(--ds-color-danger-text-default)',
                }}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Paragraph>
            )}
          </div>
          {icon && (
            <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {icon}
            </div>
          )}
        </div>
      </Card.Block>
    </Card>
  );
}
