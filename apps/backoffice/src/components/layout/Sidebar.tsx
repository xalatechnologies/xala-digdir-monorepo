import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  BookOpenIcon,
  RepeatIcon,
  MessageIcon,
  UsersIcon,
  OrganizationIcon,
  ChartIcon,
  SettingsIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@xala/ds';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  adminOnly?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// NavItem component with proper active state handling
function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = item.href === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.href);

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
        backgroundColor: isActive
          ? 'var(--ds-color-neutral-surface-hover)'
          : 'transparent',
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
            fontWeight: isActive ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
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
  const { user, isAdmin } = useAuth();

  const navSections: NavSection[] = [
    {
      items: [
        { name: 'Dashboard', description: 'Oversikt og statistikk', href: '/', icon: <HomeIcon /> },
      ],
    },
    {
      title: 'Administrasjon',
      items: [
        { name: 'Listings', description: 'Administrer utleieobjekter', href: '/listings', icon: <BuildingIcon /> },
        { name: 'Kalender', description: 'Visuell oversikt', href: '/calendar', icon: <CalendarIcon /> },
        { name: 'Bookinger', description: 'Forespørsler og reservasjoner', href: '/bookings', icon: <BookOpenIcon />, badge: 20, badgeColor: 'accent' },
        { name: 'Sesongleie', description: 'Faste avtaler', href: '/seasons', icon: <RepeatIcon /> },
      ],
    },
    {
      title: 'Kommunikasjon',
      items: [
        { name: 'Meldinger', description: 'Samtaler med brukere', href: '/messages', icon: <MessageIcon />, badge: 3, badgeColor: 'danger' },
      ],
    },
    {
      title: 'Brukere & Org',
      items: [
        { name: 'Organisasjoner', description: 'Administrer organisasjoner', href: '/organizations', icon: <OrganizationIcon />, adminOnly: true },
        { name: 'Brukere', description: 'Administrer brukere', href: '/users', icon: <UsersIcon />, adminOnly: true },
      ],
    },
    {
      title: 'Innsikt',
      items: [
        { name: 'Rapporter', description: 'Statistikk og eksport', href: '/reports', icon: <ChartIcon /> },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Anmeldelser', description: 'Moderer anmeldelser', href: '/reviews/moderation', icon: <CheckCircleIcon />, adminOnly: true },
        { name: 'Audit Log', description: 'Systemhendelser', href: '/audit', icon: <ClockIcon />, adminOnly: true },
        { name: 'Innstillinger', description: 'Systemkonfigurasjon', href: '/settings', icon: <SettingsIcon />, adminOnly: true },
      ],
    },
  ];

  // Filter items based on role
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((section) => section.items.length > 0);

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
                lineHeight: 1.2,
                letterSpacing: '0.02em',
              }}
            >
              DIGILIST
            </div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-2xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                letterSpacing: '0.08em',
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              Backoffice
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
                  letterSpacing: '0.08em',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {section.title}
              </Paragraph>
            )}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
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
                {user.role === 'admin' ? 'Administrator' : 'Saksbehandler'}
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
