/**
 * BookingAddOnsSelector Component
 *
 * Allows users to select optional add-ons for their booking.
 * Add-ons are additional services or items that can be included
 * with the booking for an extra cost.
 *
 * Examples:
 * - Equipment rental (projector, sound system)
 * - Catering services
 * - Cleaning after event
 * - Extra chairs/tables
 * - Staff assistance
 */

import * as React from 'react';
import { Paragraph, Checkbox, Badge } from '@xalatechnologies/platform/ui';
import { useT } from '@xalatechnologies/platform/i18n';

// =============================================================================
// Types
// =============================================================================

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  unit: string; // 'per_booking' | 'per_hour' | 'per_day' | 'per_unit'
  maxQuantity?: number;
  category?: string;
  icon?: string;
  isRequired?: boolean;
  requiresApproval?: boolean;
}

export interface SelectedAddOn {
  addOnId: string;
  quantity: number;
}

export interface BookingAddOnsSelectorProps {
  /** Available add-ons for this rental object */
  addOns: AddOn[];
  /** Currently selected add-ons with quantities */
  selectedAddOns: SelectedAddOn[];
  /** Callback when selection changes */
  onChange: (selected: SelectedAddOn[]) => void;
  /** Duration of booking in hours (for per_hour pricing) */
  bookingDurationHours?: number;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}

// =============================================================================
// Icons
// =============================================================================

