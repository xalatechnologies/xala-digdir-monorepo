/**
 * ConflictResolver Component
 *
 * Displays conflicts from a recurring booking preview and allows users
 * to select alternative time slots or skip conflicting occurrences.
 *
 * Features:
 * - Shows list of conflicting occurrences with details
 * - Provides alternative slot suggestions for each conflict
 * - Allows users to select alternatives or skip conflicts
 * - Summary of resolution actions
 */

import * as React from 'react';
import { Heading, Paragraph, Badge, Button, Card, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';
import type { RecurringOccurrenceDTO, OccurrenceStatus } from '@digilist/client-sdk';

// =============================================================================
// Types
// =============================================================================

/**
 * Suggested alternative slot for a conflicting occurrence
 */
export interface AlternativeSlot {
  /** Alternative slot identifier */
  id: string;
  /** Original occurrence index this alternative is for */
  forOccurrenceIndex: number;
  /** Alternative start time in ISO 8601 format */
  startTime: string;
  /** Alternative end time in ISO 8601 format */
  endTime: string;
  /** Availability status of this alternative */
  status: OccurrenceStatus;
  /** Price difference from original slot (can be negative) */
  priceDifference?: number;
  /** Currency for price difference */
  currency?: string;
  /** Short description of why this is suggested */
  reason?: string;
}

/**
 * User's resolution choice for a conflict
 */
export interface ConflictResolution {
  /** Original occurrence index */
  occurrenceIndex: number;
  /** Resolution type */
  action: 'USE_ALTERNATIVE' | 'SKIP' | 'PENDING';
  /** Selected alternative slot ID (if action is USE_ALTERNATIVE) */
  alternativeSlotId?: string;
  /** The selected alternative slot details */
  alternativeSlot?: AlternativeSlot;
}

export interface ConflictResolverProps {
  /** Conflicting occurrences from the recurring preview */
  conflicts: RecurringOccurrenceDTO[];
  /** Alternative slots for each conflict (keyed by occurrence index) */
  alternatives: Map<number, AlternativeSlot[]>;
  /** Whether alternatives are being loaded */
  isLoadingAlternatives?: boolean;
  /** Current resolution state */
  resolutions: ConflictResolution[];
  /** Callback when resolutions change */
  onResolutionsChange: (resolutions: ConflictResolution[]) => void;
  /** Callback to request more alternatives for a specific conflict */
  onRequestAlternatives?: (occurrenceIndex: number) => void;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  AVAILABLE: 'Ledig',
  CONFLICT: 'Konflikt',
  RESERVED: 'Reservert',
  BLOCKED: 'Blokkert',
  BLACKOUT: 'Stengt',
  CLOSED: 'Lukket',
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const day = date.getDate();
  const month = MONTH_LABELS[date.getMonth()];
  return `${weekday} ${day}. ${month}`;
}

function formatTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
  const endStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  return `${startStr} - ${endStr}`;
}

function formatPriceDifference(difference: number, currency: string): string {
  const formatter = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    signDisplay: 'always',
  });
  return formatter.format(difference);
}

// =============================================================================
// Sub-Components
// =============================================================================

interface ConflictCardProps {
  conflict: RecurringOccurrenceDTO;
  alternatives: AlternativeSlot[];
  resolution: ConflictResolution;
  isLoadingAlternatives: boolean;
  onSelectAlternative: (alternative: AlternativeSlot) => void;
  onSkip: () => void;
  onRequestMore?: () => void;
}

