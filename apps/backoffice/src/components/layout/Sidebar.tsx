import { NavLink, useLocation } from 'react-router-dom';
import { Paragraph } from '@xala/ds';
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

// SVG icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const RepeatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const OrganizationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

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
        { name: 'Forespørsler', description: 'Ventende godkjenninger', href: '/requests', icon: <InboxIcon />, badge: 8, badgeColor: 'warning' },
        { name: 'Bookinger', description: 'Alle reservasjoner', href: '/bookings', icon: <BookOpenIcon />, badge: 12, badgeColor: 'accent' },
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
