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
  ShieldIcon,
} from '@xalatechnologies/platform/ui';
import { useAuth } from '@xala/auth';
import { useBackofficeRole, type EffectiveBackofficeRole } from '../../hooks/useBackofficeRole';
import { useCapabilityContext } from '../../providers/CapabilityProvider';
import type { Capability } from '../../lib/capabilities';
import { usePendingGdprRequests, useAdminNavigation } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';

interface NavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Roles that can view this nav item.
   * Empty array or undefined = visible to all authenticated users.
   * @deprecated Use `capability` or `capabilities` instead for fine-grained access control.
   */
  roles?: EffectiveBackofficeRole[];
  /**
   * Single capability required to view this nav item.
   * If specified, the user must have this capability to see the item.
   */
  capability?: Capability;
  /**
   * Multiple capabilities for nav item visibility.
   * If specified, the user must have at least one of these capabilities (OR logic).
   * For AND logic, use a single capability that encompasses the required permissions.
   */
  capabilities?: Capability[];
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

/**
 * Map API AdminMenuItem to NavItem format
 * Converts icon names to React components and adds required properties
 */
function mapApiMenuItemToNavItem(apiItem: any): NavItem {
  // Icon name to React component mapping
  const iconMap: Record<string, React.ReactNode> = {
    shield: <ShieldIcon />,
    home: <HomeIcon />,
    settings: <SettingsIcon />,
    building: <BuildingIcon />,
    currency: <ChartIcon />,
    'calendar-check': <CalendarIcon />,
    calendar: <CalendarIcon />,
    repeat: <RepeatIcon />,
    users: <UsersIcon />,
    message: <MessageIcon />,
    'document-text': <BookOpenIcon />,
    cog: <SettingsIcon />,
    chart: <ChartIcon />,
    'document-chart': <ChartIcon />,
    clock: <ClockIcon />,
    star: <CheckCircleIcon />,
    'question-circle': <BookOpenIcon />,
  };

  return {
    name: apiItem.label,
    description: apiItem.label, // Use label as description for now
    href: apiItem.href,
    icon: iconMap[apiItem.icon] || <HomeIcon />,
    // No capability check - API already filtered menu based on permissions
  };
}

/**
 * Helper function to check if a nav item should be visible based on capability checks.
 * Supports both single capability and multiple capabilities (OR logic).
 */
function hasPermission(
  item: NavItem,
  hasCapability: (cap: Capability) => boolean,
  hasAnyCapability: (caps: Capability[]) => boolean,
  effectiveRole: EffectiveBackofficeRole | null
): boolean {
  // If capability is specified, check it
  if (item.capability) {
    return hasCapability(item.capability);
  }

  // If capabilities array is specified, check any (OR logic)
  if (item.capabilities && item.capabilities.length > 0) {
    return hasAnyCapability(item.capabilities);
  }

  // If roles are specified (legacy), check role membership
  if (item.roles && item.roles.length > 0) {
    return effectiveRole ? item.roles.includes(effectiveRole) : false;
  }

  // No restrictions - visible to all authenticated users
  return true;
}

