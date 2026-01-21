/**
 * PricingSummary
 *
 * A generic, domain-neutral pricing summary component for displaying
 * price breakdowns with line items, subtotals, taxes, and totals.
 *
 * This is a platform-level pattern component that can be used by any
 * domain (e-commerce, bookings, subscriptions, etc.) by passing
 * props-based line items rather than domain-specific DTOs.
 *
 * @example
 * ```tsx
 * <PricingSummary
 *   items={[
 *     { id: '1', label: 'Service Fee', amount: '450 kr', type: 'base' },
 *     { id: '2', label: 'Discount (10%)', amount: '-45 kr', type: 'discount' },
 *     { id: '3', label: 'Additional Fee', amount: '50 kr', type: 'fee' },
 *   ]}
 *   subtotal={{ label: 'Subtotal', amount: '455 kr' }}
 *   tax={{ label: 'VAT (25%)', amount: '113.75 kr' }}
 *   total={{ label: 'Total', amount: '568.75 kr' }}
 *   cta={{ label: 'Confirm', disabled: false }}
 *   onCtaClick={() => handleConfirm()}
 * />
 * ```
 */
import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import type { PriceLineItem as BasePriceLineItem } from './types';

// =============================================================================
// Types
// =============================================================================

/**
 * Extended line item type with additional 'original' variant for strikethrough prices
 */
export type PriceLineItemType =
  | 'base'
  | 'discount'
  | 'fee'
  | 'tax'
  | 'subtotal'
  | 'original';

/**
 * Extended PriceLineItem with required type field and optional quantity
 * Extends the base PriceLineItem from types.ts
 */
export interface PricingSummaryLineItem extends Omit<BasePriceLineItem, 'type' | 'strikethrough'> {
  /** Type of line item - affects styling (required for PricingSummary) */
  type: PriceLineItemType;
  /** Optional quantity display (e.g., "3 x 150 kr") */
  quantity?: string;
}

/**
 * Props for the PricingSummary component
 */
export interface PricingSummaryProps {
  /** Array of price line items to display */
  items: PricingSummaryLineItem[];
  /** Optional subtotal section */
  subtotal?: {
    label: string;
    amount: string;
  };
  /** Optional tax section */
  tax?: {
    label: string;
    amount: string;
  };
  /** Required total section with prominent styling */
  total: {
    label: string;
    amount: string;
  };
  /** Optional call-to-action button configuration */
  cta?: {
    label: string;
    disabled?: boolean;
    loading?: boolean;
  };
  /** Custom labels for the component */
  labels?: {
    /** Title for the pricing summary (default: none) */
    title?: string;
  };
  /** Handler for CTA button click */
  onCtaClick?: () => void;
  /** Additional CSS class name */
  className?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Concatenate class names, filtering out falsy values
 */
function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get styles for a specific line item type
 */
function getLineItemStyles(type: PriceLineItemType): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    margin: 0,
    fontWeight: 'var(--ds-font-weight-regular)' as unknown as number,
  };

  switch (type) {
    case 'discount':
      return {
        ...baseStyles,
        color: 'var(--ds-color-success-text-default)',
        fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
      };
    case 'original':
      return {
        ...baseStyles,
        color: 'var(--ds-color-neutral-text-subtle)',
        textDecoration: 'line-through',
      };
    case 'subtotal':
      return {
        ...baseStyles,
        fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
        color: 'var(--ds-color-neutral-text-default)',
      };
    case 'tax':
      return {
        ...baseStyles,
        color: 'var(--ds-color-neutral-text-subtle)',
      };
    case 'fee':
    case 'base':
    default:
      return {
        ...baseStyles,
        color: 'var(--ds-color-neutral-text-default)',
      };
  }
}

// =============================================================================
// Sub-components
// =============================================================================

interface LineItemRowProps {
  item: PricingSummaryLineItem;
}

