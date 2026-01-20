import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import {
  Paragraph,
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  MessageIcon,
  SettingsIcon,
  ArrowRightIcon,
  RepeatIcon,
  UsersIcon,
  Drawer,
  Button,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { useAccountContext } from '@xala/runtime';
import { useNavigationItems, type NavItemFromApi } from '../../hooks/useNavigation';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <HomeIcon />,
  calendar: <CalendarIcon />,
  'book-open': <BookOpenIcon />,
  message: <MessageIcon />,
  settings: <SettingsIcon />,
  repeat: <RepeatIcon />,
  users: <UsersIcon />,
};

function getIconFromKey(iconKey: string | undefined): React.ReactNode {
  if (!iconKey) return <HomeIcon />;
  return ICON_MAP[iconKey] ?? <HomeIcon />;
}

// Icon for Billing/Credit Card
function CreditCardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

/** Dashboard context type for RBAC-based navigation filtering */
type DashboardContext = 'personal' | 'organization';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  /** Which dashboard contexts can see this nav item */
  contexts?: DashboardContext[];
  /** Optional RBAC permissions required to see this item */
  requiredPermissions?: string[];
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Menu Icon for mobile hamburger button
function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// NavItem component with proper active state handling
function SidebarNavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const location = useLocation();
  const isActive = item.href === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(item.href);

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      onClick={onClick}
      className="sidebar-nav-item"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-4)',
        padding: 'var(--ds-spacing-4) var(--ds-spacing-5)',
        minHeight: '44px',
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

