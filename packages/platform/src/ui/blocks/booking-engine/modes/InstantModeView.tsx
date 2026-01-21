/**
 * InstantModeView
 *
 * Instant Mode View - Direct booking without calendar
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import {
  SparklesIcon,
  ChevronRightIcon,
} from '../../../primitives/icons';
import type {
  BookingConfig,
  BookingPriceCalculation,
} from '../../../types/booking';
import { formatPriceUnit } from '../utils';

interface ModeViewProps {
  formatPrice: (amount: number, currency: string) => string;
  priceCalculation: BookingPriceCalculation;
  onContinue: () => void;
  canContinue: boolean;
}

export interface InstantModeViewProps extends ModeViewProps {
  config: BookingConfig;
}

/**
 * Instant Mode View - Direct booking without calendar
 */
export function InstantModeView({
  config,
  formatPrice,
  onContinue,
}: InstantModeViewProps): React.ReactElement {
  return (
    <div className="selection-view instant-mode">
      <div className="instant-panel">
        <div className="instant-icon">
          <SparklesIcon size={48} />
        </div>
        <Heading level={2} data-size="lg" style={{ margin: 0, textAlign: 'center' }}>
          Direkte booking
        </Heading>
        <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '400px' }}>
          Denne tjenesten krever ingen kalendervalg. Fyll ut skjemaet for å fullføre bestillingen.
        </Paragraph>

        <div className="instant-price-card">
          <span className="instant-price-label">Pris</span>
          <span className="instant-price-amount">
            {formatPrice(config.pricing.basePrice, config.pricing.currency)}
          </span>
          <span className="instant-price-unit">per {formatPriceUnit(config.pricing.unit)}</span>
        </div>

        <Button type="button" variant="primary" data-color="accent" data-size="lg" onClick={onContinue}>
          Fortsett til bestilling
          <ChevronRightIcon size={20} />
        </Button>
      </div>
    </div>
  );
}