function PlusIcon({ size = 16 }: { size?: number }): React.ReactElement {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon({ size = 16 }: { size?: number }): React.ReactElement {
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
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
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

function getUnitLabel(unit: string): string {
  switch (unit) {
    case 'per_booking':
      return 'per booking';
    case 'per_hour':
      return 'per time';
    case 'per_day':
      return 'per dag';
    case 'per_unit':
      return 'per stk';
    default:
      return unit;
  }
}

// =============================================================================
// Component
// =============================================================================

export function BookingAddOnsSelector({
  addOns,
  selectedAddOns,
  onChange,
  bookingDurationHours = 1,
  disabled = false,
  className,
}: BookingAddOnsSelectorProps): React.ReactElement | null {
  const t = useT();

  // Don't render if no add-ons available
  if (!addOns || addOns.length === 0) {
    return null;
  }

  // Group add-ons by category
  const groupedAddOns = addOns.reduce((acc, addOn) => {
    const category = addOn.category || t('booking.additionalServices');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(addOn);
    return acc;
  }, {} as Record<string, AddOn[]>);

  // Get selected quantity for an add-on
  const getSelectedQuantity = (addOnId: string): number => {
    const selected = selectedAddOns.find((s) => s.addOnId === addOnId);
    return selected?.quantity ?? 0;
  };

  // Check if add-on is selected
  const isSelected = (addOnId: string): boolean => {
    return getSelectedQuantity(addOnId) > 0;
  };

  // Toggle add-on selection
  const toggleAddOn = (addOn: AddOn) => {
    if (isSelected(addOn.id)) {
      // Remove from selection
      onChange(selectedAddOns.filter((s) => s.addOnId !== addOn.id));
    } else {
      // Add with quantity 1
      onChange([...selectedAddOns, { addOnId: addOn.id, quantity: 1 }]);
    }
  };

  // Update quantity for an add-on
  const updateQuantity = (addOnId: string, delta: number) => {
    const addOn = addOns.find((a) => a.id === addOnId);
    if (!addOn) return;

    const currentQuantity = getSelectedQuantity(addOnId);
    const newQuantity = Math.max(0, Math.min(currentQuantity + delta, addOn.maxQuantity ?? 99));

    if (newQuantity === 0) {
      onChange(selectedAddOns.filter((s) => s.addOnId !== addOnId));
    } else {
      const existing = selectedAddOns.find((s) => s.addOnId === addOnId);
      if (existing) {
        onChange(
          selectedAddOns.map((s) =>
            s.addOnId === addOnId ? { ...s, quantity: newQuantity } : s
          )
        );
      } else {
        onChange([...selectedAddOns, { addOnId, quantity: newQuantity }]);
      }
    }
  };

  // Calculate total price for add-ons
  const calculateTotalAddOnsPrice = (): number => {
    return selectedAddOns.reduce((total, selected) => {
      const addOn = addOns.find((a) => a.id === selected.addOnId);
      if (!addOn) return total;

      let price = addOn.price * selected.quantity;
      if (addOn.unit === 'per_hour') {
        price *= bookingDurationHours;
      }
      return total + price;
    }, 0);
  };

  const totalPrice = calculateTotalAddOnsPrice();
  const currency = addOns[0]?.currency ?? 'NOK';

  return (
    <div className={className}>
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
          {t('booking.additionalServices')}
        </Paragraph>
        {selectedAddOns.length > 0 && (
          <Badge data-color="accent" data-size="sm">
            {selectedAddOns.length} valgt
          </Badge>
        )}
      </div>

      {Object.entries(groupedAddOns).map(([category, categoryAddOns]) => (
        <div key={category} style={{ marginBottom: 'var(--ds-spacing-4)' }}>
          {Object.keys(groupedAddOns).length > 1 && (
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
              {category}
            </Paragraph>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
            {categoryAddOns.map((addOn) => {
              const selected = isSelected(addOn.id);
              const quantity = getSelectedQuantity(addOn.id);
              const hasQuantityControl = (addOn.maxQuantity ?? 1) > 1;

              return (
                <div
                  key={addOn.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--ds-spacing-3)',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    backgroundColor: selected
                      ? 'var(--ds-color-accent-surface-default)'
                      : 'var(--ds-color-neutral-surface-default)',
                    border: selected
                      ? '2px solid var(--ds-color-accent-border-default)'
                      : '1px solid var(--ds-color-neutral-border-subtle)',
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <Checkbox
                    checked={selected}
                    onChange={() => toggleAddOn(addOn)}
                    disabled={disabled || addOn.isRequired}
                    aria-label={addOn.name}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 'var(--ds-spacing-1)',
                      }}
                    >
                      <Paragraph
                        data-size="sm"
                        style={{
                          margin: 0,
                          fontWeight: 'var(--ds-font-weight-medium)',
                          color: selected
                            ? 'var(--ds-color-accent-text-default)'
                            : 'var(--ds-color-neutral-text-default)',
                        }}
                      >
                        {addOn.name}
                        {addOn.isRequired && (
                          <Badge
                            data-color="info"
                            data-size="xs"
                            style={{ marginLeft: 'var(--ds-spacing-2)' }}
                          >
                            t('status.paakrevd')
                          </Badge>
                        )}
                        {addOn.requiresApproval && (
                          <Badge
                            data-color="warning"
                            data-size="xs"
                            style={{ marginLeft: 'var(--ds-spacing-2)' }}
                          >
                            Godkjenning
                          </Badge>
                        )}
                      </Paragraph>
                      <Paragraph
                        data-size="sm"
                        style={{
                          margin: 0,
                          fontWeight: 'var(--ds-font-weight-semibold)',
                          color: 'var(--ds-color-neutral-text-default)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatPrice(addOn.price, addOn.currency)}
                        <span
                          style={{
                            fontSize: 'var(--ds-font-size-xs)',
                            color: 'var(--ds-color-neutral-text-subtle)',
                            fontWeight: 'var(--ds-font-weight-regular)',
                          }}
                        >
                          {' '}
                          {getUnitLabel(addOn.unit)}
                        </span>
                      </Paragraph>
                    </div>

                    {addOn.description && (
                      <Paragraph
                        data-size="xs"
                        style={{
                          margin: 0,
                          color: 'var(--ds-color-neutral-text-subtle)',
                        }}
                      >
                        {addOn.description}
                      </Paragraph>
                    )}

                    {/* Quantity control */}
                    {selected && hasQuantityControl && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--ds-spacing-2)',
                          marginTop: 'var(--ds-spacing-2)',
                        }}
                      >
                        <Paragraph
                          data-size="xs"
                          style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}
                        >
                          Antall:
                        </Paragraph>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--ds-spacing-1)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(addOn.id, -1)}
                            disabled={disabled || quantity <= 1}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--ds-border-radius-sm)',
                              border: '1px solid var(--ds-color-neutral-border-subtle)',
                              backgroundColor: 'var(--ds-color-neutral-surface-default)',
                              cursor: disabled || quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: quantity <= 1 ? 0.5 : 1,
                            }}
                          >
                            <MinusIcon />
                          </button>
                          <span
                            style={{
                              minWidth: '30px',
                              textAlign: 'center',
                              fontWeight: 'var(--ds-font-weight-medium)',
                            }}
                          >
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(addOn.id, 1)}
                            disabled={disabled || quantity >= (addOn.maxQuantity ?? 99)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: 'var(--ds-border-radius-sm)',
                              border: '1px solid var(--ds-color-neutral-border-subtle)',
                              backgroundColor: 'var(--ds-color-neutral-surface-default)',
                              cursor:
                                disabled || quantity >= (addOn.maxQuantity ?? 99)
                                  ? 'not-allowed'
                                  : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: quantity >= (addOn.maxQuantity ?? 99) ? 0.5 : 1,
                            }}
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Total add-ons price */}
      {selectedAddOns.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--ds-spacing-3)',
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
            borderRadius: 'var(--ds-border-radius-md)',
            marginTop: 'var(--ds-spacing-2)',
          }}
        >
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            Tillegg totalt:
          </Paragraph>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-semibold)',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            + {formatPrice(totalPrice, currency)}
          </Paragraph>
        </div>
      )}
    </div>
  );
}

export default BookingAddOnsSelector;
