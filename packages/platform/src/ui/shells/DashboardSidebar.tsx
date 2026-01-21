/**
 * DashboardSidebar
 *
 * Exact copy of MinSide sidebar styling, made reusable.
 * Preserves all visual characteristics: 72px header, 48px icons, typography.
 */

import * as React from 'react';
import { forwardRef, useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Paragraph } from '@digdir/designsystemet-react';
import { Drawer } from '../composed/Drawer';
import { ChevronRightIcon } from '../primitives/icons';

// =============================================================================
// Types
// =============================================================================

export interface SidebarNavItem {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  contexts?: ('personal' | 'organization')[];
  requiredPermissions?: string[];
  badge?: number;
  badgeColor?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export interface SidebarSection {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarUser {
  name: string;
  email: string;
}

export interface DashboardSidebarProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Logo image element */
  logo?: React.ReactNode;
  /** App title */
  title?: string;
  /** App subtitle */
  subtitle?: string;
  /** Navigation sections */
  sections: SidebarSection[];
  /** User info for footer */
  user?: SidebarUser | null;
  /** Width in pixels (default: 400) */
  width?: number;
  /** Mobile menu open state */
  isMobileOpen?: boolean;
  /** Mobile close callback */
  onMobileClose?: () => void;
  /** Filter function for items */
  filterItem?: (item: SidebarNavItem) => boolean;
  /** Translation function */
  t?: (key: string) => string;
  /** Test ID */
  'data-testid'?: string;
}

const MOBILE_BREAKPOINT = 768;

// =============================================================================
// SidebarNavItem - Exact copy from MinSide
// =============================================================================

interface NavItemProps {
  item: SidebarNavItem;
  onClick?: () => void;
}

function SidebarNavItemComponent({ item, onClick }: NavItemProps) {
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
      {/* Icon with background - 48px */}
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
          <ChevronRightIcon size={20} />
        </div>
      </div>
    </NavLink>
  );
}

// =============================================================================
// SidebarContent - Exact copy from MinSide
// =============================================================================

interface SidebarContentProps {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  sections: SidebarSection[];
  user?: SidebarUser | null;
  onItemClick?: () => void;
}

function SidebarContent({
  logo,
  title,
  subtitle,
  sections,
  user,
  onItemClick,
}: SidebarContentProps) {
  return (
    <>
      {/* Logo Section - 72px height, exact match */}
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
          {logo && (
            <div style={{ height: '40px', width: 'auto', flexShrink: 0 }}>
              {logo}
            </div>
          )}
          {title && (
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
                {title}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 'var(--ds-font-size-2xs)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    letterSpacing: 'var(--ds-font-letter-spacing-wide)',
                    marginTop: '2px',
                    textTransform: 'uppercase',
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: 'var(--ds-spacing-4) var(--ds-spacing-3)', overflowY: 'auto' }}>
        {sections.map((section, sectionIndex) => (
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
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarNavItemComponent item={item} onClick={onItemClick} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Info Section - exact match */}
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

      {/* CSS for hover states - exact match */}
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

// =============================================================================
// DashboardSidebar Component
// =============================================================================

export const DashboardSidebar = forwardRef<HTMLElement, DashboardSidebarProps>(
  (
    {
      logo,
      title,
      subtitle,
      sections,
      user,
      width = 400,
      isMobileOpen = false,
      onMobileClose,
      filterItem,
      className,
      'data-testid': testId = 'dashboard-sidebar',
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(
      typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
    );

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter sections
    const filteredSections = sections.map((section) => ({
      ...section,
      items: filterItem ? section.items.filter(filterItem) : section.items,
    })).filter((section) => section.items.length > 0);

    const handleItemClick = useCallback(() => {
      if (isMobile && onMobileClose) {
        onMobileClose();
      }
    }, [isMobile, onMobileClose]);

    return (
      <>
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            ref={ref as React.RefObject<HTMLElement>}
            className={className}
            data-testid={testId}
            style={{
              width: `${width}px`,
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            {...props}
          >
            <SidebarContent
              logo={logo}
              title={title}
              subtitle={subtitle}
              sections={filteredSections}
              user={user}
              onItemClick={handleItemClick}
            />
          </aside>
        )}

        {/* Mobile drawer */}
        {isMobile && (
          <Drawer
            isOpen={isMobileOpen}
            onClose={onMobileClose || (() => {})}
            position="left"
            size="lg"
            overlay={true}
            closeOnOverlayClick={true}
            closeOnEscape={true}
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
                logo={logo}
                title={title}
                subtitle={subtitle}
                sections={filteredSections}
                user={user}
                onItemClick={handleItemClick}
              />
            </div>
          </Drawer>
        )}
      </>
    );
  }
);

DashboardSidebar.displayName = 'DashboardSidebar';

export default DashboardSidebar;
