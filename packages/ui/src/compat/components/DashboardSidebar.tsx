/**
 * DashboardSidebar Component
 *
 * Sidebar navigation for dashboard applications.
 */

import React, { useState } from 'react';
import type { SidebarSection, SidebarNavItem } from '../types/navigation';

export interface DashboardSidebarProps {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  sections: SidebarSection[];
  user?: { name?: string; email?: string } | null;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  filterItem?: (item: SidebarNavItem) => boolean;
  'data-testid'?: string;
}

export function DashboardSidebar({
  logo,
  title,
  subtitle,
  sections,
  user,
  isMobileOpen = false,
  onMobileClose,
  filterItem,
  'data-testid': testId,
}: DashboardSidebarProps): React.ReactElement {
  const filteredSections = sections.map(section => ({
    ...section,
    items: filterItem ? section.items.filter(filterItem) : section.items,
  })).filter(section => section.items.length > 0);

  const sidebarContent = (
    <nav
      data-testid={testId}
      style={{
        width: '280px',
        height: '100vh',
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        {logo && <div style={{ marginBottom: '0.5rem' }}>{logo}</div>}
        {title && <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{title}</div>}
        {subtitle && <div style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>{subtitle}</div>}
      </div>

      {/* Sections */}
      {filteredSections.map((section, sectionIdx) => (
        <div key={sectionIdx} style={{ marginBottom: '1rem' }}>
          {section.title && (
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              textTransform: 'uppercase',
              color: 'var(--ds-color-neutral-text-subtle)',
              marginBottom: '0.5rem',
              padding: '0 0.5rem',
            }}>
              {section.title}
            </div>
          )}
          {section.items.map((item, itemIdx) => (
            <a
              key={itemIdx}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--ds-border-radius-md)',
                textDecoration: 'none',
                color: 'var(--ds-color-neutral-text-default)',
                fontSize: '0.875rem',
                marginBottom: '0.25rem',
              }}
            >
              {item.icon && <span style={{ flexShrink: 0 }}>{item.icon}</span>}
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge !== undefined && (
                <span style={{
                  backgroundColor: item.badgeColor === 'danger' ? 'var(--ds-color-danger-base-default)' : 'var(--ds-color-neutral-base-default)',
                  color: 'white',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '999px',
                }}>
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      ))}

      {/* User footer */}
      {user && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}>
          <div style={{ fontWeight: 500 }}>{user.name}</div>
          {user.email && <div style={{ fontSize: '0.875rem', color: 'var(--ds-color-neutral-text-subtle)' }}>{user.email}</div>}
        </div>
      )}
    </nav>
  );

  // Mobile overlay
  if (isMobileOpen) {
    return (
      <>
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
          }}
        />
        <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 1000 }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
}
