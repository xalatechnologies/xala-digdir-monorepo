/**
 * BackofficeSidebar
 * 
 * Database-driven sidebar using the DK API menu resolution endpoint.
 * Uses @xalatechnologies/platform/ui DashboardSidebar component for rendering.
 * 
 * Features:
 * - DTO-driven rendering from useBackofficeMenu() hook
 * - No client-side permission filtering (already done server-side)
 * - Icon mapping from iconKey to React components
 * - Fallback to legacy hardcoded menu if API unavailable
 * - Mobile-responsive with drawer support
 */

import { useMemo } from 'react';
import {
  DashboardSidebar,
  type SidebarSection,
  type SidebarNavItem,
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
  ClockIcon,
  CheckCircleIcon,
  ShieldIcon,
  BellIcon,
  InfoIcon,
  Spinner,
} from '@xalatechnologies/platform/ui';
import { useAuth } from '@xala/auth';
import { useBackofficeMenu, usePendingGdprRequests } from '@digilist/client-sdk/hooks';
import { useT } from '@xala/i18n';
import { useBackofficeRole } from '../../hooks/useBackofficeRole';
import { Sidebar as LegacySidebar } from './Sidebar';

interface BackofficeSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <HomeIcon />,
  building: <BuildingIcon />,
  calendar: <CalendarIcon />,
  'calendar-check': <CalendarIcon />,
  book: <BookOpenIcon />,
  'book-open': <BookOpenIcon />,
  repeat: <RepeatIcon />,
  message: <MessageIcon />,
  users: <UsersIcon />,
  organization: <OrganizationIcon />,
  chart: <ChartIcon />,
  'chart-bar': <ChartIcon />,
  settings: <SettingsIcon />,
  cog: <SettingsIcon />,
  clock: <ClockIcon />,
  check: <CheckCircleIcon />,
  'check-circle': <CheckCircleIcon />,
  shield: <ShieldIcon />,
  bell: <BellIcon />,
  currency: <ChartIcon />,
  document: <BookOpenIcon />,
  'document-text': <BookOpenIcon />,
  info: <InfoIcon />,
  'question-circle': <InfoIcon />,
};

function getIcon(iconKey: string | undefined): React.ReactNode {
  if (!iconKey) return <HomeIcon />;
  return ICON_MAP[iconKey] ?? <HomeIcon />;
}

interface MenuItem {
  key: string;
  label: string;
  description?: string;
  href: string;
  iconKey?: string;
  badge?: number;
  badgeColor?: string;
}

interface MenuCategory {
  key: string;
  label?: string;
  items: MenuItem[];
}

function mapMenuItemToNavItem(item: MenuItem, badgeCounts?: Record<string, number>): SidebarNavItem {
  return {
    name: item.label,
    description: item.description,
    href: item.href,
    icon: getIcon(item.iconKey),
    badge: badgeCounts?.[item.key] ?? item.badge,
    badgeColor: item.badgeColor as SidebarNavItem['badgeColor'],
  };
}

function mapCategoryToSection(category: MenuCategory, badgeCounts?: Record<string, number>): SidebarSection {
  return {
    title: category.label || undefined,
    items: category.items.map((item) => mapMenuItemToNavItem(item, badgeCounts)),
  };
}

export function BackofficeSidebar({ isMobileOpen = false, onMobileClose }: BackofficeSidebarProps) {
  const t = useT();
  const { user } = useAuth();
  const { isAdmin } = useBackofficeRole();
  
  const { data: menuData, isLoading, error } = useBackofficeMenu({ language: 'nb' });
  
  const { data: pendingGdprData } = usePendingGdprRequests({ limit: 1 });
  const pendingGdprCount = pendingGdprData?.meta?.total ?? pendingGdprData?.data?.length ?? 0;

  const badgeCounts = useMemo(() => ({
    'gdpr-requests': pendingGdprCount,
  }), [pendingGdprCount]);

  const sections = useMemo<SidebarSection[]>(() => {
    if (!menuData?.data?.categories) {
      return [];
    }

    return menuData.data.categories.map((category) => 
      mapCategoryToSection(category, badgeCounts)
    );
  }, [menuData, badgeCounts]);

  const logo = (
    <img
      src="/logo.svg"
      alt={t('app.name')}
      style={{ height: '40px', width: 'auto' }}
    />
  );

  const footer = user ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-4)' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
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
        {user.name?.charAt(0).toUpperCase() ?? 'U'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-semibold)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.name}
        </div>
        <div
          style={{
            fontSize: 'var(--ds-font-size-xs)',
            color: 'var(--ds-color-neutral-text-subtle)',
            marginTop: '2px',
          }}
        >
          {isAdmin ? t('role.admin') : t('role.caseHandler')}
        </div>
      </div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <aside
        style={{
          width: '320px',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Spinner />
      </aside>
    );
  }

  if (error || sections.length === 0) {
    return <LegacySidebar />;
  }

  return (
    <DashboardSidebar
      logo={logo}
      title={t('app.name').toUpperCase()}
      subtitle={t('app.section.backoffice')}
      sections={sections}
      footer={footer}
      width={320}
      isMobileOpen={isMobileOpen}
      onMobileClose={onMobileClose}
      data-testid="backoffice-sidebar"
    />
  );
}

export default BackofficeSidebar;
