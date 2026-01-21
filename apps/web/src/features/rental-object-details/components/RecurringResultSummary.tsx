/**
 * RecurringResultSummary Component
 *
 * Displays the result of a recurring booking creation.
 * Shows created and failed occurrences with status indicators and summary statistics.
 */

import * as React from 'react';
import { Heading, Paragraph, Button, CheckCircleIcon, XCircleIcon, AlertTriangleIcon, ExternalLinkIcon } from '@xalatechnologies/platform/ui';
import type {
  RecurringBookingResultProjectionDTO,
  RecurringOccurrenceResultDTO,
} from '@digilist/client-sdk';
import { formatDate, formatTime } from '@digilist/client-sdk';
import { useT } from '@xala/i18n';

// Icons are imported from @xalatechnologies/platform/ui above

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

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format date for display with weekday (using i18n)
 */
function formatDateLocal(dateString: string, t: (key: string) => string): string {
  const date = new Date(dateString);
  const weekdayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()] ?? 'sunday';
  const weekday = t(`weekdays.long.${weekdayKey}`);
  const formattedDate = formatDate(dateString, { day: 'numeric', month: 'short' });
  return `${weekday} ${formattedDate}`;
}

/**
 * Get reason label using i18n
 */
function getReasonLabel(reasonKey: string | undefined, t: (key: string) => string): string {
  if (!reasonKey) return t('booking.conflict.unknownReason');
  // Use the reasonKey directly as i18n key, or fallback to the key itself
  return t(reasonKey) !== reasonKey ? t(reasonKey) : reasonKey;
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

// getReasonLabel is defined above in helper functions section

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
function getResultConfig(resultType: ResultType, t: (key: string) => string): {
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
        description: t('state.booked'),
        icon: <CheckCircleIcon width={40} height={40} />,
        color: 'var(--ds-color-success-text-default)',
        backgroundColor: 'var(--ds-color-success-surface-default)',
        borderColor: 'var(--ds-color-success-border-default)',
      };
    case 'partial':
      return {
        title: t('delvis.opprettet'),
        description: t('noen.datoer.kunne.ikke.bookes'),
        icon: <AlertTriangleIcon width={40} height={40} />,
        color: 'var(--ds-color-warning-text-default)',
        backgroundColor: 'var(--ds-color-warning-surface-default)',
        borderColor: 'var(--ds-color-warning-border-default)',
      };
    case 'failure':
      return {
        title: t('booking.mislyktes'),
        description: t('ingen.datoer.kunne.bookes'),
        icon: <XCircleIcon width={40} height={40} />,
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
  t,
}: OccurrenceRowProps & { t: (key: string) => string }): React.ReactElement {
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
        {isSuccess ? <CheckCircleIcon width={18} height={18} /> : <XCircleIcon width={18} height={18} />}
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
          {formatDateLocal(occurrence.startTime, t)}
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
              <CheckCircleIcon width={12} height={12} />
              {t('booking.created')}
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
                {t('booking.viewBooking')}
                <ExternalLinkIcon width={12} height={12} />
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
            title={getReasonLabel(occurrence.reasonKey, t)}
          >
            <XCircleIcon width={12} height={12} />
            {getReasonLabel(occurrence.reasonKey, t)}
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
}: RecurringResultSummaryProps): React.ReactElement {
  const t = useT();
  const [showCreated, setShowCreated] = React.useState(true);
  const [showFailed, setShowFailed] = React.useState(true);

  const resultType = getResultType(result);
  const resultConfig = getResultConfig(resultType, t);

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
              {t('booking.created')}
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
                    <CheckCircleIcon width={16} height={16} />
                  </div>
                  <Heading
                    level={3}
                    data-size="xs"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {t('booking.createdBookings', { count: created.length })}
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
                      t={t}
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
                    <XCircleIcon width={16} height={16} />
                  </div>
                  <Heading
                    level={3}
                    data-size="xs"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {t('booking.failedDates', { count: failed.length })}
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
                      t={t}
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
              {t('action.viewAllBookings')}
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
              {t('booking.bookMoreDates')}
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
