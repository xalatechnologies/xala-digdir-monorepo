/**
 * FormField - Generic form field wrapper
 */

import React from 'react';
import { Label, Paragraph } from '@digdir/designsystemet-react';

export interface FormFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  description,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      {label && (
        <Label style={{ marginBottom: 'var(--ds-spacing-1)' }}>
          {label}
          {required && <span style={{ color: 'var(--ds-color-danger-text-default)', marginLeft: '4px' }}>*</span>}
        </Label>
      )}
      {description && (
        <Paragraph size="sm" style={{ marginBottom: 'var(--ds-spacing-2)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          {description}
        </Paragraph>
      )}
      {children}
      {error && (
        <Paragraph size="sm" style={{ marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-danger-text-default)' }}>
          {error}
        </Paragraph>
      )}
    </div>
  );
}
