/**
 * EventModeView
 *
 * Event Mode View - Select tickets for events
 */
import * as React from 'react';
import { Heading, Paragraph, Button, Alert } from '@digdir/designsystemet-react';
import {
  CalendarIcon,
  ChevronRightIcon,
  InfoIcon,
  UsersIcon,
} from '../../../primitives/icons';
import type {
  BookingConfig,
  BookingSelection,
  BookingPriceCalculation,
} from '../../../types/booking';

// Note: PriceSummary will be imported from extracted component once available
// For now, we reference it from the parent file - this will be updated in phase 3
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PriceSummary = ({ priceCalculation }: { priceCalculation: BookingPriceCalculation }): React.ReactElement => {
  // Temporary placeholder - will be replaced with proper import
  return (
    <div className="price-summary">
      {priceCalculation.items.map((item) => (
        <div key={item.id} className="price-item">
          <span>{item.label}</span>
          <span>
            {item.type === 'discount' ? '-' : ''}
            {item.total} {priceCalculation.currency}
          </span>
        </div>
      ))}
      {priceCalculation.vat > 0 && (
        <div className="price-item">
          <span>MVA</span>
          <span>{priceCalculation.vat} {priceCalculation.currency}</span>
        </div>
      )}
      <div className="price-total">
        <span>Totalt</span>
        <span>{priceCalculation.total} {priceCalculation.currency}</span>
      </div>
    </div>
  );
};

interface ModeViewProps {
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
  canContinue: boolean;
}

export interface EventModeViewProps extends ModeViewProps {
  config: BookingConfig;
  selection: BookingSelection;
  onTicketChange: (tickets: number) => void;
}

/**
 * Event Mode View - Select tickets for events
 */
export function EventModeView({
  config,
  selection,
  onTicketChange,
  formatPrice,
  priceCalculation,
  onContinue,
  canContinue,
}: EventModeViewProps): React.ReactElement {
  const tickets = selection.tickets || 0;
  const maxTickets = config.eventCapacity || config.rules.maxAttendees || 100;
  const minTickets = config.rules.minAttendees || 1;

  const eventDate = config.eventDate ? new Date(config.eventDate) : null;

  return (
    <div className="selection-view event-mode">
      <div className="event-panel">
        <div className="event-header">
          <div className="event-badge">ARRANGEMENT</div>
          <Heading level={2} data-size="lg" style={{ margin: 0 }}>
            Velg antall billetter
          </Heading>
          {eventDate && (
            <div className="event-date-info">
              <CalendarIcon size={18} />
              <span>
                {eventDate.toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        <div className="ticket-selector">
          <div className="ticket-type">
            <div className="ticket-info">
              <Heading level={3} data-size="sm" style={{ margin: 0 }}>Standardbillett</Heading>
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                Inkluderer adgang til arrangementet
              </Paragraph>
            </div>
            <div className="ticket-price">
              {formatPrice(config.pricing.basePrice, config.pricing.currency)}
              <span className="price-per">/person</span>
            </div>
            <div className="ticket-controls">
              <button
                type="button"
                className="ticket-btn"
                onClick={() => onTicketChange(Math.max(0, tickets - 1))}
                disabled={tickets <= 0}
                aria-label="Reduser antall"
              >
                −
              </button>
              <span className="ticket-count">{tickets}</span>
              <button
                type="button"
                className="ticket-btn"
                onClick={() => onTicketChange(Math.min(maxTickets, tickets + 1))}
                disabled={tickets >= maxTickets}
                aria-label="Øk antall"
              >
                +
              </button>
            </div>
          </div>

          <div className="ticket-capacity">
            <UsersIcon size={16} />
            <span>{maxTickets - tickets} plasser igjen</span>
          </div>
        </div>

        {tickets >= minTickets && (
          <Alert data-color="info">
            <InfoIcon size={16} />
            Du har valgt {tickets} billett{tickets !== 1 ? 'er' : ''}. Minimum {minTickets} billett{minTickets !== 1 ? 'er' : ''} kreves.
          </Alert>
        )}
      </div>

      <div className="summary-panel">
        <div className="summary-header">
          <UsersIcon size={20} />
          <Heading level={3} data-size="sm" style={{ margin: 0 }}>
            Din bestilling
          </Heading>
        </div>

        {tickets === 0 ? (
          <div className="summary-empty">
            <div className="empty-illustration">
              <UsersIcon size={40} />
            </div>
            <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
              Velg antall billetter for å fortsette
            </Paragraph>
          </div>
        ) : (
          <>
            <div className="order-summary">
              <div className="order-item">
                <span>Standardbillett × {tickets}</span>
                <span>{formatPrice(tickets * config.pricing.basePrice, config.pricing.currency)}</span>
              </div>
            </div>

            <PriceSummary priceCalculation={priceCalculation} />

            <div className="summary-actions">
              <Button type="button" variant="tertiary" onClick={() => onTicketChange(0)}>
                Tøm
              </Button>
              <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
                Fortsett
                <ChevronRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
