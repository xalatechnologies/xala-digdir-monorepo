/**
 * Breadcrumb - Navigation breadcrumb component
 */

import React from 'react';
import { Link } from '@digdir/designsystemet-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({
  items,
  separator = '/',
  className,
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        fontSize: '0.875rem',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
              {separator}
            </span>
          )}
          {item.href || item.onClick ? (
            <Link
              href={item.href || '#'}
              onClick={item.onClick}
              style={{ color: index === items.length - 1 ? 'var(--ds-color-neutral-text-default)' : undefined }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              style={{
                color: index === items.length - 1 ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                fontWeight: index === items.length - 1 ? 500 : 400,
              }}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
