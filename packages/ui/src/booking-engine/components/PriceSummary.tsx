/**
 * PriceSummary Component
 *
 * Displays a breakdown of booking costs including base price, services, fees, discounts, VAT and total.
 */
import * as React from 'react';
import { cn, formatPrice } from '../utils';
import type { BookingPriceCalculation } from '@digilist/contracts';

export interface PriceSummaryProps {
  /** Price calculation breakdown */
  priceCalculation: BookingPriceCalculation;
}

/**
 * Price Summary Component
 */
export function PriceSummary({ priceCalculation }: PriceSummaryProps): React.ReactElement {
  return (
    <div className="price-summary">
      {priceCalculation.items.map(item => (
        <div key={item.id} className={cn('price-row', item.type)}>
          <span className="price-label">{item.label}</span>
          <span className="price-value">
            {item.type === 'discount' ? '-' : ''}
            {formatPrice(item.total, priceCalculation.currency)}
          </span>
        </div>
      ))}
      {priceCalculation.vat > 0 && (
        <div className="price-row vat">
          <span className="price-label">MVA</span>
          <span className="price-value">{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
        </div>
      )}
      <div className="price-row total">
        <span className="price-label">Totalt</span>
        <span className="price-value">{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
      </div>
    </div>
  );
}
