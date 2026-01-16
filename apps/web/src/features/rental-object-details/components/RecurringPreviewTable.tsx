/**
 * RecurringPreviewTable Component
 *
 * Displays recurring booking occurrences with status colors.
 * Shows availability status for each occurrence in the preview.
 * Supports selection of individual occurrences for partial creation.
 */

import * as React from 'react';
import { Heading, Paragraph, Checkbox } from '@xala/ds';
import type {
  RecurringOccurrenceDTO,
  RecurringSummary,
  OccurrenceStatus,
} from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// =============================================================================
// Icons
// =============================================================================

function CheckCircleIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircleIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function ClockIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlertCircleIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CalendarIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

export interface RecurringPreviewTableProps {
  /** Array of occurrence data from the preview projection */
  occurrences: RecurringOccurrenceDTO[];
  /** Summary statistics from the preview projection */
  summary: RecurringSummary;
  /** Whether to show checkboxes for selection */
  selectable?: boolean;
  /** Currently selected occurrence indices */
  selectedIndices?: number[];
  /** Callback when selection changes */
  onSelectionChange?: (indices: number[]) => void;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the summary section */
  showSummary?: boolean;
  /** Maximum number of rows to show before scrolling */
  maxVisibleRows?: number;
}

/**
 * Status configuration for display styling
 */
interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  icon: React.ReactElement;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Norwegian weekday names
 */
const WEEKDAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

/**
 * Norwegian month names
 */
const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];

/**
 * Status display configuration
 */
