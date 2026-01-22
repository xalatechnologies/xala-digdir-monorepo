/**
 * BottomNavigation Component
 *
 * Mobile bottom navigation bar.
 */

import React from 'react';
import type { BottomNavigationItem } from '../types/navigation';

export interface BottomNavigationProps {
  items: BottomNavigationItem[];
  activeItem?: string;
  onItemClick?: (item: BottomNavigationItem) => void;
}

export function BottomNavigation({ items, activeItem, onItemClick }: BottomNavigationProps): React.ReactElement {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--ds-color-neutral-surface-default)',
      borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.5rem 0',
      zIndex: 100,
    }}>
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onItemClick?.(item)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeItem === item.id ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {item.icon && <span>{item.icon}</span>}
          <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
