/**
 * AdditionalServicesList
 *
 * List of add-on services with checkmarks, descriptions, and prices.
 * Services can be selectable for booking.
 */
import * as React from 'react';
import { Tag, Paragraph } from '@digdir/designsystemet-react';
import { cn } from '../utils';
import { CheckIcon } from '../primitives/icons';
import type { AdditionalService } from '../types/listing-detail';

export interface AdditionalServicesListProps {
  /** Array of additional services */
  services: AdditionalService[];
  /** Currently selected service IDs */
  selectedServices?: string[];
  /** Callback when a service is selected/deselected */
  onServiceSelect?: (id: string, selected: boolean) => void;
  /** Title for the section */
  title?: string;
  /** Whether to show prices */
  showPrices?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * AdditionalServicesList component
 *
 * @example
 * ```tsx
 * <AdditionalServicesList
 *   services={[
 *     { id: '1', name: 'Ekstra tid', description: 'Forleng bookingen med 30 minutter', price: 200 },
 *     { id: '2', name: 'Utstyr', description: 'Inkluderer ballnett, musikanlegg og annet utstyr', price: 150 },
 *   ]}
 *   selectedServices={['1']}
 *   onServiceSelect={(id, selected) => console.log(id, selected)}
 * />
 * ```
 */
export function AdditionalServicesList({
  services,
  selectedServices = [],
  onServiceSelect,
  title = 'TILLEGGSTJENESTER',
  showPrices = true,
  className,
}: AdditionalServicesListProps): React.ReactElement {
  const handleClick = (service: AdditionalService) => {
    if (!onServiceSelect) return;
    const isSelected = selectedServices.includes(service.id);
    onServiceSelect(service.id, !isSelected);
  };

  return (
    <div className={cn('additional-services-list', className)}>
      {title && (
        <Paragraph
          data-size="xs"
          style={{
            margin: '0 0 var(--ds-spacing-3) 0',
            color: 'var(--ds-color-neutral-text-subtle)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--ds-letter-spacing-wide, 0.025em)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          {title}
        </Paragraph>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-2)',
        }}
      >
        {services.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          const isClickable = !!onServiceSelect;

          return (
            <div
              key={service.id}
              onClick={() => handleClick(service)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick(service);
                      }
                    }
                  : undefined
              }
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 'var(--ds-spacing-4)',
                padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                backgroundColor: isSelected
                  ? 'var(--ds-color-accent-surface-default)'
                  : 'var(--ds-color-neutral-background-default)',
                border: `1px solid ${
                  isSelected
                    ? 'var(--ds-color-accent-border-default)'
                    : 'var(--ds-color-neutral-border-subtle)'
                }`,
                borderRadius: 'var(--ds-border-radius-md)',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Left side: Check icon + content */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--ds-spacing-3)',
                  flex: 1,
                }}
              >
                {/* Check icon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--ds-spacing-5)',
                    height: 'var(--ds-spacing-5)',
                    marginTop: 'var(--ds-spacing-1)',
                    color: isSelected
                      ? 'var(--ds-color-success-base-default)'
                      : 'var(--ds-color-neutral-text-subtle)',
                  }}
                >
                  <CheckIcon size={16} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <Paragraph
                    data-size="sm"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-medium)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {service.name}
                  </Paragraph>
                  {service.description && (
                    <Paragraph
                      data-size="xs"
                      style={{
                        margin: 'var(--ds-spacing-1) 0 0 0',
                        color: 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {service.description}
                    </Paragraph>
                  )}
                </div>
              </div>

              {/* Price badge */}
              {showPrices && service.price !== undefined && (
                <Tag
                  data-size="sm"
                  data-color="accent"
                  style={{
                    flexShrink: 0,
                  }}
                >
                  +{service.price} {service.currency || 'kr'}
                </Tag>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdditionalServicesList;