const STATUS_CONFIG: Record<OccurrenceStatus, StatusConfig> = {
  AVAILABLE: {
    label: t('status.available'),
    color: 'var(--ds-color-success-text-default)',
    backgroundColor: 'var(--ds-color-success-surface-default)',
    borderColor: 'var(--ds-color-success-border-default)',
    icon: <CheckCircleIcon size={14} />,
  },
  CONFLICT: {
    label: t('konflikt'),
    color: 'var(--ds-color-danger-text-default)',
    backgroundColor: 'var(--ds-color-danger-surface-default)',
    borderColor: 'var(--ds-color-danger-border-default)',
    icon: <XCircleIcon size={14} />,
  },
  RESERVED: {
    label: t('status.reserved'),
    color: 'var(--ds-color-warning-text-default)',
    backgroundColor: 'var(--ds-color-warning-surface-default)',
    borderColor: 'var(--ds-color-warning-border-default)',
    icon: <ClockIcon size={14} />,
  },
  BLOCKED: {
    label: t('status.blocked'),
    color: 'var(--ds-color-danger-text-default)',
    backgroundColor: 'var(--ds-color-danger-surface-default)',
    borderColor: 'var(--ds-color-danger-border-default)',
    icon: <XCircleIcon size={14} />,
  },
  BLACKOUT: {
    label: t('status.closed'),
    color: 'var(--ds-color-neutral-text-subtle)',
    backgroundColor: 'var(--ds-color-neutral-surface-default)',
    borderColor: 'var(--ds-color-neutral-border-default)',
    icon: <AlertCircleIcon size={14} />,
  },
  CLOSED: {
    label: t('status.closed'),
    color: 'var(--ds-color-neutral-text-subtle)',
    backgroundColor: 'var(--ds-color-neutral-surface-default)',
    borderColor: 'var(--ds-color-neutral-border-default)',
    icon: <AlertCircleIcon size={14} />,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format date for display (Norwegian format)
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const weekday = WEEKDAY_NAMES[date.getDay()] ?? '';
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${weekday} ${day}. ${month}`;
}

/**
 * Format time for display (HH:MM format)
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format price for display
 */
function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get status configuration by status type
 * All OccurrenceStatus values are defined in STATUS_CONFIG, so we can safely access them.
 */
function getStatusConfig(status: OccurrenceStatus): StatusConfig {
  // Use type assertion since we know all OccurrenceStatus values are in STATUS_CONFIG
  return STATUS_CONFIG[status] as StatusConfig;
}

// =============================================================================
// Component
// =============================================================================

export function RecurringPreviewTable({
  occurrences,
  summary,
  selectable = false,
  selectedIndices = [],
  onSelectionChange,
  className,
  size = 'md',
  showSummary = true,
  maxVisibleRows = 8,
}: RecurringPreviewTableProps): React.ReactElement {
  const t = useT();
  // Track selected indices for selectable mode
  const selectedSet = React.useMemo(() => new Set(selectedIndices), [selectedIndices]);

  // Handle individual row selection toggle
  const handleRowToggle = (index: number, checked: boolean): void => {
    if (!onSelectionChange) return;

    const newSelected = checked
      ? [...selectedIndices, index]
      : selectedIndices.filter((i) => i !== index);

    onSelectionChange(newSelected);
  };

  // Handle select all / deselect all
  const handleSelectAll = (checked: boolean): void => {
    if (!onSelectionChange) return;

    if (checked) {
      // Select all available occurrences
      const availableIndices = occurrences
        .filter((occ) => occ.status === 'AVAILABLE')
        .map((occ) => occ.index);
      onSelectionChange(availableIndices);
    } else {
      onSelectionChange([]);
    }
  };

  // Check if all available are selected
  const availableOccurrences = occurrences.filter((occ) => occ.status === 'AVAILABLE');
  const allAvailableSelected =
    availableOccurrences.length > 0 &&
    availableOccurrences.every((occ) => selectedSet.has(occ.index));
  const someSelected = selectedIndices.length > 0 && !allAvailableSelected;

  // Get padding based on size
  const getPadding = (): string => {
    switch (size) {
      case 'sm':
        return 'var(--ds-spacing-2)';
      case 'lg':
        return 'var(--ds-spacing-4)';
      default:
        return 'var(--ds-spacing-3)';
    }
  };

  // Calculate max height for scrolling
  const rowHeight = size === 'sm' ? 48 : size === 'lg' ? 64 : 56;
  const maxHeight = maxVisibleRows * rowHeight;

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: getPadding(),
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-accent-surface-default)',
              color: 'var(--ds-color-accent-text-default)',
            }}
          >
            <CalendarIcon size={16} />
          </div>
          <Heading
            level={3}
            data-size="xs"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-medium)',
            }}
          >
            Forhåndsvisning ({occurrences.length} datoer)
          </Heading>
        </div>

        {/* Select all checkbox for selectable mode */}
        {selectable && availableOccurrences.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            <Checkbox
              checked={allAvailableSelected || someSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
              aria-label={t('status.available')}
            />
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              {someSelected && !allAvailableSelected
                ? `${selectedIndices.length} valgt`
                : 'Velg alle ledige'}
            </Paragraph>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: selectable ? '40px 1fr 100px 120px' : '1fr 100px 120px',
          alignItems: 'center',
          padding: `var(--ds-spacing-2) ${getPadding()}`,
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          fontSize: 'var(--ds-font-size-sm)',
          fontWeight: 'var(--ds-font-weight-medium)',
          color: 'var(--ds-color-neutral-text-subtle)',
        }}
      >
        {selectable && <div />}
        <div>{t('dato')}</div>
        <div>{t('tidspunkt')}</div>
        <div>{t('status')}</div>
      </div>

      {/* Occurrence List */}
      <div
        style={{
          maxHeight: `${maxHeight}px`,
          overflowY: 'auto',
        }}
      >
        {occurrences.length === 0 ? (
          <div
            style={{
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
            }}
          >
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                color: 'var(--ds-color-neutral-text-subtle)',
              }}
            >
              Ingen datoer generert
            </Paragraph>
          </div>
        ) : (
          occurrences.map((occurrence) => {
            const statusConfig = getStatusConfig(occurrence.status);
            const isAvailable = occurrence.status === 'AVAILABLE';
            const isSelected = selectedSet.has(occurrence.index);

            return (
              <div
                key={occurrence.index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectable ? '40px 1fr 100px 120px' : '1fr 100px 120px',
                  alignItems: 'center',
                  padding: `${getPadding()} ${getPadding()}`,
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  backgroundColor: isSelected
                    ? 'var(--ds-color-accent-surface-default)'
                    : 'var(--ds-color-neutral-background-default)',
                  transition: 'background-color 150ms ease',
                }}
              >
                {/* Checkbox column */}
                {selectable && (
                  <div>
                    {isAvailable && (
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleRowToggle(occurrence.index, e.target.checked)}
                        aria-label={`Velg ${formatDate(occurrence.startTime)}`}
                      />
                    )}
                  </div>
                )}

                {/* Date column */}
                <div>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: isAvailable
                        ? 'var(--ds-color-neutral-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {formatDate(occurrence.startTime)}
                  </Paragraph>
                </div>

                {/* Time column */}
                <div>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      color: isAvailable
                        ? 'var(--ds-color-neutral-text-default)'
                        : 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    {formatTime(occurrence.startTime)} - {formatTime(occurrence.endTime)}
                  </Paragraph>
                </div>

                {/* Status column */}
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-1)',
                      padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: statusConfig.backgroundColor,
                      border: `1px solid ${statusConfig.borderColor}`,
                      color: statusConfig.color,
                      fontSize: 'var(--ds-font-size-xs)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Section */}
      {showSummary && (
        <div
          style={{
            padding: getPadding(),
            backgroundColor: 'var(--ds-color-neutral-surface-default)',
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {/* Available count */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Ledige
              </Paragraph>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-success-base-default)',
                  }}
                />
                <Paragraph
                  data-size="sm"
                  style={{
                    margin: 0,
                    fontWeight: 'var(--ds-font-weight-medium)',
                  }}
                >
                  {summary.availableCount} av {summary.totalOccurrences}
                </Paragraph>
              </div>
            </div>

            {/* Conflict count */}
            {summary.conflictCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-1)',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Konflikter
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                    }}
                  />
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {summary.conflictCount}
                  </Paragraph>
                </div>
              </div>
            )}

            {/* Blocked count */}
            {summary.blockedCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-1)',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Blokkert
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-danger-base-default)',
                    }}
                  />
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {summary.blockedCount}
                  </Paragraph>
                </div>
              </div>
            )}

            {/* Blackout count */}
            {summary.blackoutCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-1)',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  Stengt periode
                </Paragraph>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--ds-border-radius-full)',
                      backgroundColor: 'var(--ds-color-neutral-base-default)',
                    }}
                  />
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {summary.blackoutCount}
                  </Paragraph>
                </div>
              </div>
            )}

            {/* Total price */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--ds-spacing-1)',
              }}
            >
              <Paragraph
                data-size="xs"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-neutral-text-subtle)',
                }}
              >
                Estimert pris
              </Paragraph>
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  fontWeight: 'var(--ds-font-weight-medium)',
                  color: 'var(--ds-color-accent-text-default)',
                }}
              >
                {formatPrice(summary.totalPrice, summary.currency)}
              </Paragraph>
            </div>
          </div>

          {/* Selection summary when in selectable mode */}
          {selectable && selectedIndices.length > 0 && (
            <div
              style={{
                marginTop: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-accent-surface-default)',
                borderRadius: 'var(--ds-border-radius-md)',
                border: '1px solid var(--ds-color-accent-border-default)',
              }}
            >
              <Paragraph
                data-size="sm"
                style={{
                  margin: 0,
                  color: 'var(--ds-color-accent-text-default)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                }}
              >
                {selectedIndices.length} av {summary.availableCount} ledige datoer valgt
              </Paragraph>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RecurringPreviewTable;
