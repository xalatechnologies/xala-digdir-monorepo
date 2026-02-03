/**
 * Sidebar Primitives
 *
 * Low-level sidebar container for application layouts.
 * Uses design tokens only, no inline styles.
 *
 * Note: These are low-level primitives. For dashboard layouts,
 * prefer using DashboardSidebar from shells.
 */

import React, { forwardRef } from 'react';
import { cn } from '../utils';

// =============================================================================
// SimpleSidebar - Basic sidebar container
// =============================================================================

export interface SimpleSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the sidebar
   * @default 'var(--ds-sizing-80)'
   */
  width?: string;

  /**
   * Whether the sidebar has a border on the right
   * @default true
   */
  bordered?: boolean;

  children: React.ReactNode;
}

export const SimpleSidebar = forwardRef<HTMLDivElement, SimpleSidebarProps>(
  (
    { width = 'var(--ds-sizing-80)', bordered = true, children, className, style, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('ds-sidebar', className)}
        style={{
          width,
          borderRight: bordered ? '1px solid var(--ds-color-neutral-border-default)' : undefined,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          height: '100%',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SimpleSidebar.displayName = 'SimpleSidebar';

// =============================================================================
// SidebarHeaderArea - Header section within sidebar
// =============================================================================

export interface SidebarHeaderAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SidebarHeaderArea = forwardRef<HTMLDivElement, SidebarHeaderAreaProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('ds-sidebar__header', className)}
        style={{
          padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SidebarHeaderArea.displayName = 'SidebarHeaderArea';

// =============================================================================
// SidebarPanel - A section with optional border within sidebar
// =============================================================================

export interface SidebarPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show bottom border
   * @default false
   */
  bordered?: boolean;

  children: React.ReactNode;
}

export const SidebarPanel = forwardRef<HTMLDivElement, SidebarPanelProps>(
  ({ bordered = false, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('ds-sidebar__section', className)}
        style={{
          padding: 'var(--ds-spacing-4)',
          borderBottom: bordered ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SidebarPanel.displayName = 'SidebarPanel';

// =============================================================================
// SidebarScrollArea - Scrollable content area within sidebar
// =============================================================================

export interface SidebarScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SidebarScrollArea = forwardRef<HTMLDivElement, SidebarScrollAreaProps>(
  ({ children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('ds-sidebar__content', className)}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 var(--ds-spacing-4) var(--ds-spacing-4)',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SidebarScrollArea.displayName = 'SidebarScrollArea';

export default {
  SimpleSidebar,
  SidebarHeaderArea,
  SidebarPanel,
  SidebarScrollArea,
};
