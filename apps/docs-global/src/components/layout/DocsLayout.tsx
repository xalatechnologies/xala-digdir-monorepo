/**
 * DocsLayout Component
 *
 * Main layout shell for the global documentation portal.
 * Platform-only - no @digilist/* imports.
 */

import { Outlet, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  DashboardContent,
  BottomNavigation,
  type BottomNavigationItem,
  Heading,
  HomeIcon,
  TableIcon,
  BookOpenIcon,
  BuildingIcon,
  GridIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

const MOBILE_BREAKPOINT = 768;

interface NavItem {
  path: string;
  labelKey: string;
  fallback: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'docs.nav.home', fallback: 'Home', icon: <HomeIcon /> },
  { path: '/api-reference', labelKey: 'docs.nav.apiReference', fallback: 'API Reference', icon: <TableIcon /> },
  { path: '/sdk-guide', labelKey: 'docs.nav.sdkGuide', fallback: 'SDK Guide', icon: <BookOpenIcon /> },
  { path: '/architecture', labelKey: 'docs.nav.architecture', fallback: 'Architecture', icon: <BuildingIcon /> },
  { path: '/components', labelKey: 'docs.nav.components', fallback: 'Components', icon: <GridIcon /> },
];

export function DocsLayout() {
  const location = useLocation();
  const t = useT();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size for mobile/desktop detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bottom navigation items for mobile
  const bottomNavItems: BottomNavigationItem[] = NAV_ITEMS.slice(0, 4).map((item) => ({
    id: item.path,
    label: t(item.labelKey) || item.fallback,
    icon: item.icon,
    href: item.path,
    active: location.pathname === item.path,
  }));

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      {/* Sidebar - Desktop only */}
      {!isMobile && (
        <aside
          style={{
            width: '280px',
            borderRight: '1px solid var(--ds-color-neutral-border-default)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            padding: 'var(--ds-spacing-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-4)',
          }}
        >
          <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
            <Heading level={4} style={{ color: 'var(--ds-color-accent-text-default)' }}>
              {t('docs.global.title') || 'Xala Platform Docs'}
            </Heading>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-3)',
                  padding: 'var(--ds-spacing-3)',
                  borderRadius: 'var(--ds-border-radius-md)',
                  backgroundColor:
                    location.pathname === item.path
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'transparent',
                }}
              >
                {item.icon}
                <span>{t(item.labelKey) || item.fallback}</span>
              </Link>
            ))}
          </nav>
        </aside>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header
          style={{
            borderBottom: '1px solid var(--ds-color-neutral-border-default)',
            padding: 'var(--ds-spacing-4) var(--ds-spacing-6)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
          }}
        >
          <Heading level={5} style={{ margin: 0 }}>
            {t('docs.global.header') || 'Documentation'}
          </Heading>
        </header>

        <DashboardContent hasBottomNav={isMobile} data-testid="docs-content">
          <Outlet />
        </DashboardContent>
      </div>

      {/* Bottom Navigation - Mobile only */}
      {isMobile && (
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

export default DocsLayout;
