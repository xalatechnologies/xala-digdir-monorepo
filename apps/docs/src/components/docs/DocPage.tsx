/**
 * DocPage Component
 *
 * A wrapper component for documentation pages that provides consistent
 * layout, title, description, and optional table of contents support.
 *
 * Uses @xala/ds components exclusively per design system guardrails.
 */

import React, { forwardRef } from 'react';
import { Heading, Paragraph } from '@xala/ds';

export interface DocPageProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The page title displayed as h1
   */
  title?: string;

  /**
   * Page description/subtitle displayed below the title
   */
  description?: string;

  /**
   * Optional breadcrumb navigation
   */
  breadcrumb?: React.ReactNode;

  /**
   * Optional actions to display in the header area
   */
  actions?: React.ReactNode;

  /**
   * Whether to show a border below the header
   * @default false
   */
  bordered?: boolean;

  /**
   * Maximum width of the content area
   * @default '900px'
   */
  maxWidth?: string;

  /**
   * Last updated date to display
   */
  lastUpdated?: string;
}

export const DocPage = forwardRef<HTMLElement, DocPageProps>(
  (
    {
      children,
      title,
      description,
      breadcrumb,
      actions,
      bordered = false,
      maxWidth = '900px',
      lastUpdated,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const articleStyle: React.CSSProperties = {
      maxWidth,
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 'var(--ds-spacing-8)',
      paddingBottom: bordered ? 'var(--ds-spacing-6)' : 0,
      borderBottom: bordered
        ? '1px solid var(--ds-color-neutral-border-default)'
        : 'none',
    };

    const contentStyle: React.CSSProperties = {
      lineHeight: 1.7,
    };

    const footerStyle: React.CSSProperties = {
      marginTop: 'var(--ds-spacing-12)',
      paddingTop: 'var(--ds-spacing-6)',
      borderTop: '1px solid var(--ds-color-neutral-border-default)',
      color: 'var(--ds-color-neutral-text-subtle)',
      fontSize: 'var(--ds-font-size-sm)',
    };

    return (
      <article
        ref={ref}
        className={className}
        style={articleStyle}
        {...props}
      >
        {/* Breadcrumb */}
        {breadcrumb && (
          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            {breadcrumb}
          </div>
        )}

        {/* Header */}
        {(title || actions) && (
          <header style={headerStyle}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <Heading
                  level={1}
                  style={{
                    marginBottom: description ? 'var(--ds-spacing-3)' : 0,
                  }}
                >
                  {title}
                </Heading>
              )}
              {description && (
                <Paragraph
                  style={{
                    color: 'var(--ds-color-neutral-text-subtle)',
                    marginTop: 0,
                    marginBottom: 0,
                    fontSize: 'var(--ds-font-size-lg)',
                  }}
                >
                  {description}
                </Paragraph>
              )}
            </div>

            {actions && (
              <div
                style={{
                  marginLeft: 'var(--ds-spacing-6)',
                  flexShrink: 0,
                }}
              >
                {actions}
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <div style={contentStyle}>{children}</div>

        {/* Footer with last updated */}
        {lastUpdated && (
          <footer style={footerStyle}>
            Last updated: {lastUpdated}
          </footer>
        )}
      </article>
    );
  }
);

DocPage.displayName = 'DocPage';