function LineItemRow({ item }: LineItemRowProps): React.ReactElement {
  const amountStyles = getLineItemStyles(item.type);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            color:
              item.type === 'original'
                ? 'var(--ds-color-neutral-text-subtle)'
                : 'var(--ds-color-neutral-text-default)',
            textDecoration: item.type === 'original' ? 'line-through' : 'none',
          }}
        >
          {item.label}
          {item.quantity && (
            <span
              style={{
                color: 'var(--ds-color-neutral-text-subtle)',
                marginLeft: 'var(--ds-spacing-1)',
              }}
            >
              ({item.quantity})
            </span>
          )}
        </Paragraph>
        {item.description && (
          <Paragraph
            data-size="xs"
            style={{
              margin: 0,
              marginTop: 'var(--ds-spacing-1)',
              color: 'var(--ds-color-neutral-text-subtle)',
            }}
          >
            {item.description}
          </Paragraph>
        )}
      </div>
      <Paragraph data-size="sm" style={amountStyles}>
        {item.amount}
      </Paragraph>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  amount: string;
  variant?: 'default' | 'subtle' | 'prominent';
}

function SummaryRow({
  label,
  amount,
  variant = 'default',
}: SummaryRowProps): React.ReactElement {
  const isProminent = variant === 'prominent';
  const isSubtle = variant === 'subtle';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 'var(--ds-spacing-2)',
      }}
    >
      <Paragraph
        data-size={isProminent ? 'md' : 'sm'}
        style={{
          margin: 0,
          fontWeight: isProminent
            ? ('var(--ds-font-weight-semibold)' as unknown as number)
            : ('var(--ds-font-weight-medium)' as unknown as number),
          color: isSubtle
            ? 'var(--ds-color-neutral-text-subtle)'
            : 'var(--ds-color-neutral-text-default)',
        }}
      >
        {label}
      </Paragraph>
      {isProminent ? (
        <Heading
          level={4}
          data-size="md"
          style={{
            margin: 0,
            color: 'var(--ds-color-neutral-text-default)',
          }}
        >
          {amount}
        </Heading>
      ) : (
        <Paragraph
          data-size="sm"
          style={{
            margin: 0,
            fontWeight: 'var(--ds-font-weight-medium)' as unknown as number,
            color: isSubtle
              ? 'var(--ds-color-neutral-text-subtle)'
              : 'var(--ds-color-neutral-text-default)',
          }}
        >
          {amount}
        </Paragraph>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * PricingSummary component
 *
 * A generic pricing summary display with line items, subtotal, tax, and total.
 * Domain-neutral design allows use across any pricing context.
 */
export function PricingSummary({
  items,
  subtotal,
  tax,
  total,
  cta,
  labels,
  onCtaClick,
  className,
}: PricingSummaryProps): React.ReactElement {
  const hasItems = items.length > 0;
  const hasSummarySection = subtotal || tax;

  return (
    <div
      className={cn('pricing-summary', className)}
      style={{
        backgroundColor: 'var(--ds-color-neutral-surface-default)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        borderRadius: 'var(--ds-border-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Optional Title Header */}
      {labels?.title && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            background:
              'linear-gradient(135deg, var(--ds-color-accent-surface-default) 0%, var(--ds-color-accent-surface-hover) 100%)',
          }}
        >
          <Heading
            level={3}
            data-size="sm"
            style={{
              margin: 0,
              color: 'var(--ds-color-accent-text-default)',
            }}
          >
            {labels.title}
          </Heading>
        </div>
      )}

      {/* Line Items Section */}
      {hasItems && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderBottom: hasSummarySection || total ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-3)',
            }}
          >
            {items.map((item) => (
              <LineItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Subtotal and Tax Section */}
      {hasSummarySection && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
            backgroundColor: 'var(--ds-color-neutral-surface-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-2)',
            }}
          >
            {subtotal && (
              <SummaryRow
                label={subtotal.label}
                amount={subtotal.amount}
                variant="default"
              />
            )}
            {tax && (
              <SummaryRow
                label={tax.label}
                amount={tax.amount}
                variant="subtle"
              />
            )}
          </div>
        </div>
      )}

      {/* Total Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          backgroundColor: 'var(--ds-color-neutral-surface-hover)',
        }}
      >
        <SummaryRow
          label={total.label}
          amount={total.amount}
          variant="prominent"
        />
      </div>

      {/* CTA Button */}
      {cta && onCtaClick && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            paddingTop: 0,
            backgroundColor: 'var(--ds-color-neutral-surface-hover)',
          }}
        >
          <Button
            type="button"
            variant="primary"
            data-size="md"
            onClick={onCtaClick}
            disabled={cta.disabled}
            loading={cta.loading}
            style={{
              width: '100%',
            }}
          >
            {cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default PricingSummary;
