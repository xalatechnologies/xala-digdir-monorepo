/**
 * SortableList Component
 *
 * Drag-and-drop reorderable list.
 * SSR-safe with 'use client' directive.
 *
 * @module @xala/ds/composed/SortableList
 */

'use client';

import React, { useState, useCallback, useRef, type ReactNode } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface SortableItem {
  id: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  renderItem?: (item: SortableItem, index: number, isDragging: boolean) => ReactNode;
  handle?: boolean;
  disabled?: boolean;
  direction?: 'vertical' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
}

// =============================================================================
// Icons
// =============================================================================

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}

// =============================================================================
// SortableList Component
// =============================================================================

export function SortableList({
  items,
  onReorder,
  renderItem,
  handle = true,
  disabled = false,
  direction = 'vertical',
  className,
  style,
}: SortableListProps): React.ReactElement {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItemRef = useRef<SortableItem | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (disabled || items[index]?.disabled) return;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
      setDraggedIndex(index);
      draggedItemRef.current = items[index] ?? null;
    },
    [disabled, items]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (index !== dragOverIndex) {
        setDragOverIndex(index);
      }
    },
    [dragOverIndex]
  );

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newItems = [...items];
      const draggedItem = newItems[draggedIndex];
      if (draggedItem) {
        newItems.splice(draggedIndex, 1);
        newItems.splice(dragOverIndex, 0, draggedItem);
        onReorder(newItems);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItemRef.current = null;
  }, [draggedIndex, dragOverIndex, items, onReorder]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const isHorizontal = direction === 'horizontal';

  const defaultRenderItem = (item: SortableItem, index: number, isDragging: boolean) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-3)',
        padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
        backgroundColor: isDragging ? 'var(--ds-color-accent-surface-subtle)' : 'var(--ds-color-neutral-background-default)',
        borderWidth: 'var(--ds-border-width-default)',
        borderStyle: 'solid',
        borderColor: isDragging ? 'var(--ds-color-accent-border-default)' : 'var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-md)',
        opacity: isDragging ? 0.8 : 1,
        cursor: item.disabled || disabled ? 'not-allowed' : handle ? 'default' : 'grab',
      }}
    >
      {handle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: item.disabled || disabled ? 'not-allowed' : 'grab',
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          <GripIcon />
        </div>
      )}
      <div style={{ flex: 1 }}>{item.content}</div>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        gap: 'var(--ds-spacing-2)',
        ...style,
      }}
    >
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index && draggedIndex !== index;

        return (
          <div
            key={item.id}
            draggable={!disabled && !item.disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
            style={{
              position: 'relative',
              transition: 'transform 0.15s ease',
              transform: isOver
                ? isHorizontal
                  ? draggedIndex !== null && draggedIndex < index
                    ? 'translateX(8px)'
                    : 'translateX(-8px)'
                  : draggedIndex !== null && draggedIndex < index
                  ? 'translateY(8px)'
                  : 'translateY(-8px)'
                : 'none',
            }}
          >
            {isOver && (
              <div
                style={{
                  position: 'absolute',
                  ...(isHorizontal
                    ? {
                        left: draggedIndex !== null && draggedIndex < index ? 'auto' : '-4px',
                        right: draggedIndex !== null && draggedIndex < index ? '-4px' : 'auto',
                        top: 0,
                        bottom: 0,
                        width: 'var(--ds-border-width-lg)',
                      }
                    : {
                        top: draggedIndex !== null && draggedIndex < index ? 'auto' : '-4px',
                        bottom: draggedIndex !== null && draggedIndex < index ? '-4px' : 'auto',
                        left: 0,
                        right: 0,
                        height: 'var(--ds-border-width-lg)',
                      }),
                  backgroundColor: 'var(--ds-color-accent-base-default)',
                  borderRadius: 'var(--ds-border-radius-full)',
                }}
              />
            )}
            {renderItem ? renderItem(item, index, isDragging) : defaultRenderItem(item, index, isDragging)}
          </div>
        );
      })}
    </div>
  );
}

export default SortableList;
