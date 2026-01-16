/**
 * Tenant Admin Sidebar
 *
 * Navigation sidebar for tenant-level administration.
 * Supports role-based navigation visibility.
 */

import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  SettingsIcon,
  ArrowRightIcon,
  ChartIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  ShieldIcon,
} from '@xala/ds';
import { useAuth, type TenantAdminRole } from '../../hooks/useAuth';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Roles that can view this nav item.
   * Empty array or undefined = visible to all authenticated tenant admins.
   * TENANT_ADMIN always has access to all items.
   */
  roles?: TenantAdminRole[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// NavItem component with proper active state handling
function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive =
    item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className="sidebar-nav-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        borderRadius: 'var(--ds-border-radius-lg)',
        textDecoration: 'none',
        position: 'relative',
        backgroundColor: isActive ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
        borderLeft: isActive
          ? '3px solid var(--ds-color-accent-base-default)'
          : '3px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Icon with background */}
      <div
        className="sidebar-nav-icon"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--ds-border-radius-md)',
          backgroundColor: isActive
            ? 'var(--ds-color-accent-surface-default)'
            : 'var(--ds-color-neutral-surface-hover)',
          color: isActive
            ? 'var(--ds-color-accent-text-default)'
            : 'var(--ds-color-neutral-text-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
      >
        {item.icon}
      </div>

      {/* Text content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: isActive
              ? 'var(--ds-font-weight-semibold)'
              : 'var(--ds-font-weight-medium)',
            color: isActive
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {item.name}
        </Paragraph>
        <Paragraph
          data-size="xs"
          style={{
            margin: 0,
            marginTop: '2px',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {item.description}
        </Paragraph>
      </div>

      {/* Badge or Arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
        {item.badge && item.badge > 0 && (
          <div
            style={{
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
            }}
          >
            {item.badge}
          </div>
        )}
        <div
          style={{
            color: isActive
              ? 'var(--ds-color-accent-text-default)'
              : 'var(--ds-color-neutral-text-subtle)',
            opacity: isActive ? 1 : 0.5,
          }}
        >
          <ArrowRightIcon />
        </div>
      </div>
    </NavLink>
  );
}

export function Sidebar() {
  const { user, isTenantAdmin } = useAuth();

  const navSections: NavSection[] = [
    {
      items: [
        {
          name: 'Dashboard',
          description: 'Tenant oversikt',
          href: '/',
          icon: <HomeIcon />,
        },
      ],
    },
    {
      title: 'Administrasjon',
      items: [
        {
          name: 'Brukere',
          description: 'Administrer brukere',
          href: '/users',
          icon: <UsersIcon />,
          roles: ['TENANT_ADMIN'],
        },
        {
          name: 'Feature Flags',
          description: 'Organisasjonsfunksjoner',
          href: '/feature-flags',
          icon: <ShieldIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_TECH_ADMIN'],
        },
      ],
    },
    {
      title: 'Utseende',
      items: [
        {
          name: 'Branding',
          description: 'Logo og farger',
          href: '/branding',
          icon: <SparklesIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_TECH_ADMIN'],
        },
      ],
    },
    {
      title: 'Abonnement',
      items: [
        {
          name: 'Plan & Fakturering',
          description: 'Abonnementsdetaljer',
          href: '/subscription',
          icon: <ChartIcon />,
          roles: ['TENANT_ADMIN', 'TENANT_BILLING_ADMIN'],
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          name: 'Audit Log',
          description: 'Aktivitetslogg',
          href: '/audit',
          icon: <ClockIcon />,
          roles: ['TENANT_ADMIN'],
        },
        {
          name: 'Innstillinger',
          description: 'Tenant-konfigurasjon',
          href: '/settings',
          icon: <SettingsIcon />,
          roles: ['TENANT_ADMIN'],
        },
      ],
    },
  ];

  // Filter items based on user role
  // TENANT_ADMIN has access to all items
  // Other roles only see items they have access to
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // If no roles specified, visible to all authenticated users
        if (!item.roles || item.roles.length === 0) {
          return true;
        }
        // Tenant admin has access to everything
        if (isTenantAdmin) {
          return true;
        }
        // Check if user's role is in the allowed roles
        return user?.role ? item.roles.includes(user.role) : false;
      }),
    }))
    .filter((section) => section.items.length > 0);

  // Role display name mapping
  const getRoleDisplayName = (role: string | undefined): string => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'Tenant Admin';
      case 'TENANT_BILLING_ADMIN':
        return 'Billing Admin';
      case 'TENANT_TECH_ADMIN':
        return 'Tech Admin';
      default:
        return 'Admin';
    }
  };

  return (
    <aside
      style={{
        width: '360px',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <img
            src="/logo.svg"
            alt="Digilist"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
          <div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-md)',
                fontWeight: 'var(--ds-font-weight-bold)',
                color: 'var(--ds-color-accent-text-default)',
                lineHeight: 'var(--ds-font-line-height-sm)',
                letterSpacing: 'var(--ds-font-letter-spacing-sm)',
              }}
            >
              {user?.tenantName || 'DIGILIST'}
            </div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-2xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                letterSpacing: 'var(--ds-font-letter-spacing-md)',
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              Tenant Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
        {filteredSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            {section.title && (
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-md)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {section.title}
              </Paragraph>
            )}
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info Section */}
      {user && (
        <div
          style={{
            padding: 'var(--ds-spacing-5) var(--ds-spacing-6)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
            <div
              style={{
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
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Paragraph
                data-size="sm"
                style={{
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </Paragraph>
              <Paragraph
                data-size="xs"
                style={{
                  color: 'var(--ds-color-neutral-text-subtle)',
                  margin: 0,
                  marginTop: '2px',
                }}
              >
                {getRoleDisplayName(user.role)}
              </Paragraph>
            </div>
          </div>
        </div>
      )}

      {/* CSS for hover states */}
      <style>{`
        .sidebar-nav-item:hover {
          background-color: var(--ds-color-neutral-surface-hover) !important;
        }
        .sidebar-nav-item:hover .sidebar-nav-icon {
          background-color: var(--ds-color-accent-surface-default) !important;
          color: var(--ds-color-accent-text-default) !important;
        }
      `}</style>
    </aside>
  );
}
