/**
 * RecurringResultSummary Component
 *
 * Displays the result of a recurring booking creation.
 * Shows created and failed occurrences with status indicators and summary statistics.
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@xala/ds';
import type {
  RecurringBookingResultProjectionDTO,
  RecurringOccurrenceResultDTO,
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

function AlertTriangleIcon({ size = 16 }: { size?: number }): React.ReactElement {
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
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CalendarCheckIcon({ size = 18 }: { size?: number }): React.ReactElement {
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
      <path d="M9 16l2 2 4-4" />
    </svg>
  );
}

function ExternalLinkIcon({ size = 14 }: { size?: number }): React.ReactElement {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

export interface RecurringResultSummaryProps {
  /** Result data from recurring booking creation */
  result: RecurringBookingResultProjectionDTO;
  /** Callback when user wants to view booking details */
  onViewBooking?: (bookingId: string) => void;
  /** Callback when user wants to view all created bookings */
  onViewAllBookings?: () => void;
  /** Callback to create a new booking */
  onNewBooking?: () => void;
  /** Custom class name */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the list of created/failed occurrences */
  showDetails?: boolean;
  /** Maximum number of rows to show before scrolling */
  maxVisibleRows?: number;
}

/**
 * Result type for categorizing outcomes
 */
type ResultType = 'success' | 'partial' | 'failure';

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
 * Reason key to Norwegian label mapping
 */