export function Sidebar() {
  const t = useT();
  const { user } = useAuth();
  const { effectiveRole } = useBackofficeRole();
  const { hasCapability, hasAnyCapability } = useCapabilityContext();

  // Get pending GDPR requests count for badge
  const { data: pendingGdprData } = usePendingGdprRequests({ limit: 1 });
  const pendingGdprCount = pendingGdprData?.meta?.total ?? pendingGdprData?.data?.length ?? 0;

  // Try to fetch server-driven navigation (fallback to hardcoded menu on error)
  const { data: apiNavigation } = useAdminNavigation({
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Map API menu to NavSection format if available
  let navSections: NavSection[];
  
  if (apiNavigation?.menu && apiNavigation.menu.length > 0) {
    // Group menu items by their group field
    const grouped = new Map<string | undefined, any[]>();
    
    apiNavigation.menu.forEach((item: any) => {
      const group = item.group;
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group)!.push(item);
    });
    
    // Build sections from grouped items
    navSections = [];
    
    // Dashboard first (items without group)
    const ungroupedItems = grouped.get(undefined) || [];
    if (ungroupedItems.length > 0) {
      navSections.push({
        items: ungroupedItems.map(mapApiMenuItemToNavItem),
      });
    }
    
    // Then add grouped sections
    grouped.forEach((items, groupName) => {
      if (groupName !== undefined) {
        navSections.push({
          title: groupName,
          items: items.map(mapApiMenuItemToNavItem),
        });
      }
    });
  } else {
    // Fallback to hardcoded menu
    navSections = [
    // [Overview] - Dashboard (always visible to authenticated users)
    {
      items: [
        {
          name: t('nav.dashboard'),
          description: t('nav.dashboardDesc'),
          href: '/',
          icon: <HomeIcon />,
          capability: 'CAP_NAV_DASHBOARD',
        },
      ],
    },
    // [Work] - Bookings, Calendar (org_member scope)
    {
      title: t('nav.sections.work'),
      items: [
        {
          name: t('nav.bookings'),
          description: t('nav.bookingsDesc'),
          href: '/bookings',
          icon: <BookOpenIcon />,
          badge: 20,
          badgeColor: 'accent',
          capability: 'CAP_NAV_BOOKINGS',
        },
        {
          name: t('nav.calendar'),
          description: t('nav.calendarDesc'),
          href: '/calendar',
          icon: <CalendarIcon />,
          capability: 'CAP_NAV_CALENDAR',
        },
      ],
    },
    // [Communication] - Messages (feature-gated for org_member)
    {
      title: t('nav.sections.communication'),
      items: [
        {
          name: t('nav.messages'),
          description: t('nav.messagesDesc'),
          href: '/messages',
          icon: <MessageIcon />,
          badge: 3,
          badgeColor: 'danger',
          capability: 'CAP_NAV_MESSAGES',
        },
      ],
    },
    // [Economy] - Invoices (feature-gated for org_member with økonomi role)
    {
      title: t('nav.sections.economy'),
      items: [
        {
          name: t('nav.invoices'),
          description: t('nav.invoicesDesc'),
          href: '/economy/invoices',
          icon: <ChartIcon />,
          capability: 'CAP_NAV_ECONOMY',
        },
      ],
    },
    // [Reports] - Reports/Exports (feature-gated)
    {
      title: t('nav.sections.reports'),
      items: [
        {
          name: t('nav.reports'),
          description: t('nav.reportsDesc'),
          href: '/reports',
          icon: <ChartIcon />,
          capability: 'CAP_NAV_REPORTS',
        },
      ],
    },
    // [Help] - Help & Support (always visible to org_member)
    {
      title: t('nav.sections.help'),
      items: [
        {
          name: t('nav.help'),
          description: t('nav.helpDesc'),
          href: '/help',
          icon: <BookOpenIcon />,
          capability: 'CAP_NAV_HELP',
        },
      ],
    },
    // === ORG ADMIN SECTION ===
    // Visible to org_admin and org_member roles for managing assigned objects
    {
      title: t('nav.sections.organization'),
      items: [
        {
          name: t('nav.blocks'),
          description: t('nav.blocksDesc'),
          href: '/blocks',
          icon: <ShieldIcon />,
          capability: 'CAP_NAV_BLOCKS',
        },
      ],
    },
    // === ADMIN-ONLY SECTIONS BELOW ===
    // These sections are NOT visible to org_member
    {
      title: t('nav.sections.administration'),
      items: [
        {
          name: t('nav.rentalObjects'),
          description: t('nav.rentalObjectsDesc'),
          href: '/rental-objects',
          icon: <BuildingIcon />,
          capability: 'CAP_LISTING_EDIT',
        },
        {
          name: t('nav.seasons'),
          description: t('nav.seasonsDesc'),
          href: '/seasons',
          icon: <RepeatIcon />,
          capability: 'CAP_BOOKING_MANAGE',
        },
      ],
    },
    {
      title: t('nav.sections.usersAndOrganizations'),
      items: [
        { name: t('nav.organizations'), description: t('nav.organizationsDesc'), href: '/organizations', icon: <OrganizationIcon />, capability: 'CAP_ORG_ADMIN' },
        { name: t('nav.users'), description: t('nav.usersDesc'), href: '/users', icon: <UsersIcon />, capability: 'CAP_USER_ADMIN' },
      ],
    },
    {
      title: t('nav.sections.caseHandler'),
      items: [
        { name: t('nav.workQueue'), description: t('nav.workQueueDesc'), href: '/work-queue', icon: <ClockIcon />, capability: 'CAP_BOOKING_APPROVE' },
        { name: t('nav.seasonApplications'), description: t('nav.seasonApplicationsDesc'), href: '/season-applications', icon: <RepeatIcon />, capability: 'CAP_BOOKING_APPROVE' },
        { name: t('nav.allocationPlanner'), description: t('nav.allocationPlannerDesc'), href: '/allocation-planner', icon: <CalendarIcon />, capability: 'CAP_BOOKING_MANAGE' },
        { name: t('nav.decisionForms'), description: t('nav.decisionFormsDesc'), href: '/decision-forms', icon: <CheckCircleIcon />, capability: 'CAP_BOOKING_APPROVE' },
        { name: t('nav.auditTimeline'), description: t('nav.auditTimelineDesc'), href: '/audit-timeline', icon: <ClockIcon />, capability: 'CAP_AUDIT_VIEW' },
      ],
    },
    {
      title: t('nav.sections.admin'),
      items: [
        { name: t('nav.pricingRules'), description: t('nav.pricingRulesDesc'), href: '/pricing-rules', icon: <SettingsIcon />, capability: 'CAP_SETTINGS_ADMIN' },
      ],
    },
    {
      title: t('nav.sections.tenant'),
      items: [
        { name: t('nav.features'), description: t('nav.featuresDesc'), href: '/tenant/features', icon: <SettingsIcon />, capability: 'CAP_SETTINGS_ADMIN' },
        { name: t('nav.platformSettings'), description: t('nav.platformSettingsDesc'), href: '/tenant/settings', icon: <SettingsIcon />, capability: 'CAP_SETTINGS_ADMIN' },
        { name: t('nav.branding'), description: t('nav.brandingDesc'), href: '/tenant/branding', icon: <BuildingIcon />, capability: 'CAP_SETTINGS_ADMIN' },
        { name: t('nav.systemLog'), description: t('nav.systemLogDesc'), href: '/tenant/audit-log', icon: <ClockIcon />, capability: 'CAP_AUDIT_VIEW' },
      ],
    },
    {
      title: t('nav.sections.system'),
      items: [
        { name: t('nav.gdprRequests'), description: t('nav.gdprRequestsDesc'), href: '/gdpr-requests', icon: <ShieldIcon />, badge: pendingGdprCount, badgeColor: 'warning', capability: 'CAP_SETTINGS_ADMIN' },
        { name: t('nav.reviews'), description: t('nav.reviewsDesc'), href: '/reviews/moderation', icon: <CheckCircleIcon />, capability: 'CAP_SETTINGS_ADMIN' },
        { name: t('nav.settings'), description: t('nav.settingsDesc'), href: '/settings', icon: <SettingsIcon />, capability: 'CAP_SYSTEM_CONFIG' },
      ],
    },
  ];
  }

  // Filter items based on capability checks
  // Priority: capability > capabilities > roles (legacy)
  // Items with no restrictions are visible to all authenticated users
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasPermission(item, hasCapability, hasAnyCapability, effectiveRole)
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      style={{
        width: '320px',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Logo Section - Clickable to navigate to Dashboard */}
      <NavLink
        to="/"
        style={{
          height: '72px',
          padding: '0 var(--ds-spacing-6)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-3)' }}>
          <img
            src="/logo.svg"
            alt={t('app.name')}
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
              {t('app.name').toUpperCase()}
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
              {t('app.section.backoffice')}
            </div>
          </div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav data-testid="sidebar-nav" style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
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
                {effectiveRole === 'admin' || effectiveRole === 'super_admin' ? t('role.admin') : t('role.caseHandler')}
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
