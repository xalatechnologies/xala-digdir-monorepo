/**
 * DashboardPageHeader
 *
 * Professional page header inspired by Dribbble design.
 * Features: breadcrumbs, title with badge, metadata row, actions, tabs.
 *
 * @see https://dribbble.com/shots/15250098-Page-Headers
 */

import * as React from 'react';
import { forwardRef } from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import { cn } from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface PageHeaderMetaItem {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Text label */
  label: string;
}

export interface PageHeaderTab {
  /** Unique ID */
  id: string;
  /** Tab label */
  label: string;
  /** Badge count (optional) */
  count?: number;
  /** Whether tab is active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Link href (alternative to onClick) */
  href?: string;
}

export interface DashboardPageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page title (required) */
  title: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Status badge (e.g., "Active", "Pending") */
  badge?: React.ReactNode;
  /** Breadcrumb navigation */
  breadcrumb?: React.ReactNode;
  /** Metadata items with icons (location, date, etc.) */
  meta?: PageHeaderMetaItem[];
  /** Last updated timestamp text */
  lastUpdated?: string;
  /** Secondary action button */
  secondaryAction?: React.ReactNode;
  /** Primary action button */
  primaryAction?: React.ReactNode;
  /** Overflow menu (three dots) */
  overflowMenu?: React.ReactNode;
  /** Navigation tabs */
  tabs?: PageHeaderTab[];
  /** Active tab ID */
  activeTab?: string;
  /** Tab click handler */
  onTabChange?: (tabId: string) => void;
  /** Tab style variant */
  tabVariant?: 'underline' | 'pill';
  /** Test ID */
  'data-testid'?: string;
}

// =============================================================================
// Sub-components
// =============================================================================

function MetaItem({ icon, label }: PageHeaderMetaItem) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-1)',
        fontSize: 'var(--ds-font-size-sm)',
        color: 'var(--ds-color-neutral-text-subtle)',
      }}
    >
      {icon && (
        <span style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex' }}>
          {icon}
        </span>
      )}
      {label}
    </span>
  );
}

interface TabProps extends PageHeaderTab {
  variant: 'underline' | 'pill';
}

function Tab({ label, count, active, onClick, href, variant }: TabProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-2)',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: active ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)',
    color: active ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
  };

  const underlineStyles: React.CSSProperties = {
    ...baseStyles,
    padding: 'var(--ds-spacing-3) 0',
    borderBottom: active ? '2px solid var(--ds-color-accent-base-default)' : '2px solid transparent',
    marginBottom: '-1px',
  };

  const pillStyles: React.CSSProperties = {
    ...baseStyles,
    padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: active ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
  };

  const styles = variant === 'pill' ? pillStyles : underlineStyles;

  const content = (
    <>
      {label}
      {count !== undefined && (
        <span
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            backgroundColor: active ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
            color: active ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
            padding: '0 var(--ds-spacing-2)',
            borderRadius: 'var(--ds-border-radius-full)',
            minWidth: '20px',
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} style={styles} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" style={styles} onClick={onClick}>
      {content}
    </button>
  );
}

// =============================================================================
// Component
// =============================================================================

export const DashboardPageHeader = forwardRef<HTMLDivElement, DashboardPageHeaderProps>(
  (
    {
      title,
      subtitle,
      badge,
      breadcrumb,
      meta = [],
      lastUpdated,
      secondaryAction,
      primaryAction,
      overflowMenu,
      tabs = [],
      activeTab,
      onTabChange,
      tabVariant = 'underline',
      className,
      style,
      children,
      'data-testid': testId = 'dashboard-page-header',
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn('ds-dashboard-page-header', className)}
        data-testid={testId}
        style={{
          marginBottom: 'var(--ds-spacing-6)',
          ...style,
        }}
        {...props}
      >
        {/* Breadcrumb row */}
        {breadcrumb && (
          <div style={{ marginBottom: 'var(--ds-spacing-3)' }}>
            {breadcrumb}
          </div>
        )}

        {/* Main header row: Title + Actions */}
        <div
          className="ds-page-header-main"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--ds-spacing-6)',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Title + Badge */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', flexWrap: 'wrap' }}>
              <Heading level={1} data-size="lg" style={{ margin: 0 }}>
                {title}
              </Heading>
              {badge}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  marginTop: 'var(--ds-spacing-2)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                {subtitle}
              </Paragraph>
            )}

            {/* Metadata row */}
            {meta.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-5)',
                  marginTop: 'var(--ds-spacing-2)',
                  flexWrap: 'wrap',
                }}
              >
                {meta.map((item, index) => (
                  <MetaItem key={index} {...item} />
                ))}
              </div>
            )}

            {/* Additional content slot */}
            {children}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)', flexShrink: 0 }}>
            {/* Last updated text */}
            {lastUpdated && (
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                {lastUpdated}
              </Paragraph>
            )}

            {/* Overflow menu (three dots) */}
            {overflowMenu}

            {/* Secondary action */}
            {secondaryAction}

            {/* Primary action */}
            {primaryAction}
          </div>
        </div>

        {/* Tabs row */}
        {tabs.length > 0 && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tabVariant === 'pill' ? 'var(--ds-spacing-2)' : 'var(--ds-spacing-6)',
              marginTop: 'var(--ds-spacing-5)',
              borderBottom: tabVariant === 'underline' ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
              overflowX: 'auto',
            }}
            aria-label="Page navigation"
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                {...tab}
                active={activeTab ? tab.id === activeTab : tab.active}
                variant={tabVariant}
                onClick={() => {
                  tab.onClick?.();
                  onTabChange?.(tab.id);
                }}
              />
            ))}
          </nav>
        )}

        {/* Responsive styles */}
        <style>{`
          @media (max-width: 576px) {
            .ds-page-header-main {
              flex-direction: column !important;
              align-items: stretch !important;
            }
            .ds-page-header-main > div:last-child {
              width: 100%;
              justify-content: flex-end;
              margin-top: var(--ds-spacing-4);
            }
          }
        `}</style>
      </header>
    );
  }
);

DashboardPageHeader.displayName = 'DashboardPageHeader';

export default DashboardPageHeader;
