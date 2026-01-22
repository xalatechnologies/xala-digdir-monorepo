/**
 * FormSection - Form section with title and description
 */

import React from 'react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={className}
      style={{
        marginBottom: 'var(--ds-spacing-8)',
      }}
    >
      {title && (
        <Heading level={3} size="sm" style={{ marginBottom: 'var(--ds-spacing-2)' }}>
          {title}
        </Heading>
      )}
      {description && (
        <Paragraph style={{ marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {description}
        </Paragraph>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
        {children}
      </div>
    </div>
  );
}
