/**
 * Sidebar
 *
 * MinSide sidebar using DashboardSidebar from @xala/ds.
 * Contains app-specific navigation data and RBAC filtering.
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DashboardSidebar,
  type SidebarNavItem,
  type SidebarSection,
  HomeIcon,
  CalendarIcon,
  BookOpenIcon,
  MessageIcon,
  SettingsIcon,
  RepeatIcon,
  UsersIcon,
  Button,
} from '@xala/ds';
import { useT } from '@xala/i18n';
import { useAuth } from '@xala/auth';
import { useAccountContext } from '../../providers/AccountContextProvider';

// Icon for Billing/Credit Card
function CreditCardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
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

const MOBILE_BREAKPOINT = 768;

type DashboardContext = 'personal' | 'organization';

export function Sidebar() {
  const { user } = useAuth();
  const { accountType } = useAccountContext();
  const t = useT();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  // Track viewport size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Dynamic dashboard href based on context
  const dashboardHref = accountType === 'organization' ? '/org' : '/';

  // Navigation sections with context filtering
  const navSections: SidebarSection[] = useMemo(() => [
    {
      items: [
        { name: t('minside.dashboard'), description: t('minside.dashboardDesc'), href: dashboardHref, icon: <HomeIcon /> },
      ],
    },
    {
      title: t('minside.myActivity'),
      items: [
        { name: t('minside.myBookings'), description: t('minside.myBookingsDesc'), href: '/bookings', icon: <BookOpenIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.myCalendar'), description: t('minside.myCalendarDesc'), href: '/calendar', icon: <CalendarIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.seasons'), description: t('minside.seasonsDesc'), href: '/seasons', icon: <RepeatIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.messages'), description: t('minside.messagesDesc'), href: '/messages', icon: <MessageIcon />, contexts: ['personal', 'organization'] as DashboardContext[] },
        { name: t('minside.billing'), description: t('minside.billingDesc'), href: '/billing', icon: <CreditCardIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.notifications'), description: t('minside.notificationsDesc'), href: '/notifications', icon: <MessageIcon />, badge: 2, badgeColor: 'danger' as const, contexts: ['personal', 'organization'] as DashboardContext[] },
      ],
    },
    {
      title: t('minside.account'),
      items: [
        { name: t('minside.settings'), description: t('minside.settingsDesc'), href: '/settings', icon: <SettingsIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.preferences'), description: t('minside.preferencesDesc'), href: '/preferences', icon: <SettingsIcon />, contexts: ['personal'] as DashboardContext[] },
        { name: t('minside.help'), description: t('minside.helpDesc'), href: '/help', icon: <BookOpenIcon />, contexts: ['personal', 'organization'] as DashboardContext[] },
      ],
    },
    {
      title: t('org.organization'),
      items: [
        { name: t('org.bookings'), description: t('org.bookingsDesc'), href: '/org/bookings', icon: <BookOpenIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.invoices'), description: t('org.invoicesDesc'), href: '/org/invoices', icon: <CreditCardIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.members'), description: t('org.membersDesc'), href: '/org/members', icon: <UsersIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.seasonRental'), description: t('org.seasonRentalDesc'), href: '/org/season-rental', icon: <RepeatIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.notifications'), description: t('org.notificationsDesc'), href: '/org/notifications', icon: <MessageIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.settings'), description: t('org.settingsDesc'), href: '/org/settings', icon: <SettingsIcon />, contexts: ['organization'] as DashboardContext[] },
        { name: t('org.activity'), description: t('org.activityDesc'), href: '/org/activity', icon: <CalendarIcon />, contexts: ['organization'] as DashboardContext[] },
      ],
    },
  ], [t, dashboardHref]);

  // Filter items by current context
  const filterByContext = (item: SidebarNavItem): boolean => {
    if (!item.contexts || item.contexts.length === 0) return true;
    return item.contexts.includes(accountType);
  };

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

      {/* DashboardSidebar from @xala/ds - uses default 400px width */}
      <DashboardSidebar
        logo={
          <img
            src="/logo.svg"
            alt="Digilist"
            style={{ height: '40px', width: 'auto' }}
          />
        }
        title={t('app.name')}
        subtitle={t('components.sidebar.appSubtitle')}
        sections={navSections}
        user={user}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
        filterItem={filterByContext}
        data-testid="minside-sidebar"
      />
    </>
  );
}
