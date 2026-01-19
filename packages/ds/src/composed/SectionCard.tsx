/**
 * SectionCard Component
 *
 * Consistent section containers for page content.
 * Provides standardized header, content, and footer areas.
 *
 * @module @xala/ds/composed/SectionCard
 */

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SectionCardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SectionCardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface SectionCardContentProps {
  children: ReactNode;
  noPadding?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface SectionCardFooterProps {
  children: ReactNode;
  alignment?: 'left' | 'center' | 'right' | 'between';
  size?: 'sm' | 'md' | 'lg';
}

// =============================================================================
// Icons
// =============================================================================

function ChevronDownIcon({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: 'transform 0.2s ease',
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// =============================================================================
// Size Styles
// =============================================================================

const sizeStyles = {
  sm: {
    padding: 'var(--ds-spacing-3)',
    headerPadding: 'var(--ds-spacing-3)',
    footerPadding: 'var(--ds-spacing-3)',
    titleSize: 'var(--ds-font-size-sm)',
    descSize: 'var(--ds-font-size-xs)',
    gap: 'var(--ds-spacing-2)',
  },
  md: {
    padding: 'var(--ds-spacing-4)',
    headerPadding: 'var(--ds-spacing-4)',
    footerPadding: 'var(--ds-spacing-4)',
    titleSize: 'var(--ds-font-size-md)',
    descSize: 'var(--ds-font-size-sm)',
    gap: 'var(--ds-spacing-3)',
  },
  lg: {
    padding: 'var(--ds-spacing-5)',
    headerPadding: 'var(--ds-spacing-5)',
    footerPadding: 'var(--ds-spacing-5)',
    titleSize: 'var(--ds-font-size-lg)',
    descSize: 'var(--ds-font-size-md)',
    gap: 'var(--ds-spacing-4)',
  },
};

const variantStyles = {
  default: {
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    borderWidth: 'var(--ds-border-width-default)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-neutral-border-subtle)',
    boxShadow: 'none',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 'var(--ds-border-width-default)',
    borderStyle: 'solid',
    borderColor: 'var(--ds-color-neutral-border-default)',
    boxShadow: 'none',
  },
  elevated: {
    backgroundColor: 'var(--ds-color-neutral-background-default)',
    borderWidth: '0',
    borderStyle: 'none',
    borderColor: 'transparent',
    boxShadow: 'var(--ds-shadow-md)',
  },
};

// =============================================================================
// Skeleton Loader
// =============================================================================

function SectionSkeleton({ size }: { size: 'sm' | 'md' | 'lg' }) {
  const sizeStyle = sizeStyles[size];
  
  return (
    <div style={{ padding: sizeStyle.padding }}>
      <div
        style={{
          height: 'var(--ds-sizing-5)',
          width: '40%',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-sm)',
          marginBottom: sizeStyle.gap,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <div
        style={{
          height: 'var(--ds-sizing-25)',
          width: '100%',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// =============================================================================
// SectionCardHeader Component
// =============================================================================

export function SectionCardHeader({
  title,
  description,
  icon,
  actions,
  size = 'md',
}: SectionCardHeaderProps): React.ReactElement {
  const sizeStyle = sizeStyles[size];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: sizeStyle.headerPadding,
        borderBottomWidth: 'var(--ds-border-width-default)',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)' }}>
        {icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: sizeStyle.titleSize,
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
              lineHeight: 1.3,
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                margin: 0,
                marginTop: 'var(--ds-spacing-1)',
                fontSize: sizeStyle.descSize,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// =============================================================================
// SectionCardContent Component
// =============================================================================

export function SectionCardContent({
  children,
  noPadding = false,
  size = 'md',
}: SectionCardContentProps): React.ReactElement {
  const sizeStyle = sizeStyles[size];

  return (
    <div style={{ padding: noPadding ? 0 : sizeStyle.padding }}>
      {children}
    </div>
  );
}

// =============================================================================
// SectionCardFooter Component
// =============================================================================

export function SectionCardFooter({
  children,
  alignment = 'right',
  size = 'md',
}: SectionCardFooterProps): React.ReactElement {
  const sizeStyle = sizeStyles[size];

  const justifyContent = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    between: 'space-between',
  }[alignment];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent,
        gap: 'var(--ds-spacing-3)',
        padding: sizeStyle.footerPadding,
        borderTopWidth: 'var(--ds-border-width-default)',
        borderTopStyle: 'solid',
        borderTopColor: 'var(--ds-color-neutral-border-subtle)',
      }}
    >
      {children}
    </div>
  );
}

// =============================================================================
// SectionCard Component
// =============================================================================

export function SectionCard({
  title,
  description,
  icon,
  actions,
  children,
  footer,
  variant = 'default',
  size = 'md',
  collapsible = false,
  defaultCollapsed = false,
  loading = false,
  className,
  style,
}: SectionCardProps): React.ReactElement {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const hasHeader = title || description || icon || actions;

  return (
    <div
      className={className}
      style={{
        backgroundColor: variantStyle.backgroundColor,
        borderWidth: variantStyle.borderWidth,
        borderStyle: variantStyle.borderStyle,
        borderColor: variantStyle.borderColor,
        borderRadius: 'var(--ds-border-radius-lg)',
        boxShadow: variantStyle.boxShadow,
        overflow: 'hidden',
        ...style,
      }}
    >
      {loading ? (
        <SectionSkeleton size={size} />
      ) : (
        <>
          {hasHeader && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: sizeStyle.headerPadding,
                borderBottomWidth: isCollapsed ? '0' : 'var(--ds-border-width-default)',
                borderBottomStyle: isCollapsed ? 'none' : 'solid',
                borderBottomColor: isCollapsed ? 'transparent' : 'var(--ds-color-neutral-border-subtle)',
                cursor: collapsible ? 'pointer' : 'default',
              }}
              onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
              role={collapsible ? 'button' : undefined}
              tabIndex={collapsible ? 0 : undefined}
              onKeyDown={collapsible ? (e) => e.key === 'Enter' && setIsCollapsed(!isCollapsed) : undefined}
              aria-expanded={collapsible ? !isCollapsed : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--ds-spacing-3)', flex: 1 }}>
                {collapsible && (
                  <div style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0, marginTop: '2px' }}>
                    <ChevronDownIcon isCollapsed={isCollapsed} />
                  </div>
                )}
                {icon && !collapsible && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  {title && (
                    <h3
                      style={{
                        margin: 0,
                        fontSize: sizeStyle.titleSize,
                        fontWeight: 'var(--ds-font-weight-semibold)',
                        color: 'var(--ds-color-neutral-text-default)',
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      style={{
                        margin: 0,
                        marginTop: 'var(--ds-spacing-1)',
                        fontSize: sizeStyle.descSize,
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {description}
                    </p>
                  )}
                </div>
              </div>
              {actions && (
                <div
                  style={{ flexShrink: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {actions}
                </div>
              )}
            </div>
          )}

          {!isCollapsed && (
            <>
              <div style={{ padding: hasHeader ? sizeStyle.padding : sizeStyle.padding }}>
                {children}
              </div>
              {footer && (
                <div
                  style={{
                    padding: sizeStyle.footerPadding,
                    borderTopWidth: 'var(--ds-border-width-default)',
                    borderTopStyle: 'solid',
                    borderTopColor: 'var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  {footer}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default SectionCard;
