/**
 * AppLayout Component
 * 
 * Flexible application layout component that provides a common structure
 * for sidebar + header + content layouts across all apps.
 * 
 * Apps should provide their own Sidebar and Header components as props,
 * allowing for app-specific navigation and branding while standardizing
 * the layout structure.
 * 
 * Note: This is a base layout component. Apps may choose to implement
 * their own AppLayout if they need more specific behavior (e.g., mobile
 * bottom navigation, complex responsive behavior, etc.).
 */

import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

export interface AppLayoutProps {
  /** Sidebar component (required) */
  sidebar: ReactNode;
  
  /** Header component (required) */
  header: ReactNode;
  
  /** Max width for content area (default: 1400px) */
  maxContentWidth?: string;
  
  /** Content padding (default: var(--ds-spacing-8)) */
  contentPadding?: string;
  
  /** Custom class name */
  className?: string;
  
  /** Custom styles */
  style?: React.CSSProperties;
  
  /** Additional content to render above main content (e.g., alerts, banners) */
  topContent?: ReactNode;
}

/**
 * AppLayout component with flexible sidebar + header + content structure
 * 
 * @example
 * ```tsx
 * <AppLayout
 *   sidebar={<MySidebar />}
 *   header={<MyHeader title="Dashboard" />}
 * />
 * ```
 */
export function AppLayout({
  sidebar,
  header,
  maxContentWidth = '1400px',
  contentPadding = 'var(--ds-spacing-8)',
  className,
  style,
  topContent,
}: AppLayoutProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        ...style,
      }}
    >
      {/* Sidebar */}
      {sidebar}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        {header}

        {/* Top content (alerts, banners, etc.) */}
        {topContent}

        {/* Main content area */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: contentPadding,
          }}
        >
          <div style={{ maxWidth: maxContentWidth, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
