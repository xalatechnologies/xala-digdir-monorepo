/**
 * ActionMenu & ContextMenu Components
 *
 * Dropdown menus for actions and context menus.
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/ActionMenu
 */

'use client';

import React, { useState, useCallback, useRef, useEffect, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface MenuGroup {
  id: string;
  label?: string;
  items: MenuItem[];
}

export interface ActionMenuProps {
  trigger: ReactNode;
  items?: MenuItem[];
  groups?: MenuGroup[];
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface ContextMenuProps {
  children: ReactNode;
  items?: MenuItem[];
  groups?: MenuGroup[];
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// =============================================================================
// MenuContent Component
// =============================================================================

interface MenuContentProps {
  items?: MenuItem[];
  groups?: MenuGroup[];
  onClose: () => void;
  style?: React.CSSProperties;
}

function MenuContent({ items, groups, onClose, style }: MenuContentProps): React.ReactElement {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const allItems = groups ? groups.flatMap((g) => g.items) : items || [];

  useEffect(() => {
    menuRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < allItems.length && allItems[next]?.disabled) next++;
            return next < allItems.length ? next : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && allItems[next]?.disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const item = allItems[focusedIndex];
          if (item && !item.disabled) {
            item.onClick?.();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [allItems, focusedIndex, onClose]
  );

  const renderItem = (item: MenuItem, globalIndex: number) => {
    const isFocused = focusedIndex === globalIndex;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          if (!item.disabled) {
            item.onClick?.();
            onClose();
          }
        }}
        onMouseEnter={() => setFocusedIndex(globalIndex)}
        disabled={item.disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-3)',
          width: '100%',
          padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
          fontSize: 'var(--ds-font-size-sm)',
          textAlign: 'left',
          backgroundColor: isFocused ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
          color: item.danger
            ? 'var(--ds-color-danger-text-default)'
            : item.disabled
            ? 'var(--ds-color-neutral-text-subtle)'
            : 'var(--ds-color-neutral-text-default)',
          borderWidth: '0',
          borderRadius: 'var(--ds-border-radius-sm)',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.5 : 1,
        }}
      >
        {item.icon && <span style={{ display: 'flex', width: 'var(--ds-sizing-4)' }}>{item.icon}</span>}
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.shortcut && (
          <span
            style={{
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              fontFamily: 'var(--ds-font-family-mono)',
            }}
          >
            {item.shortcut}
          </span>
        )}
      </button>
    );
  };

  let globalIndex = -1;

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        boxShadow: 'var(--ds-shadow-lg)',
        padding: 'var(--ds-spacing-1)',
        minWidth: 'var(--ds-sizing-45)',
        outline: 'none',
        ...style,
      }}
    >
      {groups ? (
        groups.map((group, groupIndex) => (
          <div key={group.id}>
            {group.label && (
              <div
                style={{
                  padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-semibold)',
                  color: 'var(--ds-color-neutral-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              globalIndex++;
              return renderItem(item, globalIndex);
            })}
            {groupIndex < groups.length - 1 && (
              <div
                style={{
                  height: 'var(--ds-border-width-default)',
                  backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                  margin: 'var(--ds-spacing-1) 0',
                }}
              />
            )}
          </div>
        ))
      ) : (
        items?.map((item) => {
          globalIndex++;
          return renderItem(item, globalIndex);
        })
      )}
    </div>
  );
}

// =============================================================================
// ActionMenu Component
// =============================================================================

export function ActionMenu({
  trigger,
  items,
  groups,
  align = 'start',
  side = 'bottom',
  disabled = false,
  className,
  style,
}: ActionMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getPositionStyles = (): React.CSSProperties => {
    const positions: Record<string, React.CSSProperties> = {
      'bottom-start': { top: '100%', left: 0, marginTop: 'var(--ds-spacing-1)' },
      'bottom-center': { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 'var(--ds-spacing-1)' },
      'bottom-end': { top: '100%', right: 0, marginTop: 'var(--ds-spacing-1)' },
      'top-start': { bottom: '100%', left: 0, marginBottom: 'var(--ds-spacing-1)' },
      'top-center': { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 'var(--ds-spacing-1)' },
      'top-end': { bottom: '100%', right: 0, marginBottom: 'var(--ds-spacing-1)' },
    };
    return positions[`${side}-${align}`] ?? positions['bottom-start'] ?? { top: '100%', left: 0 };
  };

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', display: 'inline-block', ...style }}>
      <div onClick={() => !disabled && setIsOpen(!isOpen)} style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
        {trigger}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', zIndex: 50, ...getPositionStyles() }}>
          <MenuContent items={items} groups={groups} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ContextMenu Component
// =============================================================================

export function ContextMenu({
  children,
  items,
  groups,
  disabled = false,
  className,
  style,
}: ContextMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setPosition({ x: e.clientX, y: e.clientY });
      setIsOpen(true);
    },
    [disabled]
  );

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={containerRef} className={className} onContextMenu={handleContextMenu} style={style}>
        {children}
      </div>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <MenuContent items={items} groups={groups} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}

export default { ActionMenu, ContextMenu };
