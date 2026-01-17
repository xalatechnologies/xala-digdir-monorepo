/**
 * PriceBreakdown Component
 *
 * Displays a detailed price breakdown for the booking including:
 * - Base rental cost (per hour/day/slot)
 * - Add-ons/additional services
 * - Discounts (if applicable)
 * - Deposit (if required)
 * - Total price
 *
 * Uses the useBookingQuote SDK hook for real-time pricing.
 */

import * as React from 'react';
import { Paragraph, Spinner } from '@xala/ds';
import { useT } from '@xala/i18n';

// =============================================================================
// Types
// =============================================================================

export interface PriceLineItem {
  id: string;
  label: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
  type: 'base' | 'addon' | 'discount' | 'deposit' | 'tax' | 'fee';
}

export interface PriceBreakdownData {
  items: PriceLineItem[];
  subtotal: number;
  discountTotal?: number;
  taxTotal?: number;
  depositAmount?: number;
  total: number;
  currency: string;
}

export interface PriceBreakdownProps {
  /** Price breakdown data */
  data?: PriceBreakdownData;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Whether to show detailed breakdown or just total */
  showDetails?: boolean;
  /** Optional class name */
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// =============================================================================
// Component
// =============================================================================

export function PriceBreakdown({
  data,
  isLoading = false,
  error,
  showDetails = true,
  className,
}: PriceBreakdownProps): React.ReactElement {
  const t = useT();

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-4)',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        <Spinner data-size="sm" />
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Beregner pris...
        </Paragraph>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-danger-surface-default)',
          borderRadius: 'var(--ds-border-radius-md)',
          border: '1px solid var(--ds-color-danger-border-default)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-danger-text-default)' }}>
          {error}
        </Paragraph>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className={className}
        style={{
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
        }}
      >
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
          Velg tidspunkt for å se pris
        </Paragraph>
      </div>
    );
  }

  const baseItems = data.items.filter((item) => item.type === 'base');
  const addonItems = data.items.filter((item) => item.type === 'addon');
  const discountItems = data.items.filter((item) => item.type === 'discount');
  const feeItems = data.items.filter((item) => item.type === 'fee' || item.type === 'tax');

  return (
    <div className={className}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-3)',
        }}
      >
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Prissammendrag
        </Paragraph>
      </div>

      {showDetails && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-2)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          {/* Base rental items */}
          {baseItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <Paragraph data-size="sm" style={{ margin: 0 }}>
                  {item.label}
                </Paragraph>
                {item.quantity && item.unitPrice && (
                  <Paragraph
                    data-size="xs"
                    style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                  >
                    {item.quantity} x {formatPrice(item.unitPrice, data.currency)}
                  </Paragraph>
                )}
              </div>
              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                {formatPrice(item.totalPrice, data.currency)}
              </Paragraph>
            </div>
          ))}

          {/* Add-ons */}
          {addonItems.length > 0 && (
            <>
              <div
                style={{
                  borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
                  paddingTop: 'var(--ds-spacing-2)',
                  marginTop: 'var(--ds-spacing-1)',
                }}
              >
                <Paragraph
                  data-size="xs"
                  style={{
                    margin: 0,
                    marginBottom: 'var(--ds-spacing-2)',
                    color: 'var(--ds-color-neutral-text-subtle)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Tilleggstjenester
                </Paragraph>
              </div>
              {addonItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Paragraph data-size="sm" style={{ margin: 0 }}>
                      {item.label}
                    </Paragraph>
                    {item.quantity && item.quantity > 1 && (
                      <Paragraph
                        data-size="xs"
                        style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                      >
                        {item.quantity} stk
                      </Paragraph>
                    )}
                  </div>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    + {formatPrice(item.totalPrice, data.currency)}
                  </Paragraph>
                </div>
              ))}
            </>
          )}

          {/* Discounts */}
          {discountItems.length > 0 && (
            <>
              {discountItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}
                  >
                    {item.label}
                  </Paragraph>
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, color: 'var(--ds-color-success-text-default)' }}
                  >
                    - {formatPrice(Math.abs(item.totalPrice), data.currency)}
                  </Paragraph>
                </div>
              ))}
            </>
          )}

          {/* Fees and taxes */}
          {feeItems.length > 0 && (
            <>
              {feeItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Paragraph
                    data-size="sm"
                    style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                  >
                    {item.label}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0 }}>
                    {formatPrice(item.totalPrice, data.currency)}
                  </Paragraph>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Deposit notice */}
      {data.depositAmount && data.depositAmount > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-info-surface-default)',
            borderRadius: 'var(--ds-border-radius-sm)',
            marginBottom: 'var(--ds-spacing-3)',
          }}
        >
          <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-info-text-default)' }}>
            Depositum: {formatPrice(data.depositAmount, data.currency)} (refunderes etter bruk)
          </Paragraph>
        </div>
      )}

      {/* Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--ds-spacing-3)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          borderRadius: 'var(--ds-border-radius-md)',
          borderTop: showDetails ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
        }}
      >
        <Paragraph
          data-size="md"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-semibold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          Totalt
        </Paragraph>
        <Paragraph
          data-size="lg"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-bold)',
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {formatPrice(data.total, data.currency)}
        </Paragraph>
      </div>
    </div>
  );
}

export default PriceBreakdown;
