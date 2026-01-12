/**
 * Page Header Component
 * 
 * A consistent header component for pages with title, subtitle, and actions
 */

import React, { forwardRef } from 'react';
import { Heading, Button } from '@digdir/designsystemet-react';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The page title
   */
  title: string;
  
  /**
   * Optional subtitle or description
   */
  subtitle?: string;
  
  /**
   * Action buttons to display on the right
   */
  actions?: React.ReactNode;
  
  /**
   * Breadcrumb navigation
   */
  breadcrumb?: React.ReactNode;
  
  /**
   * Whether to show a border bottom
   * @default false
   */
  bordered?: boolean;
  
  /**
   * Heading level for the title
   * @default 1
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({
    children,
    title,
    subtitle,
    actions,
    breadcrumb,
    bordered = false,
    level = 1,
    className,
    style,
    ...props
  }, ref) => {
    const headerStyle = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
      paddingBottom: bordered ? 24 : 0,
      borderBottom: bordered ? '1px solid var(--ds-color-neutral-40)' : 'none',
      ...style
    };

    return (
      <div ref={ref} className={className} style={headerStyle} {...props}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {breadcrumb && (
            <div style={{ marginBottom: 8 }}>{breadcrumb}</div>
          )}
          <Heading level={level} style={{ marginBottom: subtitle ? 8 : 0 }}>
            {title}
          </Heading>
          {subtitle && (
            <p style={{ opacity: 0.8, marginTop: 0, marginBottom: 0 }}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
        
        {actions && (
          <div style={{ marginLeft: 24, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
