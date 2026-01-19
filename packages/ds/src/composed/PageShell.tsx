/**
 * PageShell Components
 *
 * Reusable page layout shells for consistent page structure.
 * Includes ListPageShell, DetailPageShell, and FormPageShell.
 *
 * SSR-safe: No browser APIs used at module level.
 * Hydration-safe: All state is passed as props.
 *
 * @module @xala/ds/composed/PageShell
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backLink?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  badges?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ListPageShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface DetailPageShellProps {
  title: string;
  subtitle?: ReactNode;
  backLink: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  actions?: ReactNode;
  badges?: ReactNode;
  statusBanner?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormPageShellProps {
  title: string;
  subtitle?: string;
  backLink?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// =============================================================================
// PageHeader Component
// =============================================================================

export function PageHeader({
  title,
  subtitle,
  actions,
  backLink,
  badges,
  className,
  style,
}: PageHeaderProps): React.ReactElement {
  return (
    <div className={className} style={style}>
      {backLink && (
        <a
          href={backLink.href}
          onClick={(e) => {
            if (backLink.onClick) {
              e.preventDefault();
              backLink.onClick();
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            marginBottom: 'var(--ds-spacing-3)',
            fontSize: 'var(--ds-font-size-sm)',
            color: 'var(--ds-color-neutral-text-default)',
            textDecoration: 'none',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'transparent',
            transition: 'background-color 0.15s ease',
          }}
        >
          <ArrowLeftIcon />
          {backLink.label}
        </a>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--ds-spacing-4)',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--ds-font-size-heading-md)',
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            {title}
          </h2>
          {(subtitle || badges) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                marginTop: 'var(--ds-spacing-2)',
                flexWrap: 'wrap',
              }}
            >
              {badges}
              {subtitle && (
                <span
                  style={{
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        {actions && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--ds-spacing-2)',
              flexWrap: 'wrap',
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ListPageShell Component
// =============================================================================

export function ListPageShell({
  title,
  subtitle,
  actions,
  filters,
  children,
  className,
  style,
}: ListPageShellProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        ...style,
      }}
    >
      <PageHeader title={title} subtitle={subtitle} actions={actions} />

      {filters && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            borderWidth: 'var(--ds-border-width-default)',
            borderStyle: 'solid',
            borderColor: 'var(--ds-color-neutral-border-subtle)',
            borderRadius: 'var(--ds-border-radius-lg)',
          }}
        >
          {filters}
        </div>
      )}

      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// DetailPageShell Component
// =============================================================================

export function DetailPageShell({
  title,
  subtitle,
  backLink,
  actions,
  badges,
  statusBanner,
  tabs,
  children,
  maxWidth = '1400px',
  className,
  style,
}: DetailPageShellProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        maxWidth,
        margin: '0 auto',
        ...style,
      }}
    >
      <PageHeader
        title={title}
        subtitle={subtitle as string | undefined}
        backLink={backLink}
        actions={actions}
        badges={badges}
      />

      {statusBanner}

      {tabs ? tabs : children}
    </div>
  );
}

// =============================================================================
// FormPageShell Component
// =============================================================================

export function FormPageShell({
  title,
  subtitle,
  backLink,
  children,
  footer,
  maxWidth = '800px',
  className,
  style,
}: FormPageShellProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-5)',
        maxWidth,
        margin: '0 auto',
        ...style,
      }}
    >
      <PageHeader title={title} subtitle={subtitle} backLink={backLink} />

      <div
        style={{
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderWidth: 'var(--ds-border-width-default)',
          borderStyle: 'solid',
          borderColor: 'var(--ds-color-neutral-border-subtle)',
          borderRadius: 'var(--ds-border-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 'var(--ds-spacing-5)' }}>{children}</div>

        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--ds-spacing-3)',
              padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderTopWidth: 'var(--ds-border-width-default)',
              borderTopStyle: 'solid',
              borderTopColor: 'var(--ds-color-neutral-border-subtle)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default { PageHeader, ListPageShell, DetailPageShell, FormPageShell };
