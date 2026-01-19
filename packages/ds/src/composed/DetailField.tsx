/**
 * DetailField Components
 *
 * Reusable components for displaying labeled data fields.
 * Common pattern in detail pages for showing entity properties.
 *
 * SSR-safe: No browser APIs used.
 * Hydration-safe: Pure presentational component.
 *
 * @module @xala/ds/composed/DetailField
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface DetailFieldProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DetailFieldGroupProps {
  title?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
  style?: React.CSSProperties;
}

export interface DetailCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// =============================================================================
// DetailField Component
// =============================================================================

export function DetailField({
  label,
  value,
  icon,
  copyable = false,
  onCopy,
  isCopied = false,
  className,
  style,
}: DetailFieldProps): React.ReactElement {
  return (
    <div className={className} style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-1)',
        }}
      >
        {icon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {icon}
          </span>
        )}
        <span
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <div
          style={{
            flex: 1,
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {value}
        </div>

        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-1)',
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderStyle: 'none',
              borderRadius: 'var(--ds-border-radius-sm)',
              cursor: 'pointer',
              color: isCopied
                ? 'var(--ds-color-success-text-default)'
                : 'var(--ds-color-neutral-text-subtle)',
              transition: 'color 0.15s ease',
            }}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// DetailFieldGroup Component
// =============================================================================

export function DetailFieldGroup({
  title,
  children,
  columns = 1,
  className,
  style,
}: DetailFieldGroupProps): React.ReactElement {
  const gridColumns = {
    1: '1fr',
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
  }[columns];

  return (
    <div className={className} style={style}>
      {title && (
        <h4
          style={{
            margin: '0 0 var(--ds-spacing-4) 0',
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {title}
        </h4>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// DetailCard Component
// =============================================================================

export function DetailCard({
  title,
  icon,
  children,
  actions,
  className,
  style,
}: DetailCardProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-4)',
          borderBottomWidth: 'var(--ds-border-width-default)',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          {icon && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {icon}
            </span>
          )}
          <h3
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-md)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </h3>
        </div>

        {actions && <div>{actions}</div>}
      </div>

      <div style={{ padding: 'var(--ds-spacing-4)' }}>{children}</div>
    </div>
  );
}

// =============================================================================
// MonoField - For IDs, codes, etc.
// =============================================================================

export interface MonoFieldProps {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}

export function MonoField({
  label,
  value,
  copyable = true,
  onCopy,
  isCopied = false,
}: MonoFieldProps): React.ReactElement {
  return (
    <DetailField
      label={label}
      value={
        <span
          style={{
            fontFamily: 'var(--ds-font-family-monospace)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {value}
        </span>
      }
      copyable={copyable}
      onCopy={onCopy}
      isCopied={isCopied}
    />
  );
}

// =============================================================================
// LinkField - For emails, phones, URLs
// =============================================================================

export interface LinkFieldProps {
  label: string;
  value: string;
  href: string;
  icon?: ReactNode;
  copyable?: boolean;
  onCopy?: () => void;
  isCopied?: boolean;
}

export function LinkField({
  label,
  value,
  href,
  icon,
  copyable = true,
  onCopy,
  isCopied = false,
}: LinkFieldProps): React.ReactElement {
  return (
    <DetailField
      label={label}
      icon={icon}
      value={
        <a
          href={href}
          style={{
            color: 'var(--ds-color-accent-text-default)',
            textDecoration: 'none',
          }}
        >
          {value}
        </a>
      }
      copyable={copyable}
      onCopy={onCopy}
      isCopied={isCopied}
    />
  );
}

export default {
  DetailField,
  DetailFieldGroup,
  DetailCard,
  MonoField,
  LinkField,
};
