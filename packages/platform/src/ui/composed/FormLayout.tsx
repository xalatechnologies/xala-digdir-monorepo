/**
 * FormLayout Components
 *
 * Form sections, actions, and layout helpers.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/FormLayout
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  sticky?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormRowProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormDividerProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// =============================================================================
// FormSection Component
// =============================================================================

export function FormSection({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
  style,
}: FormSectionProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <section
      className={className}
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        ...style,
      }}
    >
      {(title || description) && (
        <div
          onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: isCollapsed ? 0 : 'var(--ds-spacing-5)',
            cursor: collapsible ? 'pointer' : 'default',
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: 'var(--ds-font-size-lg)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-default)',
                }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                style={{
                  margin: 'var(--ds-spacing-1) 0 0 0',
                  fontSize: 'var(--ds-font-size-sm)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {description}
              </p>
            )}
          </div>
          {collapsible && (
            <div
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease',
              }}
            >
              <ChevronDownIcon />
            </div>
          )}
        </div>
      )}
      {!isCollapsed && <div>{children}</div>}
    </section>
  );
}

// =============================================================================
// FormActions Component
// =============================================================================

export function FormActions({
  children,
  align = 'right',
  sticky = false,
  className,
  style,
}: FormActionsProps): React.ReactElement {
  const alignStyles: Record<string, React.CSSProperties> = {
    left: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    right: { justifyContent: 'flex-end' },
    between: { justifyContent: 'space-between' },
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-4) 0',
        borderTopWidth: 'var(--ds-border-width-default)',
        borderTopStyle: 'solid',
        borderTopColor: 'var(--ds-color-neutral-border-subtle)',
        marginTop: 'var(--ds-spacing-4)',
        ...(sticky && {
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          padding: 'var(--ds-spacing-4)',
          margin: 'var(--ds-spacing-4) calc(-1 * var(--ds-spacing-4)) 0',
          boxShadow: 'var(--ds-shadow-sm)',
        }),
        ...alignStyles[align],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// FormRow Component
// =============================================================================

export function FormRow({
  children,
  columns = 1,
  gap = 'md',
  className,
  style,
}: FormRowProps): React.ReactElement {
  const gapStyles = {
    sm: 'var(--ds-spacing-2)',
    md: 'var(--ds-spacing-4)',
    lg: 'var(--ds-spacing-6)',
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gapStyles[gap],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// FormField Component
// =============================================================================

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
  className,
  style,
}: FormFieldProps): React.ReactElement {
  return (
    <div className={className} style={{ marginBottom: 'var(--ds-spacing-4)', ...style }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          marginBottom: 'var(--ds-spacing-2)',
          fontSize: 'var(--ds-font-size-sm)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-default)',
        }}
      >
        {label}
        {required && (
          <span style={{ color: 'var(--ds-color-danger-text-default)', marginLeft: 'var(--ds-spacing-1)' }}>*</span>
        )}
      </label>
      {children}
      {(error || helperText) && (
        <p
          style={{
            margin: 'var(--ds-spacing-1) 0 0 0',
            fontSize: 'var(--ds-font-size-sm)',
            color: error ? 'var(--ds-color-danger-text-default)' : 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// FormDivider Component
// =============================================================================

export function FormDivider({ label, className, style }: FormDividerProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        margin: 'var(--ds-spacing-6) 0',
        ...style,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 'var(--ds-border-width-default)',
          backgroundColor: 'var(--ds-color-neutral-border-subtle)',
        }}
      />
      {label && (
        <>
          <span
            style={{
              fontSize: 'var(--ds-font-size-sm)',
              fontWeight: 'var(--ds-font-weight-medium)',
              color: 'var(--ds-color-neutral-text-subtle)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </span>
          <div
            style={{
              flex: 1,
              height: 'var(--ds-border-width-default)',
              backgroundColor: 'var(--ds-color-neutral-border-subtle)',
            }}
          />
        </>
      )}
    </div>
  );
}

export default { FormSection, FormActions, FormRow, FormField, FormDivider };
