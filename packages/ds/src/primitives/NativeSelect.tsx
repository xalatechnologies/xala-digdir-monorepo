/**
 * NativeSelect Component
 * Simple wrapper around native HTML select element with DS styling
 */

import React from 'react';

export interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label for the select */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  description?: string;
}

export function NativeSelect({
  label,
  error,
  description,
  children,
  className,
  ...props
}: NativeSelectProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
      {label && (
        <label
          htmlFor={props.id}
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: '500',
            color: error ? 'var(--ds-color-danger-text)' : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {label}
          {props.required && <span style={{ color: 'var(--ds-color-danger-text)' }}> *</span>}
        </label>
      )}

      {description && !error && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {description}
        </p>
      )}

      <select
        {...props}
        style={{
          width: '100%',
          padding: 'var(--ds-spacing-3)',
          fontSize: 'var(--ds-font-size-md)',
          lineHeight: '1.5',
          color: 'var(--ds-color-neutral-text-default)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          border: `1px solid ${error ? 'var(--ds-color-danger-border)' : 'var(--ds-color-neutral-border-default)'}`,
          borderRadius: 'var(--ds-border-radius-md)',
          outline: 'none',
          cursor: 'pointer',
          ...props.style,
        }}
      >
        {children}
      </select>

      {error && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-danger-text)',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
