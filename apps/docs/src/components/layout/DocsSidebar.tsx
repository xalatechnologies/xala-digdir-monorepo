import { NavLink, useLocation } from 'react-router-dom';
import {
  Paragraph,
  HomeIcon,
  UsersIcon,
  BookOpenIcon,
  SettingsIcon,
  ArrowRightIcon,
  ClockIcon,
  BuildingIcon,
  ChartIcon,
  ShieldIcon,
  PlayIcon,
  ExternalLinkIcon,
  FileTextIcon,
  InboxIcon,
} from '@xala/ds';
import { docsNav, type NavItem, type NavIconKey } from '../../navigation/docsNav';

// =============================================================================
// Icon Mapping
// =============================================================================

/**
 * Maps icon keys from the docsNav registry to actual icon components
 */
const iconMap: Record<NavIconKey, React.ReactNode> = {
  home: <HomeIcon />,
  users: <UsersIcon />,
  book: <BookOpenIcon />,
  settings: <SettingsIcon />,
  'arrow-right': <ArrowRightIcon />,
  clock: <ClockIcon />,
  building: <BuildingIcon />,
  chart: <ChartIcon />,
  database: <InboxIcon />,
  link: <ExternalLinkIcon />,
  shield: <ShieldIcon />,
  play: <PlayIcon />,
  folder: <FileTextIcon />,
};

/**
 * Resolves an icon key to its React component
 */
function resolveIcon(iconKey: string): React.ReactNode {
  return iconMap[iconKey as NavIconKey] || <HomeIcon />;
}

// =============================================================================
// NavItem Component
// =============================================================================

/**
 * SidebarNavItem - Renders a single navigation item with active state styling
 */
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
        {resolveIcon(item.icon)}
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

      {/* Arrow */}
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
    </NavLink>
  );
}

// =============================================================================
// DocsSidebar Component
// =============================================================================

export function DocsSidebar() {
  // Filter out hidden items from navigation
  const visibleNav = docsNav.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.hidden),
  }));

  return (
    <aside
      className="docs-sidebar"
      style={{
        width: '320px',
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
              DIGILIST
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
              Documentation
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
        {visibleNav.map((section) => (
          <div key={section.id} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
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

      {/* CSS for hover states and mobile responsive */}
      <style>{`
        .sidebar-nav-item:hover {
          background-color: var(--ds-color-neutral-surface-hover) !important;
        }
        .sidebar-nav-item:hover .sidebar-nav-icon {
          background-color: var(--ds-color-accent-surface-default) !important;
          color: var(--ds-color-accent-text-default) !important;
        }

        /* Mobile responsive - collapsible sidebar */
        @media (max-width: 768px) {
          .docs-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .docs-sidebar.open {
            transform: translateX(0);
          }

          .docs-sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .docs-sidebar-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `}</style>
    </aside>
  );
}
