/**
 * BookingFormStep
 *
 * Booking Form Step - Collect user details and additional services
 */
import * as React from 'react';
import { Heading, Button } from '@digdir/designsystemet-react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../primitives/icons';
import type {
  BookingFormData,
  BookingConfig,
} from '../../../types/booking';
import { formatPrice } from '../../../types/booking';
import type { AdditionalService } from '../../../types/listing-detail';

export interface BookingFormStepProps {
  formData: Partial<BookingFormData>;
  config: BookingConfig;
  additionalServices: AdditionalService[];
  onFormChange: (field: keyof BookingFormData, value: unknown) => void;
  onBack: () => void;
  onContinue: () => void;
  canContinue: boolean;
}

/**
 * Booking Form Step - Collect user details
 */
export function BookingFormStep({
  formData,
  config,
  additionalServices,
  onFormChange,
  onBack,
  onContinue,
  canContinue,
}: BookingFormStepProps): React.ReactElement {
  return (
    <div className="form-view">
      <div className="form-grid">
        {/* Contact Information */}
        <div className="form-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Kontaktinformasjon
          </Heading>

          <div className="form-group">
            <label htmlFor="name">Navn *</label>
            <input
              id="name"
              type="text"
              value={formData.name || ''}
              onChange={e => onFormChange('name', e.target.value)}
              placeholder="Ditt fulle navn"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">E-post *</label>
              <input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={e => onFormChange('email', e.target.value)}
                placeholder="din@epost.no"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Telefon *</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={e => onFormChange('phone', e.target.value)}
                placeholder="+47 XXX XX XXX"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organisasjon</label>
            <input
              id="organization"
              type="text"
              value={formData.organization || ''}
              onChange={e => onFormChange('organization', e.target.value)}
              placeholder="Bedrift eller organisasjon (valgfritt)"
            />
          </div>
        </div>

        {/* Booking Details */}
        <div className="form-section">
          <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
            Bookingdetaljer
          </Heading>

          <div className="form-group">
            <label htmlFor="purpose">Formål *</label>
            <input
              id="purpose"
              type="text"
              value={formData.purpose || ''}
              onChange={e => onFormChange('purpose', e.target.value)}
              placeholder="Hva skal du bruke lokalet til?"
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.showPurposeInCalendar || false}
                onChange={e => onFormChange('showPurposeInCalendar', e.target.checked)}
              />
              <span>Vis formål i offentlig kalender</span>
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numberOfPeople">Antall personer *</label>
              <input
                id="numberOfPeople"
                type="number"
                min={1}
                max={config.rules.maxAttendees || 100}
                value={formData.numberOfPeople || 1}
                onChange={e => onFormChange('numberOfPeople', parseInt(e.target.value))}
              />
            </div>
            {config.activityTypes && config.activityTypes.length > 0 && (
              <div className="form-group">
                <label htmlFor="activityType">Aktivitetstype</label>
                <select
                  id="activityType"
                  value={formData.activityType || ''}
                  onChange={e => onFormChange('activityType', e.target.value)}
                >
                  <option value="">Velg type</option>
                  {config.activityTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Tilleggsinfo</label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes || ''}
              onChange={e => onFormChange('notes', e.target.value)}
              placeholder="Eventuelle spesielle behov eller kommentarer"
            />
          </div>
        </div>

        {/* Additional Services */}
        {additionalServices.length > 0 && (
          <div className="form-section services-section">
            <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)' }}>
              Tilleggstjenester
            </Heading>
            <div className="services-list">
              {additionalServices.map(service => (
                <label key={service.id} className="service-item">
                  <input
                    type="checkbox"
                    checked={formData.additionalServices?.includes(service.id) || false}
                    onChange={e => {
                      const current = formData.additionalServices || [];
                      const newServices = e.target.checked
                        ? [...current, service.id]
                        : current.filter(id => id !== service.id);
                      onFormChange('additionalServices', newServices);
                    }}
                  />
                  <div className="service-info">
                    <span className="service-name">{service.name}</span>
                    {service.description && (
                      <span className="service-desc">{service.description}</span>
                    )}
                  </div>
                  <span className="service-price">+{formatPrice(service.price, config.pricing.currency)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="form-section terms-section">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.acceptedTerms || false}
                onChange={e => onFormChange('acceptedTerms', e.target.checked)}
                required
              />
              <span>
                Jeg godtar <a href={config.rules.termsUrl || '#'} target="_blank" rel="noopener noreferrer">vilkårene</a> for booking *
              </span>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.acceptedCancellationPolicy || false}
                onChange={e => onFormChange('acceptedCancellationPolicy', e.target.checked)}
              />
              <span>
                Jeg har lest og forstår avbestillingsreglene ({config.rules.cancellationPolicy})
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <Button type="button" variant="tertiary" onClick={onBack}>
          <ChevronLeftIcon size={18} />
          Tilbake
        </Button>
        <Button type="button" variant="primary" data-color="accent" onClick={onContinue} disabled={!canContinue}>
          Fortsett til bekreftelse
          <ChevronRightIcon size={18} />
        </Button>
      </div>
    </div>
  );
}
