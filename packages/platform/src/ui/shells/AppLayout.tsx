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
 * Supports mobile-first responsive design with optional bottom navigation
 * for mobile devices.
 */

import { Outlet } from 'react-router-dom';
import { ReactNode, useState, useEffect } from 'react';
import { BottomNavigation, type BottomNavigationItem } from '../composed/bottom-navigation';
import { DashboardContent } from './DashboardContent';

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
  
  /** Mobile breakpoint in pixels (default: 768) */
  mobileBreakpoint?: number;
  
  /** Bottom navigation items for mobile (optional) */
  bottomNavItems?: BottomNavigationItem[];
  
  /** Whether to show sidebar on mobile (default: false) */
  showSidebarOnMobile?: boolean;
}

/**
 * AppLayout component with flexible sidebar + header + content structure
 * 
 * @example
 * ```tsx
 * <AppLayout
 *   sidebar={<MySidebar />}
 *   header={<MyHeader title="Dashboard" />}
 *   bottomNavItems={[
 *     { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/', active: true },
 *     { id: 'bookings', label: 'Bookings', icon: <BookIcon />, href: '/bookings' },
 *   ]}
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
  mobileBreakpoint = 768,
  bottomNavItems,
  showSidebarOnMobile = false,
}: AppLayoutProps) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileBreakpoint]);

  const shouldShowSidebar = !isMobile || showSidebarOnMobile;
  const hasBottomNav = isMobile && bottomNavItems && bottomNavItems.length > 0;

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
      {/* Sidebar - Desktop only (or if showSidebarOnMobile is true) */}
      {shouldShowSidebar && sidebar}

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
        <DashboardContent
          hasBottomNav={hasBottomNav}
          style={{
            padding: contentPadding,
          }}
        >
          <div style={{ maxWidth: maxContentWidth, margin: '0 auto', width: '100%' }}>
            <Outlet />
          </div>
        </DashboardContent>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {hasBottomNav && (
        <BottomNavigation
          items={bottomNavItems}
          fixed={true}
          variant="surface"
          showLabels={true}
          safeArea={true}
        />
      )}
    </div>
  );
}