function ConflictCard({
  conflict,
  alternatives,
  resolution,
  isLoadingAlternatives,
  onSelectAlternative,
  onSkip,
  onRequestMore,
}: ConflictCardProps): React.ReactElement {
  const isResolved = resolution.action !== 'PENDING';

  return (
    <Card
      style={{
        padding: 'var(--ds-spacing-4)',
        marginBottom: 'var(--ds-spacing-3)',
        border: isResolved
          ? '2px solid var(--ds-color-success-border-default)'
          : '1px solid var(--ds-color-danger-border-default)',
        backgroundColor: isResolved
          ? 'var(--ds-color-success-surface-default)'
          : 'var(--ds-color-danger-surface-default)',
      }}
    >
      {/* Conflict Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-danger-base-default)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {conflict.index + 1}
            </span>
            <Paragraph
              data-size="md"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-semibold)',
              }}
            >
              {formatDate(conflict.startTime)}
            </Paragraph>
          </div>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {formatTime(conflict.startTime, conflict.endTime)}
          </Paragraph>
        </div>

        <Badge data-color="danger" data-size="sm">
          {STATUS_LABELS[conflict.status]}
        </Badge>
      </div>

      {/* Resolution Status */}
      {isResolved && (
        <div
          style={{
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-success-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-success-text-default)',
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            {resolution.action === 'SKIP'
              ? '✓ Hoppes over'
              : `✓ Byttet til ${formatDate(resolution.alternativeSlot?.startTime ?? '')} ${formatTime(resolution.alternativeSlot?.startTime ?? '', resolution.alternativeSlot?.endTime ?? '')}`}
          </Paragraph>
        </div>
      )}

      {/* Alternatives Section */}
      {!isResolved && (
        <div>
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginBottom: 'var(--ds-spacing-2)',
              color: 'var(--ds-color-neutral-text-subtle)',
              fontWeight: 'var(--ds-font-weight-medium)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Velg alternativ
          </Paragraph>

          {isLoadingAlternatives ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--ds-spacing-4)',
              }}
            >
              <Spinner data-size="sm" />
              <Paragraph
                data-size="sm"
                style={{ margin: 0, marginLeft: 'var(--ds-spacing-2)' }}
              >
                Laster alternativer...
              </Paragraph>
            </div>
          ) : alternatives.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
              {alternatives.slice(0, 3).map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--ds-spacing-3)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-accent-surface-default)';
                    e.currentTarget.style.borderColor = 'var(--ds-color-accent-border-default)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--ds-color-neutral-surface-default)';
                    e.currentTarget.style.borderColor = 'var(--ds-color-neutral-border-default)';
                  }}
                >
                  <div>
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        fontWeight: 'var(--ds-font-weight-medium)',
                      }}
                    >
                      {formatDate(alt.startTime)}
                    </Paragraph>
                    <Paragraph
                      data-size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {formatTime(alt.startTime, alt.endTime)}
                    </Paragraph>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    {alt.priceDifference !== undefined && alt.priceDifference !== 0 && (
                      <Badge
                        data-color={alt.priceDifference > 0 ? 'warning' : 'success'}
                        data-size="sm"
                      >
                        {formatPriceDifference(alt.priceDifference, alt.currency ?? 'NOK')}
                      </Badge>
                    )}
                    <Badge data-color="success" data-size="sm">
                      Ledig
                    </Badge>
                  </div>
                </button>
              ))}

              {alternatives.length > 3 && onRequestMore && (
                <button
                  type="button"
                  onClick={onRequestMore}
                  style={{
                    padding: 'var(--ds-spacing-2)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--ds-color-accent-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Vis {alternatives.length - 3} flere alternativer
                </button>
              )}
            </div>
          ) : (
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-hover)',
                borderRadius: 'var(--ds-border-radius-md)',
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {t('booking.conflict.noAlternatives')}
            </Paragraph>
          )}

          {/* Skip button */}
          <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
            <Button
              type="button"
              variant="tertiary"
              data-size="sm"
              onClick={onSkip}
              style={{ width: '100%' }}
            >
              {t('action.skipDate')}
            </Button>
          </div>
        </div>
      )}

      {/* Undo button for resolved conflicts */}
      {isResolved && (
        <Button
          type="button"
          variant="tertiary"
          data-size="sm"
          onClick={onSkip} // We reuse onSkip to reset, will be handled in parent
          style={{ width: '100%' }}
        >
          {t('action.undo')}
        </Button>
      )}
    </Card>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ConflictResolver({
  conflicts,
  alternatives,
  isLoadingAlternatives = false,
  resolutions,
  onResolutionsChange,
  onRequestAlternatives,
  className,
}: ConflictResolverProps): React.ReactElement {
  const t = useT();

  // Initialize resolutions if empty
  React.useEffect(() => {
    if (resolutions.length === 0 && conflicts.length > 0) {
      const initialResolutions: ConflictResolution[] = conflicts.map((c) => ({
        occurrenceIndex: c.index,
        action: 'PENDING',
      }));
      onResolutionsChange(initialResolutions);
    }
  }, [conflicts, resolutions.length, onResolutionsChange]);

  const handleSelectAlternative = (occurrenceIndex: number, alternative: AlternativeSlot) => {
    const updated = resolutions.map((r) =>
      r.occurrenceIndex === occurrenceIndex
        ? {
            ...r,
            action: 'USE_ALTERNATIVE' as const,
            alternativeSlotId: alternative.id,
            alternativeSlot: alternative,
          }
        : r
    );
    onResolutionsChange(updated);
  };

  const handleSkip = (occurrenceIndex: number) => {
    const resolution = resolutions.find((r) => r.occurrenceIndex === occurrenceIndex);

    // If already resolved, reset to pending (undo)
    if (resolution?.action !== 'PENDING') {
      const updated = resolutions.map((r) =>
        r.occurrenceIndex === occurrenceIndex
          ? { ...r, action: 'PENDING' as const, alternativeSlotId: undefined, alternativeSlot: undefined }
          : r
      );
      onResolutionsChange(updated);
    } else {
      // Skip this occurrence
      const updated = resolutions.map((r) =>
        r.occurrenceIndex === occurrenceIndex
          ? { ...r, action: 'SKIP' as const, alternativeSlotId: undefined, alternativeSlot: undefined }
          : r
      );
      onResolutionsChange(updated);
    }
  };

  const handleSkipAll = () => {
    const updated = resolutions.map((r) => ({
      ...r,
      action: 'SKIP' as const,
      alternativeSlotId: undefined,
      alternativeSlot: undefined,
    }));
    onResolutionsChange(updated);
  };

  const handleResetAll = () => {
    const updated = resolutions.map((r) => ({
      ...r,
      action: 'PENDING' as const,
      alternativeSlotId: undefined,
      alternativeSlot: undefined,
    }));
    onResolutionsChange(updated);
  };

  // Calculate summary
  const resolvedCount = resolutions.filter((r) => r.action !== 'PENDING').length;
  const skippedCount = resolutions.filter((r) => r.action === 'SKIP').length;
  const alternativeCount = resolutions.filter((r) => r.action === 'USE_ALTERNATIVE').length;
  const pendingCount = resolutions.filter((r) => r.action === 'PENDING').length;
  const allResolved = pendingCount === 0;

  if (conflicts.length === 0) {
    return (
      <div className={className}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-success-surface-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            color: 'var(--ds-color-success-text-default)',
          }}
        >
          ✓ Ingen konflikter funnet. Alle forekomster er tilgjengelige.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>
          Løs konflikter ({conflicts.length})
        </Heading>
        <Badge data-color={allResolved ? 'success' : 'warning'} data-size="sm">
          {resolvedCount}/{conflicts.length} løst
        </Badge>
      </div>

      {/* Quick actions */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-2)',
          marginBottom: 'var(--ds-spacing-4)',
        }}
      >
        <button
          type="button"
          onClick={handleSkipAll}
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
          Hopp over alle konflikter
        </button>
        {resolvedCount > 0 && (
          <button
            type="button"
            onClick={handleResetAll}
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
            Nullstill alle valg
          </button>
        )}
      </div>

      {/* Conflict Cards */}
      <div
        style={{
          maxHeight: '500px',
          overflowY: 'auto',
          paddingRight: 'var(--ds-spacing-2)',
        }}
      >
        {conflicts.map((conflict) => {
          const conflictAlternatives = alternatives.get(conflict.index) ?? [];
          const resolution = resolutions.find((r) => r.occurrenceIndex === conflict.index) ?? {
            occurrenceIndex: conflict.index,
            action: 'PENDING' as const,
          };

          return (
            <ConflictCard
              key={conflict.index}
              conflict={conflict}
              alternatives={conflictAlternatives}
              resolution={resolution}
              isLoadingAlternatives={isLoadingAlternatives}
              onSelectAlternative={(alt) => handleSelectAlternative(conflict.index, alt)}
              onSkip={() => handleSkip(conflict.index)}
              onRequestMore={
                onRequestAlternatives
                  ? () => onRequestAlternatives(conflict.index)
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* Summary Footer */}
      <div
        style={{
          marginTop: 'var(--ds-spacing-4)',
          padding: 'var(--ds-spacing-4)',
          backgroundColor: allResolved
            ? 'var(--ds-color-success-surface-default)'
            : 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
            color: allResolved
              ? 'var(--ds-color-success-text-default)'
              : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {allResolved ? '✓ Alle konflikter løst' : 'Oppsummering'}
        </Paragraph>
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-4)',
            marginTop: 'var(--ds-spacing-2)',
          }}
        >
          {alternativeCount > 0 && (
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {alternativeCount} byttet til alternativ
            </Paragraph>
          )}
          {skippedCount > 0 && (
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {skippedCount} hoppes over
            </Paragraph>
          )}
          {pendingCount > 0 && (
            <Paragraph
              data-size="xs"
              style={{
                margin: 0,
                color: 'var(--ds-color-warning-text-default)',
              }}
            >
              {pendingCount} uløst
            </Paragraph>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConflictResolver;
