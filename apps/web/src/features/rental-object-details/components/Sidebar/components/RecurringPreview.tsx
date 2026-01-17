/**
 * RecurringPreview Component
 *
 * Displays a preview of all occurrences in a recurring booking series.
 * Shows availability status for each occurrence with color-coded badges.
 *
 * Status types:
 * - AVAILABLE: Slot is available (green)
 * - CONFLICT: Overlaps with existing booking (red)
 * - RESERVED: Temporarily reserved by another user (orange)
 * - BLOCKED: Blocked by admin/maintenance (gray)
 * - BLACKOUT: Holiday or blackout period (purple)
 * - CLOSED: Rental object is closed (gray)
 */

import * as React from 'react';
import { Heading, Paragraph, Badge, Checkbox, Spinner, Card } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { RecurringOccurrenceDTO, OccurrenceStatus, RecurringSummary } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

export interface RecurringPreviewProps {
  /** List of occurrences from the preview API */
  occurrences: RecurringOccurrenceDTO[];
  /** Summary statistics */
  summary?: RecurringSummary;
  /** Whether preview is loading */
  isLoading?: boolean;
  /** Error message if preview failed */
  error?: string;
  /** Selected occurrence indices for partial creation */
  selectedIndices?: Set<number>;
  /** Callback when selection changes */
  onSelectionChange?: (indices: Set<number>) => void;
  /** Whether selection is allowed (for partial create mode) */
  allowSelection?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_CONFIG: Record<
  OccurrenceStatus,
  { label: string; color: 'success' | 'danger' | 'warning' | 'neutral' | 'info'; icon: string }
> = {
  AVAILABLE: { label: 'Ledig', color: 'success', icon: '✓' },
  CONFLICT: { label: 'Konflikt', color: 'danger', icon: '✗' },
  RESERVED: { label: 'Reservert', color: 'warning', icon: '⏳' },
  BLOCKED: { label: 'Blokkert', color: 'neutral', icon: '⊘' },
  BLACKOUT: { label: 'Stengt', color: 'info', icon: '☾' },
  CLOSED: { label: 'Lukket', color: 'neutral', icon: '—' },
};

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Søn',
  1: 'Man',
  2: 'Tir',
  3: 'Ons',
  4: 'Tor',
  5: 'Fre',
  6: 'Lør',
};

const MONTH_LABELS = [
  'jan', 'feb', 'mar', 'apr', 'mai', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'des',
];

// =============================================================================
// Helper Functions
// =============================================================================

function formatOccurrenceDate(startTime: string): string {
  const date = new Date(startTime);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const day = date.getDate();
  const month = MONTH_LABELS[date.getMonth()];
  return `${weekday} ${day}. ${month}`;
}

function formatOccurrenceTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  return `${startStr} - ${endStr}`;
}

// =============================================================================
// Component
// =============================================================================

