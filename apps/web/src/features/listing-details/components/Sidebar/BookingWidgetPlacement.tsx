/**
 * BookingWidgetPlacement Component
 *
 * Placeholder/wrapper for the booking widget.
 * Shows booking availability summary and policy info.
 */

import * as React from 'react';
import { Card, Heading, Paragraph, Button, Tag } from '@digdir/designsystemet-react';
import { CalendarIcon } from '@xala/ds';
import type { BookingConfig } from '../../types';
import { getBookingModeLabel } from '../../presenters/listingTypePresenter';

// =============================================================================
// Icons
// =============================================================================

function CheckIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function InfoIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// =============================================================================
// Props
// =============================================================================

export interface BookingWidgetPlacementProps {
  bookingConfig?: BookingConfig;
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
    displayPrice?: string;
  };
  onBookClick?: () => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function BookingWidgetPlacement({
  bookingConfig,
  pricing,
  onBookClick,
  className,
}: BookingWidgetPlacementProps): React.ReactElement {
  const isBookable = bookingConfig?.enabled !== false && bookingConfig?.mode !== 'NONE';
  const modeLabel = bookingConfig?.mode ? getBookingModeLabel(bookingConfig.mode) : '';

  // Policy summary items
  const policyItems = React.useMemo(() => {
    const items: Array<{ icon: 'check' | 'info'; text: string }> = [];

    if (bookingConfig?.approval === 'REQUIRED') {
      items.push({ icon: 'info', text: 'Krever godkjenning' });
    } else if (bookingConfig?.approval === 'AUTO') {
      items.push({ icon: 'check', text: 'Automatisk bekreftelse' });
    }

    if (bookingConfig?.paymentRequired) {
      items.push({ icon: 'info', text: 'Betaling påkrevd' });
    }

    if (bookingConfig?.minLeadTimeHours) {
      const hours = bookingConfig.minLeadTimeHours;
      const text = hours >= 24
        ? `Min. ${Math.floor(hours / 24)} dag${hours >= 48 ? 'er' : ''} før`
        : `Min. ${hours} timer før`;
      items.push({ icon: 'info', text });
    }

    if (bookingConfig?.cancellationPolicy) {
      const labels: Record<string, string> = {
        flexible: 'Fleksibel avbestilling',
        moderate: 'Moderat avbestilling',
        strict: 'Streng avbestillingspolicy',
      };
      items.push({ icon: 'info', text: labels[bookingConfig.cancellationPolicy] || '' });
    }

    return items;
  }, [bookingConfig]);

  return (
    <Card
      className={className}
      style={{
        padding: 'var(--ds-spacing-5)',
        backgroundColor: 'var(--ds-color-accent-surface-default)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--ds-spacing-4)' }}>
        <Heading level={3} data-size="sm" style={{ margin: 0 }}>
          Book dette lokalet
        </Heading>
        {modeLabel && (
          <Tag color="info" data-size="sm">
            {modeLabel}
          </Tag>
        )}
      </div>

      {/* Price display */}
      {pricing?.displayPrice && (
        <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          <Paragraph data-size="xl" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)' }}>
            {pricing.displayPrice}
          </Paragraph>
          {pricing.unit && (
            <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
              per {pricing.unit}
            </Paragraph>
          )}
        </div>
      )}

      {/* Book button */}
      <Button
        type="button"
        variant="primary"
        data-color="accent"
        data-size="md"
        onClick={onBookClick}
        disabled={!isBookable}
        style={{ width: '100%', marginBottom: 'var(--ds-spacing-4)' }}
      >
        <CalendarIcon size={18} />
        {isBookable ? 'Velg dato og tid' : 'Ikke tilgjengelig for booking'}
      </Button>

      {/* Policy summary */}
      {policyItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
          {policyItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {item.icon === 'check' ? (
                <CheckIcon />
              ) : (
                <InfoIcon />
              )}
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {item.text}
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default BookingWidgetPlacement;
