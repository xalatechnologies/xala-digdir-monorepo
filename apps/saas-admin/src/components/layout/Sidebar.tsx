/**
 * SaaS Admin Sidebar
 *
 * Navigation sidebar for platform-wide administration.
 * Supports role-based navigation visibility.
 * Uses API-driven navigation with fallback to static items.
 * 
 * REFACTORED: Removed CSS module, now using inline styles with design tokens
 */

import { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  BuildingIcon,
  SettingsIcon,
  ArrowRightIcon,
  ChartIcon,
  ShieldIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
} from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';
import { useAuth, type SaasAdminRole } from '@xalatechnologies/platform/auth';
import { useNavigationItems, type NavItemFromApi } from '../../hooks/useNavigation';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <HomeIcon />,
  building: <BuildingIcon />,
  settings: <SettingsIcon />,
  chart: <ChartIcon />,
  'chart-bar': <ChartIcon />,
  shield: <ShieldIcon />,
  clock: <ClockIcon />,
  users: <UsersIcon />,
  sparkles: <SparklesIcon />,
};

function getIcon(iconKey: string | undefined): React.ReactNode {
  if (!iconKey) return <HomeIcon />;
  return ICON_MAP[iconKey] ?? <HomeIcon />;
}

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  roles?: SaasAdminRole[];
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
    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
    color: 'var(--ds-color-neutral-text-default)',
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

/**
 * Transform API navigation items to NavSection format
 */
function transformApiNavToSections(
  items: NavItemFromApi[],
  t: (key: string, opts?: Record<string, string>) => string
): NavSection[] {
  if (!items.length) return [];

  const sectionMap = new Map<string | null, NavItem[]>();

  for (const item of items) {
    const sectionKey = item.section || null;
    if (!sectionMap.has(sectionKey)) {
      sectionMap.set(sectionKey, []);
    }

    const navItem: NavItem = {
      name: t(item.labelKey),
      description: t(`${item.labelKey}Desc`),
      href: item.routeKey || '/',
      icon: getIcon(item.iconKey),
    };

    sectionMap.get(sectionKey)!.push(navItem);
  }

  const sections: NavSection[] = [];
  for (const [sectionKey, sectionItems] of sectionMap) {
    sections.push({
      title: sectionKey ? t(sectionKey) : undefined,
      items: sectionItems,
    });
  }

  return sections;
}

export function Sidebar() {
  const { user, isSuperAdmin } = useAuth();
  const t = useT();
  const { items: apiNavItems } = useNavigationItems();

  // Static fallback sections (used if API fails or returns nothing)
  const staticSections: NavSection[] = useMemo(
    () => [
      {
        items: [
          {
            name: t('saasAdmin.nav.dashboard'),
            description: t('saasAdmin.nav.dashboardDesc'),
            href: '/',
            icon: <HomeIcon />,
          },
        ],
      },
      {
        title: t('saasAdmin.nav.sectionManagement'),
        items: [
          {
            name: t('saasAdmin.nav.tenants'),
            description: t('saasAdmin.nav.tenantsDesc'),
            href: '/tenants',
            icon: <BuildingIcon />,
          },
          {
            name: t('saasAdmin.nav.plans'),
            description: t('saasAdmin.nav.plansDesc'),
            href: '/plans',
            icon: <ChartIcon />,
          },
          {
            name: t('saasAdmin.nav.users'),
            description: t('saasAdmin.nav.usersDesc'),
            href: '/users',
            icon: <UsersIcon />,
          },
        ],
      },
      {
        title: t('saasAdmin.nav.sectionTools'),
        items: [
          {
            name: t('saasAdmin.nav.featureFlags'),
            description: t('saasAdmin.nav.featureFlagsDesc'),
            href: '/feature-flags',
            icon: <SparklesIcon />,
          },
          {
            name: t('saasAdmin.nav.auditLog'),
            description: t('saasAdmin.nav.auditLogDesc'),
            href: '/audit',
            icon: <ShieldIcon />,
          },
          {
            name: t('saasAdmin.nav.settings'),
            description: t('saasAdmin.nav.settingsDesc'),
            href: '/settings',
            icon: <SettingsIcon />,
          },
        ],
      },
    ],
    [t]
  );

  // Use API nav items if available, fallback to static
  const sections: NavSection[] = useMemo(() => {
    if (apiNavItems && apiNavItems.length > 0) {
      return transformApiNavToSections(apiNavItems, t);
    }
    return staticSections;
  }, [apiNavItems, staticSections, t]);

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

  const logoImageStyle: React.CSSProperties = {
    height: '40px',
    width: 'auto',
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

  const userSectionStyle: React.CSSProperties = {
    padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
    borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
    backgroundColor: 'var(--ds-color-neutral-surface-hover)',
  };

  const userWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--ds-spacing-4)',
  };

  const userAvatarStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--ds-border-radius-full)',
    backgroundColor: 'var(--ds-color-accent-surface-default)',
    color: 'var(--ds-color-accent-text-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--ds-font-size-md)',
    fontWeight: 'var(--ds-font-weight-semibold)',
    flexShrink: 0,
  };

  const userInfoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const userNameStyle: React.CSSProperties = {
    fontWeight: 'var(--ds-font-weight-semibold)',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const userRoleStyle: React.CSSProperties = {
    color: 'var(--ds-color-neutral-text-subtle)',
    margin: 0,
    marginTop: 'var(--ds-spacing-1)',
  };

  return (
    <aside style={sidebarStyle} data-testid="saas-admin-sidebar">
      {/* Logo Section */}
      <div style={logoSectionStyle}>
        <div style={logoWrapperStyle}>
          <img src="/logo.svg" alt="Digilist" style={logoImageStyle} />
          <div>
            <div style={brandNameStyle}>Digilist</div>
            <div style={brandTaglineStyle}>SaaS Admin</div>
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

      {/* User Info Section */}
      {user && (
        <div style={userSectionStyle}>
          <div style={userWrapperStyle}>
            <div style={userAvatarStyle}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={userInfoStyle}>
              <Paragraph size="sm" style={userNameStyle}>
                {user.name || 'Admin User'}
              </Paragraph>
              <Paragraph size="xs" style={userRoleStyle}>
                {isSuperAdmin ? t('saasAdmin.roles.superAdmin') : t('saasAdmin.roles.admin')}
              </Paragraph>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