export function RecurringPreview({
  occurrences,
  summary,
  isLoading = false,
  error,
  selectedIndices,
  onSelectionChange,
  allowSelection = false,
  className,
}: RecurringPreviewProps): React.ReactElement {
  const t = useT();

  const handleToggleOccurrence = (index: number) => {
    if (!allowSelection || !onSelectionChange || !selectedIndices) return;

    const newSelection = new Set(selectedIndices);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAllAvailable = () => {
    if (!onSelectionChange) return;
    const availableIndices = occurrences
      .filter((o) => o.status === 'AVAILABLE')
      .map((o) => o.index);
    onSelectionChange(new Set(availableIndices));
  };

  const handleDeselectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(new Set());
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-8)',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        <Spinner data-size="lg" />
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Laster forhåndsvisning...
        </Paragraph>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-danger-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-danger-border-default)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
          {error}
        </Paragraph>
      </div>
    );
  }

  // Empty state
  if (occurrences.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Ingen forekomster funnet. Juster gjentakelsesmønsteret.
        </Paragraph>
      </div>
    );
  }

  const availableCount = occurrences.filter((o) => o.status === 'AVAILABLE').length;
  const conflictCount = occurrences.filter((o) => o.status === 'CONFLICT').length;

  return (
    <div className={className}>
      {/* Header with summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>
          Forhåndsvisning ({occurrences.length} forekomster)
        </Heading>
        <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)' }}>
          <Badge data-color="success" data-size="sm">
            {availableCount} ledige
          </Badge>
          {conflictCount > 0 && (
            <Badge data-color="danger" data-size="sm">
              {conflictCount} konflikter
            </Badge>
          )}
        </div>
      </div>

      {/* Summary card */}
      {summary && (
        <Card
          style={{
            padding: 'var(--ds-spacing-4)',
            marginBottom: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ds-spacing-3)' }}>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Totalt
              </Paragraph>
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {summary.totalOccurrences} forekomster
              </Paragraph>
            </div>
            <div>
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Estimert pris
              </Paragraph>
              <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                {new Intl.NumberFormat('nb-NO', {
                  style: 'currency',
                  currency: summary.currency,
                  minimumFractionDigits: 0,
                }).format(summary.totalPrice)}
              </Paragraph>
            </div>
          </div>
        </Card>
      )}

      {/* Selection controls */}
      {allowSelection && onSelectionChange && (
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <button
            type="button"
            onClick={handleSelectAllAvailable}
            style={{
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-accent-text-default)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Velg alle ledige
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            style={{
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              fontSize: 'var(--ds-font-size-xs)',
              color: 'var(--ds-color-neutral-text-subtle)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Fjern alle
          </button>
          {selectedIndices && (
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                marginLeft: 'auto',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {selectedIndices.size} valgt
            </Paragraph>
          )}
        </div>
      )}

      {/* Occurrences list */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: 'var(--ds-spacing-2)',
        }}
      >
        {occurrences.map((occurrence) => {
          const statusConfig = STATUS_CONFIG[occurrence.status];
          const isSelected = selectedIndices?.has(occurrence.index);
          const canSelect = allowSelection && occurrence.status === 'AVAILABLE';

          return (
            <div
              key={occurrence.index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                borderRadius: 'var(--ds-border-radius-md)',
                backgroundColor:
                  occurrence.status === 'AVAILABLE'
                    ? isSelected
                      ? 'var(--ds-color-success-surface-default)'
                      : 'var(--ds-color-neutral-surface-default)'
                    : occurrence.status === 'CONFLICT'
                      ? 'var(--ds-color-danger-surface-default)'
                      : 'var(--ds-color-neutral-surface-hover)',
                border:
                  isSelected
                    ? '2px solid var(--ds-color-success-border-default)'
                    : '1px solid var(--ds-color-neutral-border-subtle)',
                cursor: canSelect ? 'pointer' : 'default',
                opacity: occurrence.status !== 'AVAILABLE' && occurrence.status !== 'CONFLICT' ? 0.7 : 1,
              }}
              onClick={() => canSelect && handleToggleOccurrence(occurrence.index)}
            >
              {/* Selection checkbox */}
              {allowSelection && (
                <div style={{ flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleOccurrence(occurrence.index)}
                    disabled={!canSelect}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: 'var(--ds-color-accent-base-default)',
                      cursor: canSelect ? 'pointer' : 'not-allowed',
                    }}
                  />
                </div>
              )}

              {/* Occurrence number */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  flexShrink: 0,
                }}
              >
                {occurrence.index + 1}
              </div>

              {/* Date and time */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                    color:
                      occurrence.status === 'CONFLICT'
                        ? 'var(--ds-color-danger-text-default)'
                        : 'var(--ds-color-neutral-text-default)',
                  }}
                >
                  {formatOccurrenceDate(occurrence.startTime)}
                </Paragraph>
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  {formatOccurrenceTime(occurrence.startTime, occurrence.endTime)}
                </Paragraph>
              </div>

              {/* Status badge */}
              <Badge data-color={statusConfig.color} data-size="sm">
                {statusConfig.icon} {statusConfig.label}
              </Badge>
            </div>
          );
        })}
      </div>

      {/* Conflict warning */}
      {conflictCount > 0 && (
        <div
          style={{
            marginTop: 'var(--ds-spacing-4)',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-warning-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            border: '1px solid var(--ds-color-warning-border-default)',
          }}
        >
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-warning-text-default)',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {conflictCount} forekomst{conflictCount > 1 ? 'er' : ''} har konflikter
          </Paragraph>
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-warning-text-default)',
            }}
          >
            Du kan velge å booke kun de ledige tidspunktene, eller prøve alternative tidspunkter.
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default RecurringPreview;
