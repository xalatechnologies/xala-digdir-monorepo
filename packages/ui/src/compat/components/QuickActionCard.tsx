/**
 * QuickActionCard - Action card for dashboard quick actions
 */

import React from 'react';
import { Card, Heading, Paragraph } from '@digdir/designsystemet-react';

export interface QuickActionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  color?: 'primary' | 'secondary' | 'neutral';
  className?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  href,
  color = 'neutral',
  className,
}: QuickActionCardProps) {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      onClick={handleClick}
      style={{ cursor: onClick || href ? 'pointer' : undefined }}
      className={className}
    >
      <Card.Block>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
          {icon && (
            <div style={{
              color: 'var(--ds-color-accent-text-default)',
              flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
          <div>
            <Heading level={4} size="sm">
              {title}
            </Heading>
            {description && (
              <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                {description}
              </Paragraph>
            )}
          </div>
        </div>
      </Card.Block>
    </Card>
  );
}