// Shared sidebar content component
function SidebarContent({ navSections, user, onItemClick, t }: { navSections: NavSection[]; user: { name: string; email: string } | null; onItemClick?: () => void; t: (key: string) => string }) {
  return (
    <>
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
                lineHeight: 'var(--ds-font-line-height-heading)',
                letterSpacing: 'var(--ds-font-letter-spacing-wide)',
              }}
            >
              {t('app.name')}
            </div>
            <div
              style={{
                fontSize: 'var(--ds-font-size-2xs)',
                color: 'var(--ds-color-neutral-text-subtle)',
                letterSpacing: 'var(--ds-font-letter-spacing-wide)',
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              {t('components.sidebar.appSubtitle')}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
        {navSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: 'var(--ds-spacing-6)' }}>
            {section.title && (
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--ds-font-letter-spacing-wide)',
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-5)',
                  marginBottom: 'var(--ds-spacing-2)',
                }}
              >
                {section.title}
              </Paragraph>
            )}
            {/* eslint-disable-next-line digdir/prefer-ds-components -- Navigation list requires specific styling and structure */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItem item={item} onClick={onItemClick} />
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
                {user.email}
              </Paragraph>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Transform API navigation items to NavSection format
 */
function transformApiNavToSections(
  items: NavItemFromApi[],
  t: (key: string) => string,
  accountType: DashboardContext
): NavSection[] {
  if (!items.length) return [];

  const sectionMap = new Map<string | null, NavItem[]>();

  for (const item of items) {
    // Filter by context
    if (item.contexts.length > 0 && !item.contexts.includes(accountType)) {
      continue;
    }

    const sectionKey = item.section || null;
    if (!sectionMap.has(sectionKey)) {
      sectionMap.set(sectionKey, []);
    }

    const navItem: NavItem = {
      name: t(item.labelKey),
      description: t(`${item.labelKey}Desc`),
      href: item.routeKey || '/',
      icon: getIconFromKey(item.iconKey),
      contexts: item.contexts as DashboardContext[],
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
  const { user } = useAuth();
  const { accountType } = useAccountContext();
  const t = useT();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { items: apiNavItems } = useNavigationItems();

  // Transform API items to sections
  const apiSections = useMemo(() => {
    if (apiNavItems.length > 0) {
      return transformApiNavToSections(apiNavItems, t, accountType);
    }
    return null;
  }, [apiNavItems, t, accountType]);

  // Dynamic dashboard href based on current context
  const dashboardHref = accountType === 'organization' ? '/org' : '/';

  // Static fallback navigation
  const staticNavSections: NavSection[] = [
    {
      items: [
        // Single dashboard item that changes destination based on context
        { name: t('minside.dashboard'), description: t('minside.dashboardDesc'), href: dashboardHref, icon: <HomeIcon /> },
      ],
    },
    {
      title: t('minside.myActivity'),
      items: [
        { name: t('minside.myBookings'), description: t('minside.myBookingsDesc'), href: '/bookings', icon: <BookOpenIcon />, contexts: ['personal'] },
        { name: t('minside.myCalendar'), description: t('minside.myCalendarDesc'), href: '/calendar', icon: <CalendarIcon />, contexts: ['personal'] },
        { name: t('minside.seasons'), description: t('minside.seasonsDesc'), href: '/seasons', icon: <RepeatIcon />, contexts: ['personal'] },
        { name: t('minside.messages'), description: t('minside.messagesDesc'), href: '/messages', icon: <MessageIcon />, contexts: ['personal', 'organization'] },
        { name: t('minside.billing'), description: t('minside.billingDesc'), href: '/billing', icon: <CreditCardIcon />, contexts: ['personal'] },
        { name: t('minside.notifications'), description: t('minside.notificationsDesc'), href: '/notifications', icon: <MessageIcon />, badge: 2, badgeColor: 'danger', contexts: ['personal', 'organization'] },
      ],
    },
    {
      title: t('minside.account'),
      items: [
        { name: t('minside.settings'), description: t('minside.settingsDesc'), href: '/settings', icon: <SettingsIcon />, contexts: ['personal'] },
        { name: t('minside.preferences'), description: t('minside.preferencesDesc'), href: '/preferences', icon: <SettingsIcon />, contexts: ['personal'] },
        { name: t('minside.help'), description: t('minside.helpDesc'), href: '/help', icon: <BookOpenIcon />, contexts: ['personal', 'organization'] },
      ],
    },
    {
      title: t('org.organization'),
      items: [
        { name: t('org.bookings'), description: t('org.bookingsDesc'), href: '/org/bookings', icon: <BookOpenIcon />, contexts: ['organization'] },
        { name: t('org.invoices'), description: t('org.invoicesDesc'), href: '/org/invoices', icon: <CreditCardIcon />, contexts: ['organization'] },
        { name: t('org.members'), description: t('org.membersDesc'), href: '/org/members', icon: <UsersIcon />, contexts: ['organization'] },
        { name: t('org.seasonRental'), description: t('org.seasonRentalDesc'), href: '/org/season-rental', icon: <RepeatIcon />, contexts: ['organization'] },
        { name: t('org.notifications'), description: t('org.notificationsDesc'), href: '/org/notifications', icon: <MessageIcon />, contexts: ['organization'] },
        { name: t('org.settings'), description: t('org.settingsDesc'), href: '/org/settings', icon: <SettingsIcon />, contexts: ['organization'] },
        { name: t('org.activity'), description: t('org.activityDesc'), href: '/org/activity', icon: <CalendarIcon />, contexts: ['organization'] },
      ],
    },
  ];

  // Filter static nav sections and items based on current account context (fallback only)
  const filteredStaticSections = useMemo(() => {
    return staticNavSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          // If no contexts specified, show to all
          if (!item.contexts || item.contexts.length === 0) {
            return true;
          }
          // Show item if current accountType is in the item's contexts
          return item.contexts.includes(accountType);
        }),
      }))
      // Remove sections with no items after filtering
      .filter((section) => section.items.length > 0);
  }, [accountType, t]);

  // Use API sections if available, otherwise fall back to static
  const filteredNavSections = apiSections || filteredStaticSections;

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      {isMobile && (
        <Button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={t('components.sidebar.openMenu')}
          style={{
            position: 'fixed',
            top: 'var(--ds-spacing-4)',
            left: 'var(--ds-spacing-4)',
            width: '44px',
            height: '44px',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            color: 'var(--ds-color-neutral-text-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: 'var(--ds-shadow-md)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
          }}
        >
          <MenuIcon />
        </Button>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
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
          <SidebarContent navSections={filteredNavSections} user={user} t={t} />
        </aside>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          position="left"
          size="lg"
          overlay={true}
          closeOnOverlayClick={true}
          closeOnEscape={true}
          aria-label={t('common.navigation_menu')}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
            }}
          >
            <SidebarContent
              navSections={filteredNavSections}
              user={user}
              onItemClick={() => setIsMobileMenuOpen(false)}
              t={t}
            />
          </div>
        </Drawer>
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
    </>
  );
}
