/**
 * CommandPalette Component
 *
 * Keyboard-driven command palette (Cmd+K / Ctrl+K).
 * SSR-safe with 'use client' directive.
 *
 * @module @xalatechnologies/platform/ui/composed/CommandPalette
 */

'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  group?: string;
  keywords?: string[];
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandGroup {
  id: string;
  label: string;
  priority?: number;
}

export interface CommandPaletteProps {
  commands: CommandItem[];
  groups?: CommandGroup[];
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  emptyMessage?: string;
  recentIds?: string[];
  maxRecent?: number;
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function matchesSearch(item: CommandItem, query: string): boolean {
  const q = query.toLowerCase();
  return (
    item.label.toLowerCase().includes(q) ||
    (item.description?.toLowerCase().includes(q) ?? false) ||
    (item.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false)
  );
}

// =============================================================================
// CommandPalette Component
// =============================================================================

export function CommandPalette({
  commands,
  groups = [],
  isOpen,
  onClose,
  placeholder = 'Type a command or search...',
  emptyMessage = 'No commands found',
  recentIds = [],
  maxRecent = 5,
  className,
  style,
}: CommandPaletteProps): React.ReactElement | null {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = useMemo(() => {
    const filtered = query ? commands.filter((cmd) => matchesSearch(cmd, query)) : commands;
    return filtered.filter((cmd) => !cmd.disabled);
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const result: { group: CommandGroup | null; items: CommandItem[] }[] = [];

    if (!query && recentIds.length > 0) {
      const recentItems = recentIds
        .slice(0, maxRecent)
        .map((id) => filteredCommands.find((cmd) => cmd.id === id))
        .filter((cmd): cmd is CommandItem => !!cmd);
      if (recentItems.length > 0) {
        result.push({ group: { id: 'recent', label: 'Recent' }, items: recentItems });
      }
    }

    const sortedGroups = [...groups].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const ungrouped: CommandItem[] = [];

    filteredCommands.forEach((cmd) => {
      if (!query && recentIds.includes(cmd.id)) return;
      if (!cmd.group) {
        ungrouped.push(cmd);
      }
    });

    if (ungrouped.length > 0) {
      result.push({ group: null, items: ungrouped });
    }

    sortedGroups.forEach((group) => {
      const items = filteredCommands.filter((cmd) => cmd.group === group.id && (!recentIds.includes(cmd.id) || query));
      if (items.length > 0) {
        result.push({ group, items });
      }
    });

    return result;
  }, [filteredCommands, groups, query, recentIds, maxRecent]);

  const flatCommands = useMemo(() => groupedCommands.flatMap((g) => g.items), [groupedCommands]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].onSelect();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatCommands, selectedIndex, onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let itemIndex = -1;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '20vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
      }}
    >
      <div
        className={className}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 'var(--ds-sizing-125)',
          backgroundColor: 'var(--ds-color-neutral-background-default)',
          borderRadius: 'var(--ds-border-radius-xl)',
          boxShadow: 'var(--ds-shadow-xl)',
          overflow: 'hidden',
          ...style,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-3)',
            padding: 'var(--ds-spacing-4)',
            borderBottomWidth: 'var(--ds-border-width-default)',
            borderBottomStyle: 'solid',
            borderBottomColor: 'var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 'var(--ds-font-size-md)',
              color: 'var(--ds-color-neutral-text-default)',
              backgroundColor: 'transparent',
            }}
          />
          <kbd
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-xs)',
              backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
              borderRadius: 'var(--ds-border-radius-sm)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div ref={listRef} style={{ maxHeight: '400px', overflowY: 'auto', padding: 'var(--ds-spacing-2)' }}>
          {flatCommands.length === 0 ? (
            <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {emptyMessage}
            </div>
          ) : (
            groupedCommands.map(({ group, items }) => (
              <div key={group?.id || 'ungrouped'}>
                {group && (
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
                {items.map((cmd) => {
                  itemIndex++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      data-index={itemIndex}
                      onClick={() => {
                        cmd.onSelect();
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--ds-spacing-3)',
                        padding: 'var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        backgroundColor: isSelected ? 'var(--ds-color-accent-surface-subtle)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {cmd.icon && (
                        <div style={{ color: 'var(--ds-color-neutral-text-subtle)', flexShrink: 0 }}>{cmd.icon}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-default)' }}>
                          {cmd.label}
                        </div>
                        {cmd.description && (
                          <div style={{ fontSize: 'var(--ds-font-size-xs)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div style={{ display: 'flex', gap: 'var(--ds-spacing-1)' }}>
                          {cmd.shortcut.map((key, i) => (
                            <kbd
                              key={i}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 'var(--ds-sizing-5)',
                                padding: 'var(--ds-spacing-1)',
                                fontSize: 'var(--ds-font-size-xs)',
                                backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
                                borderRadius: 'var(--ds-border-radius-sm)',
                                color: 'var(--ds-color-neutral-text-subtle)',
                              }}
                            >
                              {key === '⌘' ? <CommandIcon /> : key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// useCommandPalette Hook
// =============================================================================

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen((p) => !p) };
}

export default { CommandPalette, useCommandPalette };