const REASON_LABELS: Record<string, string> = {
  'booking.conflict.existingBooking': 'Kolliderer med eksisterende booking',
  'booking.conflict.reserved': 'Reservert av annen bruker',
  'booking.conflict.blocked': 'Blokkert av administrator',
  'booking.conflict.blackout': 'Stengt periode',
  'booking.conflict.closed': 'Stengt',
  'booking.conflict.unavailable': 'Ikke tilgjengelig',
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
 * Get human-readable reason from reason key
 */
function getReasonLabel(reasonKey: string | undefined): string {
  if (!reasonKey) return 'Ukjent årsak';
  return REASON_LABELS[reasonKey] ?? reasonKey;
}

/**
 * Determine result type based on summary
 */
function getResultType(result: RecurringBookingResultProjectionDTO): ResultType {
  const { createdCount, failedCount } = result.summary;

  if (failedCount === 0 && createdCount > 0) {
    return 'success';
  } else if (createdCount === 0 && failedCount > 0) {
    return 'failure';
  } else {
    return 'partial';
  }
}

/**
 * Get result configuration for display
 */
function getResultConfig(resultType: ResultType): {
  title: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  backgroundColor: string;
  borderColor: string;
} {
  switch (resultType) {
    case 'success':
      return {
        title: t('booking.opprettet'),
        description: t('status.booked'),
        icon: <CheckCircleIcon size={40} />,
        color: 'var(--ds-color-success-text-default)',
        backgroundColor: 'var(--ds-color-success-surface-default)',
        borderColor: 'var(--ds-color-success-border-default)',
      };
    case 'partial':
      return {
        title: t('delvis.opprettet'),
        description: t('noen.datoer.kunne.ikke.bookes'),
        icon: <AlertTriangleIcon size={40} />,
        color: 'var(--ds-color-warning-text-default)',
        backgroundColor: 'var(--ds-color-warning-surface-default)',
        borderColor: 'var(--ds-color-warning-border-default)',
      };
    case 'failure':
      return {
        title: t('booking.mislyktes'),
        description: t('ingen.datoer.kunne.bookes'),
        icon: <XCircleIcon size={40} />,
        color: 'var(--ds-color-danger-text-default)',
        backgroundColor: 'var(--ds-color-danger-surface-default)',
        borderColor: 'var(--ds-color-danger-border-default)',
      };
  }
}

// =============================================================================
// Subcomponents
// =============================================================================

interface OccurrenceRowProps {
  occurrence: RecurringOccurrenceResultDTO;
  isSuccess: boolean;
  onViewBooking?: (bookingId: string) => void;
  padding: string;
}

function OccurrenceRow({
  occurrence,
  isSuccess,
  onViewBooking,
  padding,
}: OccurrenceRowProps): React.ReactElement {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 100px 1fr',
        alignItems: 'center',
        padding: `${padding} ${padding}`,
        borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        backgroundColor: 'var(--ds-color-neutral-background-default)',
      }}
    >
      {/* Status icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isSuccess
            ? 'var(--ds-color-success-text-default)'
            : 'var(--ds-color-danger-text-default)',
        }}
      >
        {isSuccess ? <CheckCircleIcon size={18} /> : <XCircleIcon size={18} />}
      </div>

      {/* Date */}
      <div>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {formatDate(occurrence.startTime)}
        </Paragraph>
      </div>

      {/* Time */}
      <div>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
          }}
        >
          {formatTime(occurrence.startTime)} - {formatTime(occurrence.endTime)}
        </Paragraph>
      </div>

      {/* Status/Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        {isSuccess ? (
          <>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-1)',
                padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                borderRadius: 'var(--ds-border-radius-full)',
                backgroundColor: 'var(--ds-color-success-surface-default)',
                border: '1px solid var(--ds-color-success-border-default)',
                color: 'var(--ds-color-success-text-default)',
                fontSize: 'var(--ds-font-size-xs)',
                fontWeight: 'var(--ds-font-weight-medium)',
                whiteSpace: 'nowrap',
              }}
            >
              <CheckCircleIcon size={12} />
              Opprettet
            </span>
            {occurrence.bookingId && onViewBooking && (
              <button
                type="button"
                onClick={() => onViewBooking(occurrence.bookingId!)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--ds-spacing-1)',
                  padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--ds-color-accent-text-default)',
                  fontSize: 'var(--ds-font-size-xs)',
                  fontWeight: 'var(--ds-font-weight-medium)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Se booking
                <ExternalLinkIcon size={12} />
              </button>
            )}
          </>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--ds-spacing-1)',
              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
              borderRadius: 'var(--ds-border-radius-full)',
              backgroundColor: 'var(--ds-color-danger-surface-default)',
              border: '1px solid var(--ds-color-danger-border-default)',
              color: 'var(--ds-color-danger-text-default)',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 'var(--ds-font-weight-medium)',
              whiteSpace: 'nowrap',
            }}
            title={getReasonLabel(occurrence.reasonKey)}
          >
            <XCircleIcon size={12} />
            {getReasonLabel(occurrence.reasonKey)}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function RecurringResultSummary({
  result,
  onViewBooking,
  onViewAllBookings,
  onNewBooking,
  className,
  size = 'md',
  showDetails = true,
  maxVisibleRows = 6,
}: RecurringResultSummaryProps):
  const t = useT(); React.ReactElement {
  const [showCreated, setShowCreated] = React.useState(true);
  const [showFailed, setShowFailed] = React.useState(true);

  const resultType = getResultType(result);
  const resultConfig = getResultConfig(resultType);

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

  const { created, failed, summary } = result;

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
      {/* Success/Error Header */}
      <div
        style={{
          padding: 'var(--ds-spacing-6)',
          textAlign: 'center',
          backgroundColor: resultConfig.backgroundColor,
          borderBottom: `1px solid ${resultConfig.borderColor}`,
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--ds-border-radius-full)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--ds-spacing-4)',
            color: resultConfig.color,
          }}
        >
          {resultConfig.icon}
        </div>
        <Heading
          level={2}
          data-size="lg"
          style={{
            margin: 0,
            marginBottom: 'var(--ds-spacing-2)',
            color: resultConfig.color,
          }}
        >
          {resultConfig.title}
        </Heading>
        <Paragraph
          data-size="md"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-subtle)',
          }}
        >
          {resultConfig.description}
        </Paragraph>
      </div>

      {/* Summary Statistics */}
      <div
        style={{
          padding: getPadding(),
          backgroundColor: 'var(--ds-color-neutral-surface-default)',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {/* Total attempted */}
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
              Totalt
            </Paragraph>
            <Paragraph
              data-size="sm"
              style={{
                margin: 0,
                fontWeight: 'var(--ds-font-weight-medium)',
              }}
            >
              {summary.totalAttempted} datoer
            </Paragraph>
          </div>

          {/* Created count */}
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
              Opprettet
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
                  color: 'var(--ds-color-success-text-default)',
                }}
              >
                {summary.createdCount}
              </Paragraph>
            </div>
          </div>

          {/* Failed count */}
          {summary.failedCount > 0 && (
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
                Mislyktes
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
                    color: 'var(--ds-color-danger-text-default)',
                  }}
                >
                  {summary.failedCount}
                </Paragraph>
              </div>
            </div>
          )}

          {/* Total price */}
          {summary.totalPrice > 0 && (
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
                Total pris
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
          )}
        </div>
      </div>

      {/* Details Section */}
      {showDetails && (created.length > 0 || failed.length > 0) && (
        <div>
          {/* Created occurrences */}
          {created.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowCreated(!showCreated)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: getPadding(),
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  border: 'none',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  cursor: 'pointer',
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
                      backgroundColor: 'var(--ds-color-success-surface-default)',
                      color: 'var(--ds-color-success-text-default)',
                    }}
                  >
                    <CalendarCheckIcon size={16} />
                  </div>
                  <Heading
                    level={3}
                    data-size="xs"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    Opprettede bookinger ({created.length})
                  </Heading>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: showCreated ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showCreated && (
                <div
                  style={{
                    maxHeight: `${maxHeight}px`,
                    overflowY: 'auto',
                  }}
                >
                  {/* Table Header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 100px 1fr',
                      alignItems: 'center',
                      padding: `var(--ds-spacing-2) ${getPadding()}`,
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    <div />
                    <div>{t('dato')}</div>
                    <div>{t('tidspunkt')}</div>
                    <div>{t('status')}</div>
                  </div>
                  {created.map((occurrence: RecurringOccurrenceResultDTO) => (
                    <OccurrenceRow
                      key={occurrence.index}
                      occurrence={occurrence}
                      isSuccess={true}
                      onViewBooking={onViewBooking}
                      padding={getPadding()}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Failed occurrences */}
          {failed.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowFailed(!showFailed)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: getPadding(),
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                  border: 'none',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  cursor: 'pointer',
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
                      backgroundColor: 'var(--ds-color-danger-surface-default)',
                      color: 'var(--ds-color-danger-text-default)',
                    }}
                  >
                    <XCircleIcon size={16} />
                  </div>
                  <Heading
                    level={3}
                    data-size="xs"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    Mislykkede datoer ({failed.length})
                  </Heading>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: showFailed ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showFailed && (
                <div
                  style={{
                    maxHeight: `${maxHeight}px`,
                    overflowY: 'auto',
                  }}
                >
                  {/* Table Header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 100px 1fr',
                      alignItems: 'center',
                      padding: `var(--ds-spacing-2) ${getPadding()}`,
                      backgroundColor: 'var(--ds-color-neutral-surface-default)',
                      borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                      fontSize: 'var(--ds-font-size-sm)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-subtle)',
                    }}
                  >
                    <div />
                    <div>{t('dato')}</div>
                    <div>{t('tidspunkt')}</div>
                    <div>{t('årsak')}</div>
                  </div>
                  {failed.map((occurrence: RecurringOccurrenceResultDTO) => (
                    <OccurrenceRow
                      key={occurrence.index}
                      occurrence={occurrence}
                      isSuccess={false}
                      padding={getPadding()}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: getPadding(),
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {/* Primary actions */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--ds-spacing-3)',
          }}
        >
          {result.permissions.canViewBookings && onViewAllBookings && created.length > 0 && (
            <Button
              type="button"
              variant="primary"
              data-size="md"
              data-color="accent"
              onClick={onViewAllBookings}
              style={{ flex: 1 }}
            >
              Se alle bookinger
            </Button>
          )}
          {onNewBooking && (
            <Button
              type="button"
              variant={created.length > 0 ? 'secondary' : 'primary'}
              data-size="md"
              onClick={onNewBooking}
              style={{ flex: 1 }}
            >
              Book flere datoer
            </Button>
          )}
        </div>

        {/* Info text */}
        {created.length > 0 && (
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              textAlign: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            En bekreftelse er sendt til din e-postadresse.
          </Paragraph>
        )}
      </div>
    </div>
  );
}

export default RecurringResultSummary;
