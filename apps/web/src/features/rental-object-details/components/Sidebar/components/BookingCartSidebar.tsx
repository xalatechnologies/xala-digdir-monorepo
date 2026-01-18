/**
 * BookingCartSidebar Component
 * Displays a sidebar with selected booking slots, pricing, and additional services.
 */

import * as React from 'react';
import { Heading, Paragraph } from '@xala/ds';
import { useT } from '@xala/i18n';

// Icons
function ShoppingCartIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CalendarIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function TagIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function PlusIcon({ size = 16 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// Types for pricing
export interface PriceGroup {
  id: string;
  label: string;
  pricePerHour: number;
}

export interface AdditionalService {
  id: string;
  label: string;
  price: number;
}

export interface SlotDetail {
  duration: number;
  purpose?: string;
  attendees?: string;
  activityType?: string;
}

export interface BookingCartSidebarProps {
  selectedSlots: Set<string>;
  slotDetails: Record<string, SlotDetail>;
  weekStart: Date;
  onRemoveSlot: (slotKey: string) => void;
  lastUpdated?: Date;
  // Pricing props
  priceGroups?: PriceGroup[];
  additionalServices?: AdditionalService[];
  selectedPriceGroup?: string;
  selectedServices?: Set<string>;
  onPriceGroupChange?: (groupId: string) => void;
  onServiceToggle?: (serviceId: string, checked: boolean) => void;
}

export function BookingCartSidebar({
  selectedSlots,
  slotDetails,
  weekStart,
  onRemoveSlot,
  lastUpdated,
  priceGroups = [],
  additionalServices = [],
  selectedPriceGroup = '',
  selectedServices = new Set(),
  onPriceGroupChange,
  onServiceToggle,
}: BookingCartSidebarProps): React.ReactElement {
  const t = useT();
  const [expandedSlot, setExpandedSlot] = React.useState<string | null>(null);

  // Translated month names
  const monthNames = React.useMemo(() => [
    t('months.full.jan'), t('months.full.feb'), t('months.full.mar'),
    t('months.full.apr'), t('months.full.may'), t('months.full.jun'),
    t('months.full.jul'), t('months.full.aug'), t('months.full.sep'),
    t('months.full.oct'), t('months.full.nov'), t('months.full.dec'),
  ], [t]);

  // Format last updated timestamp
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 10) {
      return t('time.justNow');
    } else if (diffSeconds < 60) {
      return t('time.secondsAgo', { count: diffSeconds });
    } else if (diffMinutes < 60) {
      return diffMinutes === 1
        ? t('time.minuteAgo', { count: diffMinutes })
        : t('time.minutesAgo', { count: diffMinutes });
    } else if (diffHours < 24) {
      return diffHours === 1
        ? t('time.hourAgo', { count: diffHours })
        : t('time.hoursAgo', { count: diffHours });
    } else {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${date.getDate()}. ${monthNames[date.getMonth()]} ${t('time.at')} ${hours}:${minutes}`;
    }
  };

  const slotCount = selectedSlots.size;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-3)',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Cart Header - Compact */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--ds-spacing-2) 0',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
          <ShoppingCartIcon size={18} />
          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            {slotCount > 0 ? t('bookingCart.page.title') : t('bookingCart.empty.title')}
          </Paragraph>
        </div>
        {slotCount > 0 && (
          <span
            style={{
              backgroundColor: 'var(--ds-color-accent-base-default)',
              color: 'white',
              borderRadius: 'var(--ds-border-radius-full)',
              padding: '2px 8px',
              fontSize: 'var(--ds-font-size-xs)',
              fontWeight: 'var(--ds-font-weight-semibold)',
            }}
          >
            {slotCount}
          </span>
        )}
      </div>

      {/* Scrollable Content - List of selected slots */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)', minWidth: 0 }}>
        {slotCount === 0 ? (
          <div
            style={{
              padding: 'var(--ds-spacing-6)',
              textAlign: 'center',
              color: 'var(--ds-color-neutral-text-subtle)',
              backgroundColor: 'var(--ds-color-neutral-surface-default)',
              borderRadius: 'var(--ds-border-radius-lg)',
              border: '1px dashed var(--ds-color-neutral-border-default)',
            }}
          >
            <CalendarIcon size={32} />
            <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)' }}>
              {t('bookingCart.empty.page.title')}
            </Paragraph>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)' }}>
              {t('bookingCart.empty.description')}
            </Paragraph>
          </div>
        ) : (
          Array.from(selectedSlots).map(slotKey => {
            const parts = slotKey.split('-');
            const dayIdx = parseInt(parts[0] ?? '0', 10);
            const timeStr = parts[1] ?? '';
            const details = slotDetails[slotKey] ?? { duration: 60 };
            const isExpanded = expandedSlot === slotKey;

            const [startH, startM] = timeStr.split(':').map(Number);
            const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
            const endH = Math.floor(endMins / 60);
            const endM = endMins % 60;
            const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            const slotDate = new Date(weekStart);
            slotDate.setDate(weekStart.getDate() + dayIdx);

            return (
              <div
                key={slotKey}
                style={{
                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                  borderRadius: 'var(--ds-border-radius-lg)',
                  border: '1px solid var(--ds-color-neutral-border-subtle)',
                  overflow: 'hidden',
                }}
              >
                {/* Slot Header - Always Visible */}
                <button
                  type="button"
                  onClick={() => setExpandedSlot(isExpanded ? null : slotKey)}
                  style={{
                    width: '100%',
                    padding: 'var(--ds-spacing-3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    backgroundColor: isExpanded ? 'var(--ds-color-accent-surface-default)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                      <CalendarIcon size={16} />
                      <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {slotDate.getDate()}. {monthNames[slotDate.getMonth()]}
                      </Paragraph>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginTop: 'var(--ds-spacing-1)' }}>
                      <ClockIcon size={14} />
                      <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', fontVariantNumeric: 'tabular-nums' }}>
                        {timeStr} - {endTime} ({details.duration / 60}t)
                      </Paragraph>
                    </div>
                  </div>
                  <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}>
                    <ChevronDownIcon size={16} />
                  </span>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: 'var(--ds-spacing-3)', borderTop: '1px solid var(--ds-color-neutral-border-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slotKey)}
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        backgroundColor: 'transparent',
                        color: 'var(--ds-color-danger-text-default)',
                        border: '1px solid var(--ds-color-danger-border-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--ds-font-size-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--ds-spacing-1)',
                      }}
                    >
                      <span>✕</span>
                      {t('bookingCart.removeSlot')}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Price Breakdown Section - Only show when slots are selected and price group chosen */}
      {slotCount > 0 && selectedPriceGroup && (
        <div
          style={{
            borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
            paddingTop: 'var(--ds-spacing-4)',
          }}
        >
          {/* Price Breakdown Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
            <TagIcon size={18} />
            <Heading level={4} data-size="xs" style={{ margin: 0 }}>
              {t('bookingCart.priceBreakdown')}
            </Heading>
          </div>
          
          {/* Price Lines */}
          {(() => {
            const selectedGroup = priceGroups.find(g => g.id === selectedPriceGroup);
            const totalHours = Array.from(selectedSlots).reduce((sum, slotKey) => {
              const details = slotDetails[slotKey] ?? { duration: 60 };
              return sum + (details.duration / 60);
            }, 0);
            const basePrice = selectedGroup ? selectedGroup.pricePerHour * totalHours : 0;
            const servicesTotal = additionalServices
              .filter(s => selectedServices.has(s.id))
              .reduce((sum, s) => sum + s.price, 0);
            const subtotal = basePrice + servicesTotal;
            const mvaRate = 0.25;
            const mvaAmount = subtotal * mvaRate;
            const total = subtotal + mvaAmount;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2)' }}>
                {/* Base price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {selectedGroup?.label} ({totalHours}t × {selectedGroup?.pricePerHour} kr)
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {basePrice.toLocaleString('nb-NO')} kr
                  </Paragraph>
                </div>

                {/* Additional services - only show if any selected */}
                {selectedServices.size > 0 && additionalServices.filter(s => selectedServices.has(s.id)).map(service => (
                  <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {service.label}
                    </Paragraph>
                    <Paragraph data-size="sm" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                      +{service.price.toLocaleString('nb-NO')} kr
                    </Paragraph>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: 'var(--ds-color-neutral-border-subtle)', margin: 'var(--ds-spacing-2) 0' }} />

                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('bookingCart.subtotal')}
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {subtotal.toLocaleString('nb-NO')} kr
                  </Paragraph>
                </div>

                {/* MVA */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('bookingCart.mva')} (25%)
                  </Paragraph>
                  <Paragraph data-size="sm" style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {mvaAmount.toLocaleString('nb-NO')} kr
                  </Paragraph>
                </div>

                {/* Total */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    padding: 'var(--ds-spacing-3)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    marginTop: 'var(--ds-spacing-2)',
                  }}
                >
                  <Paragraph data-size="md" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
                    {t('bookingCart.total')}
                  </Paragraph>
                  <Paragraph data-size="lg" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: 'var(--ds-color-accent-text-default)' }}>
                    {total.toLocaleString('nb-NO')} kr
                  </Paragraph>
                </div>

                {/* MVA notice */}
                <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', textAlign: 'center', marginTop: 'var(--ds-spacing-1)' }}>
                  {t('bookingCart.priceIncludesMva')}
                </Paragraph>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
