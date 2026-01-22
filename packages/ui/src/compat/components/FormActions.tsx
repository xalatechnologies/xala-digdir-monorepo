/**
 * FormActions - Form action buttons container
 */

import React from 'react';

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function FormActions({
  children,
  align = 'right',
  className,
}: FormActionsProps) {
  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  }[align];

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent,
        gap: 'var(--ds-spacing-3)',
        marginTop: 'var(--ds-spacing-6)',
        paddingTop: 'var(--ds-spacing-4)',
        borderTop: '1px solid var(--ds-color-neutral-border-default)',
      }}
    >
      {children}
    </div>
  );
}
