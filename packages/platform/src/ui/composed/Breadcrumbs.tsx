/**
 * Breadcrumbs Component
 *
 * Navigation breadcrumbs with route integration support.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/Breadcrumbs
 */

'use client';

import React, { type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  homeIcon?: ReactNode;
  onNavigate?: (href: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

// =============================================================================
// Breadcrumbs Component
// =============================================================================

export function Breadcrumbs({
  items,
  separator,
  maxItems = 0,
  homeIcon,
  onNavigate,
  className,
  style,
}: BreadcrumbsProps): React.ReactElement {
  const defaultSeparator = (
    <span style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex' }}>
      <ChevronRightIcon />
    </span>
  );

  const renderSeparator = separator || defaultSeparator;

  const truncateItems = (allItems: BreadcrumbItem[]): (BreadcrumbItem | 'ellipsis')[] => {
    if (maxItems <= 0 || allItems.length <= maxItems) {
      return allItems;
    }
    const first = allItems[0];
    if (!first) return allItems;
    const last = allItems.slice(-Math.max(1, maxItems - 2));
    return [first, 'ellipsis' as const, ...last];
  };

  const displayItems = truncateItems(items);

  const handleClick = (e: React.MouseEvent, href?: string) => {
    if (href && onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={className} style={style}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-2)',
          margin: 0,
          padding: 0,
          listStyle: 'none',
          flexWrap: 'wrap',
        }}
      >
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;

          if (item === 'ellipsis') {
            return (
              <li key="ellipsis" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                <span style={{ color: 'var(--ds-color-neutral-text-subtle)', display: 'flex' }}>
                  <DotsIcon />
                </span>
                {renderSeparator}
              </li>
            );
          }

          const isHome = index === 0 && homeIcon;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
              {isCurrent || !item.href ? (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: isCurrent ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-normal)',
                    color: isCurrent ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {isHome ? homeIcon || <HomeIcon /> : item.icon}
                  {!isHome && item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    fontSize: 'var(--ds-font-size-sm)',
                    color: 'var(--ds-color-accent-text-default)',
                    textDecoration: 'none',
                  }}
                >
                  {isHome ? homeIcon || <HomeIcon /> : item.icon}
                  {!isHome && item.label}
                </a>
              )}
              {!isLast && renderSeparator}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// =============================================================================
// useBreadcrumbs Hook
// =============================================================================

export interface UseBreadcrumbsOptions {
  homeLabel?: string;
  homeHref?: string;
  pathLabels?: Record<string, string>;
}

export function useBreadcrumbs(pathname: string, options: UseBreadcrumbsOptions = {}): BreadcrumbItem[] {
  const { homeLabel = 'Home', homeHref = '/', pathLabels = {} } = options;
  const segments = pathname.split('/').filter(Boolean);

  const items: BreadcrumbItem[] = [{ label: homeLabel, href: homeHref }];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    const label = pathLabels[segment] || pathLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    items.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  });

  return items;
}

export default { Breadcrumbs, useBreadcrumbs };
