/**
 * Global Control Plane Sidebar
 *
 * Navigation sidebar for platform-wide monitoring.
 * PLATFORM-ONLY: No @digilist/* imports allowed.
 */

import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  DatabaseIcon,
  BuildingIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xala/i18n';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// NavItem component with inline styles using design tokens
function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive =
    item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

  const navItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-4)',
    padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
    borderRadius: 'var(--ds-border-radius-lg)',
    textDecoration: 'none',
    position: 'relative',
    backgroundColor: isActive ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--ds-color-accent-base-default)' : '3px solid transparent',
    transition: 'all 0.15s ease',
  };

  const navIconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: isActive ? 'var(--ds-color-accent-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
    color: isActive ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  };

  const navContentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const navNameStyle: React.CSSProperties = {
    margin: 0,
    fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
    color: isActive ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-default)',
  };

  const navDescriptionStyle: React.CSSProperties = {
    margin: 0,
    marginTop: 'var(--ds-spacing-1)',
    color: 'var(--ds-color-neutral-text-subtle)',
  };

  const navActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-3)',
  };

  const navBadgeStyle: React.CSSProperties = {
    minWidth: '32px',
    height: '32px',
    borderRadius: 'var(--ds-border-radius-full)',
    backgroundColor: item.badgeColor === 'danger'
      ? 'var(--ds-color-danger-surface-default)'
      : 'var(--ds-color-neutral-surface-hover)',
    color: item.badgeColor === 'danger'
      ? 'var(--ds-color-danger-text-default)'
      : 'var(--ds-color-neutral-text-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-font-size-sm)',
    fontWeight: 'var(--ds-font-weight-medium)',
    padding: '0 var(--ds-spacing-3)',
  };

  const navArrowStyle: React.CSSProperties = {
    color: isActive ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
    opacity: isActive ? 1 : 0.5,
  };

  return (
    <NavLink to={item.href} end={item.href === '/'} style={navItemStyle}>
      <div style={navIconStyle}>{item.icon}</div>
      <div style={navContentStyle}>
        <Paragraph size="sm" style={navNameStyle}>
          {item.name}
        </Paragraph>
        <Paragraph size="xs" style={navDescriptionStyle}>
          {item.description}
        </Paragraph>
      </div>
      <div style={navActionsStyle}>
        {item.badge && item.badge > 0 && <div style={navBadgeStyle}>{item.badge}</div>}
        <div style={navArrowStyle}>
          <ArrowRightIcon />
        </div>
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const t = useT();

  // Navigation sections
  const sections: NavSection[] = useMemo(
    () => [
      {
        items: [
          {
            name: t('monitoring.nav.dashboard'),
            description: t('monitoring.nav.dashboardDesc'),
            href: '/',
            icon: <HomeIcon />,
          },
        ],
      },
      {
        title: t('monitoring.nav.sectionPlatform'),
        items: [
          {
            name: t('monitoring.nav.infrastructure'),
            description: t('monitoring.nav.infrastructureDesc'),
            href: '/infrastructure',
            icon: <DatabaseIcon />,
          },
          {
            name: t('monitoring.nav.tenants'),
            description: t('monitoring.nav.tenantsDesc'),
            href: '/tenants',
            icon: <BuildingIcon />,
          },
          {
            name: t('monitoring.nav.alerts'),
            description: t('monitoring.nav.alertsDesc'),
            href: '/alerts',
            icon: <AlertTriangleIcon />,
            badge: 3, // Mock: active alerts count
            badgeColor: 'danger',
          },
        ],
      },
    ],
    [t]
  );

  const sidebarStyle: React.CSSProperties = {
    width: '360px',
    backgroundColor: 'var(--ds-color-neutral-surface-default)',
    borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const logoSectionStyle: React.CSSProperties = {
    height: '72px',
    padding: '0 var(--ds-spacing-6)',
    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
    display: 'flex',
    alignItems: 'center',
  };

  const logoWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-3)',
  };

  const logoIconStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--ds-border-radius-md)',
    backgroundColor: 'var(--ds-color-accent-surface-default)',
    color: 'var(--ds-color-accent-text-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const brandNameStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-md)',
    fontWeight: 'var(--ds-font-weight-bold)',
    color: 'var(--ds-color-accent-text-default)',
    lineHeight: 'var(--ds-font-line-height-sm)',
    letterSpacing: 'var(--ds-font-letter-spacing-sm)',
  };

  const brandTaglineStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-2xs)',
    color: 'var(--ds-color-neutral-text-subtle)',
    letterSpacing: 'var(--ds-font-letter-spacing-md)',
    marginTop: 'var(--ds-spacing-1)',
    textTransform: 'uppercase',
  };

  const navStyle: React.CSSProperties = {
    flex: 1,
    padding: 'var(--ds-spacing-4) var(--ds-spacing-3)',
    overflowY: 'auto',
  };

  const navSectionStyle: React.CSSProperties = {
    marginBottom: 'var(--ds-spacing-6)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    fontWeight: 'var(--ds-font-weight-semibold)',
    color: 'var(--ds-color-neutral-text-subtle)',
    textTransform: 'uppercase',
    letterSpacing: 'var(--ds-font-letter-spacing-md)',
    padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
    marginBottom: 'var(--ds-spacing-2)',
  };

  const navListStyle: React.CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--ds-spacing-2)',
  };

  const footerStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
  };

  const footerTextStyle: React.CSSProperties = {
    fontSize: 'var(--ds-font-size-xs)',
    color: 'var(--ds-color-neutral-text-subtle)',
    margin: 0,
    textAlign: 'center',
  };

  return (
    <aside style={sidebarStyle} data-testid="monitoring-global-sidebar">
      {/* Logo Section */}
      <div style={logoSectionStyle}>
        <div style={logoWrapperStyle}>
          <div style={logoIconStyle}>
            <SparklesIcon />
          </div>
          <div>
            <div style={brandNameStyle}>Xala Platform</div>
            <div style={brandTaglineStyle}>Global Control Plane</div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav style={navStyle}>
        {sections.map((section, sectionIndex) => (
          <div key={`section-${sectionIndex}`} style={navSectionStyle}>
            {section.title && (
              <Paragraph size="xs" style={sectionTitleStyle}>
                {section.title}
              </Paragraph>
            )}
            <ul style={navListStyle}>
              {section.items.map((item, itemIndex) => (
                <li key={`item-${sectionIndex}-${itemIndex}`}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={footerStyle}>
        <p style={footerTextStyle}>
          {t('monitoring.footer.version')} 1.0.0
        </p>
      </div>
    </aside>
  );
}
