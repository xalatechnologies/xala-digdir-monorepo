/**
 * FilterChips Component
 * 
 * Displays active filter chips with remove buttons
 * Based on pattern from apps/minside/src/features/rental-objects/components/list/RentalObjectsFilterBar.tsx
 */

import React from 'react';
import { Button, Paragraph, CloseIcon } from '@xala/ds';
import { cn } from '../../utils';

export interface FilterChip {
  /** Unique key for the chip */
  key: string;
  /** Display label (must be translated by caller) */
  label: string;
  /** Remove handler */
  onRemove: () => void;
}

export interface FilterChipsProps {
  /** Array of active filter chips */
  chips: FilterChip[];
  /** Reset all filters handler */
  onResetAll: () => void;
  /** Reset button label (must be translated by caller) */
  resetLabel: string;
  /** Label for active filters section (must be translated by caller) */
  activeFiltersLabel?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function FilterChips({
  chips,
  onResetAll,
  resetLabel,
  activeFiltersLabel,
  className,
  style,
}: FilterChipsProps): React.ReactElement {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('filter-chips', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
        flexWrap: 'wrap',
        ...style,
      }}
    >
      {activeFiltersLabel && (
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {activeFiltersLabel}
        </Paragraph>
      )}
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          aria-label={`Fjern filter: ${chip.label}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-1) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            color: 'var(--ds-color-accent-text-default)',
            border: '1px solid var(--ds-color-accent-border-subtle)',
            borderRadius: 'var(--ds-border-radius-full)',
            fontSize: 'var(--ds-font-size-sm)',
            cursor: 'pointer',
            height: '32px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-default)';
          }}
        >
          {chip.label}
          <CloseIcon size={14} />
        </button>
      ))}
      <Button
        type="button"
        variant="tertiary"
        onClick={onResetAll}
        size="sm"
        style={{
          fontSize: 'var(--ds-font-size-sm)',
          textDecoration: 'underline',
        }}
      >
        {resetLabel}
      </Button>
    </div>
  );
}
