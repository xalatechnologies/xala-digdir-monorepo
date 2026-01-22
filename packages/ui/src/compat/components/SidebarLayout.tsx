/**
 * SidebarLayout Component
 *
 * Layout with sidebar navigation and main content area.
 */

import React from 'react';

export interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: number | string;
  sidebarPosition?: 'left' | 'right';
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  sidebarWidth = 280,
  sidebarPosition = 'left',
  collapsible = false,
  collapsed = false,
  onToggleCollapse,
  className = '',
}: SidebarLayoutProps): React.ReactElement {
  const actualWidth = collapsed ? 64 : sidebarWidth;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row',
        minHeight: '100vh',
      }}
    >
      <aside
        style={{
          width: typeof actualWidth === 'number' ? `${actualWidth}px` : actualWidth,
          flexShrink: 0,
          backgroundColor: 'var(--ds-color-neutral-background-subtle)',
          borderRight: sidebarPosition === 'left' ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined,
          borderLeft: sidebarPosition === 'right' ? '1px solid var(--ds-color-neutral-border-subtle)' : undefined,
          transition: 'width 0.2s ease-in-out',
          overflow: 'hidden',
        }}
      >
        {sidebar}
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
