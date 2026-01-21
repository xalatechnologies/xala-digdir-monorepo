/**
 * BookingConfirmStep
 *
 * Confirmation step showing booking summary and price breakdown
 */
import * as React from 'react';
import { Heading, Paragraph, Button, Alert } from '@digdir/designsystemet-react';
import { cn } from '../../../utils';
import {
  CalendarIcon,
  ChevronLeftIcon,
  UsersIcon,
  InfoIcon,
} from '../../../primitives/icons';
import type {
  BookingConfig,
  BookingSelection,
  BookingFormData,
  BookingPriceCalculation,
} from '../../../types/booking';
import { formatPrice } from '../../../types/booking';
import type { AdditionalService } from '../../../types';

export interface BookingConfirmStepProps {
  selection: BookingSelection;
  formData: BookingFormData;
  config: BookingConfig;
  rentalObjectName: string;
  rentalObjectImage?: string;
  priceCalculation: BookingPriceCalculation;
  additionalServices: AdditionalService[];
  isSubmitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export function BookingConfirmStep({
  selection,
  formData,
  config,
  rentalObjectName,
  rentalObjectImage,
  priceCalculation,
  additionalServices,
  isSubmitting,
  submitError,
  onBack,
  onSubmit,
}: BookingConfirmStepProps): React.ReactElement {
  const selectedServiceNames = additionalServices
    .filter(s => formData.additionalServices.includes(s.id))
    .map(s => s.name);

  return (
    <div className="confirm-view">
      <div className="confirm-grid">
        {/* Booking Summary */}
        <div className="confirm-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Bookingsammendrag
          </Heading>

          <div className="confirm-card rental-object-card">
            {rentalObjectImage && (
              <img src={rentalObjectImage} alt={rentalObjectName} className="rental-object-image" />
            )}
            <div className="rental-object-info">
              <Heading level={4} data-size="xs" style={{ margin: 0 }}>{rentalObjectName}</Heading>
              <span className="rental-object-type">{config.listingType}</span>
            </div>
          </div>

          {/* Time Selection Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <CalendarIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Tid
            </Heading>

            {config.mode === 'slots' && selection.slots.length > 0 && (
              <div className="time-list">
                {selection.slots.slice(0, 3).map(slot => (
                  <div key={slot.id} className="time-item">
                    <span>{new Date(slot.date).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>
                ))}
                {selection.slots.length > 3 && (
                  <span className="more-times">+{selection.slots.length - 3} flere tidspunkter</span>
                )}
              </div>
            )}

            {config.mode === 'dateRange' && selection.dateRange && (
              <div className="date-range-display">
                <span>{new Date(selection.dateRange.start).toLocaleDateString('nb-NO')} - {new Date(selection.dateRange.end).toLocaleDateString('nb-NO')}</span>
              </div>
            )}

            {config.mode === 'event' && selection.tickets && (
              <div className="tickets-display">
                <span>{selection.tickets} billett{selection.tickets !== 1 ? 'er' : ''}</span>
                {config.eventDate && (
                  <span className="event-date">{new Date(config.eventDate).toLocaleDateString('nb-NO', { dateStyle: 'full' })}</span>
                )}
              </div>
            )}
          </div>

          {/* Contact Info Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <UsersIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Kontakt
            </Heading>
            <div className="contact-summary">
              <p><strong>{formData.name}</strong></p>
              <p>{formData.email}</p>
              <p>{formData.phone}</p>
              {formData.organization && <p>{formData.organization}</p>}
            </div>
          </div>

          {/* Booking Details Summary */}
          <div className="confirm-card">
            <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              <InfoIcon size={16} style={{ verticalAlign: 'middle', marginRight: 'var(--ds-spacing-2)' }} />
              Detaljer
            </Heading>
            <div className="details-summary">
              <div className="detail-row">
                <span>Formål</span>
                <span>{formData.purpose}</span>
              </div>
              <div className="detail-row">
                <span>Antall personer</span>
                <span>{formData.numberOfPeople}</span>
              </div>
              {formData.activityType && (
                <div className="detail-row">
                  <span>Aktivitet</span>
                  <span>{formData.activityType}</span>
                </div>
              )}
              {selectedServiceNames.length > 0 && (
                <div className="detail-row">
                  <span>Tilleggstjenester</span>
                  <span>{selectedServiceNames.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="confirm-section price-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Pris
          </Heading>

          <div className="price-breakdown">
            {priceCalculation.items.map(item => (
              <div key={item.id} className={cn('price-row', item.type)}>
                <span>{item.label}</span>
                <span>{item.type === 'discount' ? '-' : ''}{formatPrice(item.total, priceCalculation.currency)}</span>
              </div>
            ))}

            {priceCalculation.vat > 0 && (
              <div className="price-row vat">
                <span>MVA ({config.pricing.vatPercentage}%)</span>
                <span>{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
              </div>
            )}

            <div className="price-row total">
              <span>Totalt å betale</span>
              <span>{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="policy-notice">
            <InfoIcon size={16} />
            <div>
              <strong>Avbestillingsregler</strong>
              <p>
                {config.rules.cancellationPolicy === 'flexible' && 'Gratis avbestilling inntil 24 timer før.'}
                {config.rules.cancellationPolicy === 'moderate' && `Gratis avbestilling inntil ${config.rules.freeCancellationHours} timer før.`}
                {config.rules.cancellationPolicy === 'strict' && 'Ingen refusjon ved avbestilling.'}
              </p>
            </div>
          </div>

          {submitError && (
            <Alert data-color="danger" style={{ marginTop: 'var(--ds-spacing-4)' }}>
              {submitError}
            </Alert>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="confirm-actions">
        <Button type="button" variant="tertiary" onClick={onBack} disabled={isSubmitting}>
          <ChevronLeftIcon size={18} />
          Tilbake
        </Button>
        <Button
          type="button"
          variant="primary"
          data-color="accent"
          data-size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sender booking...' : config.rules.requireApproval ? 'Send forespørsel' : 'Bekreft booking'}
        </Button>
      </div>

      {config.rules.requireApproval && (
        <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-4)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
          Denne bookingen krever godkjenning. Du vil motta svar på e-post.
        </Paragraph>
      )}
    </div>
  );
}
