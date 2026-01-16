/**
 * UnifiedBookingEngine
 *
 * Comprehensive booking system that adapts to all rental object types.
 * Supports: Slot-based, Daily, Date Range, Event, Recurring bookings.
 *
 * This file orchestrates the booking flow and delegates to specialized
 * mode view components and step components for better maintainability.
 */
import * as React from 'react';
import { Heading, Paragraph, Button, Alert } from '@digdir/designsystemet-react';
import { cn } from '../../utils';
import {
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  UsersIcon,
  InfoIcon,
  SparklesIcon,
} from '../../primitives/icons';
import type {
  BookingConfig,
  BookingMode,
  BookingSelection,
  BookingFormData,
  BookingPriceCalculation,
  AvailabilitySlot,
  DayAvailability,
  PriceItem,
  BookingPricing,
} from '../../types/booking';
import { getBookingSteps } from '../../types/booking';
import type { AdditionalService } from '../../types/listing-detail';

// Import extracted utilities
import { getModeLabel, getModeDescription, formatPrice, formatPriceUnit } from './utils';

// Import extracted icons
import {
  CalendarStepIcon,
  FormStepIcon,
  ConfirmStepIcon,
  SuccessStepIcon,
  PaymentStepIcon,
} from './icons';

// Import mode view components
import { DailyModeView } from './modes/DailyModeView';
import { DateRangeModeView } from './modes/DateRangeModeView';
import { EventModeView } from './modes/EventModeView';
import { RecurringModeView } from './modes/RecurringModeView';
import { InstantModeView } from './modes/InstantModeView';

// Import step components
import { BookingFormStep } from './steps/BookingFormStep';
import { BookingConfirmStep } from './steps/BookingConfirmStep';

// Import styles
import { unifiedBookingEngineStyles } from './styles';

export interface UnifiedBookingEngineProps {
  /** Booking configuration */
  config: BookingConfig;
  /** Rental object name for display */
  rentalObjectName: string;
  /** Rental object image URL */
  rentalObjectImage?: string;
  /** Available slots (for slot/daily mode) */
  availableSlots?: AvailabilitySlot[];
  /** Day availability (for calendar view) */
  dayAvailability?: DayAvailability[];
  /** Additional services available */
  additionalServices?: AdditionalService[];
  /** Current step index */
  currentStep?: number;
  /** Callback when step changes */
  onStepChange?: (step: number) => void;
  /** Callback when booking is submitted */
  onSubmit?: (selection: BookingSelection, formData: BookingFormData) => Promise<void>;
  /** Callback when selection changes */
  onSelectionChange?: (selection: BookingSelection) => void;
  /** Custom class name */
  className?: string;
}

const stepIconMap: Record<string, React.FC<{ size?: number }>> = {
  calendar: CalendarStepIcon,
  form: FormStepIcon,
  confirm: ConfirmStepIcon,
  success: SuccessStepIcon,
  payment: PaymentStepIcon,
};

/**
 * UnifiedBookingEngine component
 */
export function UnifiedBookingEngine({
  config,
  rentalObjectName,
  rentalObjectImage,
  availableSlots = [],
  dayAvailability = [],
  additionalServices = [],
  currentStep: controlledStep,
  onStepChange,
  onSubmit,
  onSelectionChange,
  className,
}: UnifiedBookingEngineProps): React.ReactElement {
  // Steps
  const steps = React.useMemo(() => getBookingSteps(config.mode, false), [config.mode]);

  // Internal step state
  const [internalStep, setInternalStep] = React.useState(0);
  const currentStep = controlledStep ?? internalStep;

  // Selection state
  const [selection, setSelection] = React.useState<BookingSelection>({
    slots: [],
  });

  // Calendar state
  const [calendarDate, setCalendarDate] = React.useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Form state
  const [formData, setFormData] = React.useState<Partial<BookingFormData>>({
    numberOfPeople: 1,
    additionalServices: [],
    showPurposeInCalendar: false,
    acceptedTerms: false,
    acceptedCancellationPolicy: false,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Calculate price
  const priceCalculation = React.useMemo((): BookingPriceCalculation => {
    const items: PriceItem[] = [];
    let subtotal = 0;

    // Base price calculation
    if (config.mode === 'slots' && selection.slots.length > 0) {
      const hours = selection.slots.length * (config.slotDurationMinutes || 60) / 60;
      const baseTotal = hours * config.pricing.basePrice;
      items.push({
        id: 'base',
        label: `${hours} ${formatPriceUnit(config.pricing.unit)}${hours !== 1 ? 'r' : ''}`,
        quantity: hours,
        unitPrice: config.pricing.basePrice,
        total: baseTotal,
        type: 'base',
      });
      subtotal += baseTotal;
    } else if (config.mode === 'event' && selection.tickets) {
      const ticketTotal = selection.tickets * config.pricing.basePrice;
      items.push({
        id: 'tickets',
        label: `${selection.tickets} billett${selection.tickets !== 1 ? 'er' : ''}`,
        quantity: selection.tickets,
        unitPrice: config.pricing.basePrice,
        total: ticketTotal,
        type: 'base',
      });
      subtotal += ticketTotal;
    } else if (config.mode === 'dateRange' && selection.dateRange) {
      const days = Math.ceil(
        (selection.dateRange.end.getTime() - selection.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      const rangeTotal = days * config.pricing.basePrice;
      items.push({
        id: 'range',
        label: `${days} ${formatPriceUnit(config.pricing.unit)}${days !== 1 ? 'er' : ''}`,
        quantity: days,
        unitPrice: config.pricing.basePrice,
        total: rangeTotal,
        type: 'base',
      });
      subtotal += rangeTotal;
    }

    // Additional services
    formData.additionalServices?.forEach(serviceId => {
      const service = additionalServices.find(s => s.id === serviceId);
      if (service) {
        items.push({
          id: service.id,
          label: service.name,
          total: service.price,
          type: 'service',
        });
        subtotal += service.price;
      }
    });

    // Fees
    if (config.pricing.setupFee) {
      items.push({
        id: 'setup',
        label: 'Oppstartsavgift',
        total: config.pricing.setupFee,
        type: 'fee',
      });
      subtotal += config.pricing.setupFee;
    }

    if (config.pricing.cleaningFee) {
      items.push({
        id: 'cleaning',
        label: 'Rengjøringsavgift',
        total: config.pricing.cleaningFee,
        type: 'fee',
      });
      subtotal += config.pricing.cleaningFee;
    }

    // VAT
    const vatRate = config.pricing.vatPercentage || 0;
    const vat = subtotal * (vatRate / 100);

    return {
      items,
      subtotal,
      discount: 0,
      vat,
      total: subtotal + vat,
      currency: config.pricing.currency,
    };
  }, [selection, formData.additionalServices, config, additionalServices]);

  // Handle step change
  const handleStepChange = (step: number) => {
    if (onStepChange) {
      onStepChange(step);
    } else {
      setInternalStep(step);
    }
  };

  // Handle slot selection
  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (slot.status !== 'available' && slot.status !== 'selected') return;

    setSelection(prev => {
      const isSelected = prev.slots.some(s => s.id === slot.id);
      const newSlots = isSelected
        ? prev.slots.filter(s => s.id !== slot.id)
        : [...prev.slots, { ...slot, status: 'selected' as const }];

      const newSelection = { ...prev, slots: newSlots };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle week navigation
  const handleWeekChange = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  // Handle month navigation
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  // Handle day selection (for daily mode)
  const handleDaySelect = (date: Date) => {
    setSelection(prev => {
      // Check if date is already selected
      const isSelected = prev.slots.some(
        s => new Date(s.date).toDateString() === date.toDateString()
      );

      let newSlots: AvailabilitySlot[];
      if (isSelected) {
        newSlots = prev.slots.filter(
          s => new Date(s.date).toDateString() !== date.toDateString()
        );
      } else {
        newSlots = [
          ...prev.slots,
          {
            id: `day-${date.toISOString()}`,
            date,
            startTime: '00:00',
            endTime: '23:59',
            status: 'selected',
          },
        ];
      }

      const newSelection = { ...prev, slots: newSlots };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle date range selection
  const handleDateRangeSelect = (start: Date, end: Date | null) => {
    setSelection(prev => {
      const newSelection: BookingSelection = {
        slots: [], // Clear slots for range mode
      };
      if (prev.tickets !== undefined) {
        newSelection.tickets = prev.tickets;
      }
      if (prev.recurring !== undefined) {
        newSelection.recurring = prev.recurring;
      }
      if (end) {
        newSelection.dateRange = { start, end };
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle ticket change (for event mode)
  const handleTicketChange = (tickets: number) => {
    setSelection(prev => {
      const newSelection = { ...prev, tickets };
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle recurring pattern change
  const handleRecurringChange = (pattern: BookingSelection['recurring']) => {
    setSelection(prev => {
      const newSelection: BookingSelection = {
        slots: prev.slots,
      };
      if (prev.dateRange !== undefined) {
        newSelection.dateRange = prev.dateRange;
      }
      if (prev.tickets !== undefined) {
        newSelection.tickets = prev.tickets;
      }
      if (pattern) {
        newSelection.recurring = pattern;
      }
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  };

  // Handle form data change
  const handleFormChange = (field: keyof BookingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get week dates
  const weekDates = React.useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(calendarDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [calendarDate]);

  // Group slots by date
  const slotsByDate = React.useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();
    availableSlots.forEach(slot => {
      const dateKey = new Date(slot.date).toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, slot]);
    });
    return grouped;
  }, [availableSlots]);

  // Format date range
  const formatDateRange = (start: Date): string => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString('nb-NO', { month: 'long' });
    const year = start.getFullYear();
    return `${startDay}. - ${endDay}. ${month} ${year}`;
  };

  // Day names
  const dayNames = ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];

  // Is slot selected
  const isSlotSelected = (slot: AvailabilitySlot) => {
    return selection.slots.some(s => s.id === slot.id);
  };

  // Can continue to next step
  const canContinue = React.useMemo((): boolean => {
    switch (currentStep) {
      case 0: // Selection step
        if (config.mode === 'slots') return selection.slots.length > 0;
        if (config.mode === 'event') return (selection.tickets || 0) > 0;
        if (config.mode === 'dateRange') return !!selection.dateRange;
        if (config.mode === 'recurring') return !!selection.recurring;
        return true;
      case 1: // Form step
        return !!(
          formData.name &&
          formData.email &&
          formData.phone &&
          formData.purpose &&
          formData.acceptedTerms
        );
      default:
        return true;
    }
  }, [currentStep, selection, formData, config.mode]);

  // Handle continue
  const handleContinue = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!onSubmit) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(selection, formData as BookingFormData);
      handleStepChange(steps.length - 1); // Go to success step
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Noe gikk galt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toDateString();

  return (
    <div className={cn('unified-booking-engine', className)}>
      {/* Main Card */}
      <div className="booking-engine-card">
        {/* Header */}
        <div className="booking-engine-header">
          <div className="header-content">
            <div className="header-badge">
              <span className="badge-label">{config.listingType}</span>
            </div>
            <Heading level={2} data-size="lg" style={{ margin: 0 }}>
              {rentalObjectName}
            </Heading>
            <Paragraph data-size="sm" style={{ margin: 0, marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
              {getModeDescription(config.mode)}
            </Paragraph>
          </div>
          <div className="header-price">
            <span className="price-from">fra</span>
            <span className="price-amount">{formatPrice(config.pricing.basePrice, config.pricing.currency)}</span>
            <span className="price-unit">/{formatPriceUnit(config.pricing.unit)}</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="booking-engine-stepper">
          <div className="stepper-track">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isFuture = index > currentStep;
              const StepIcon = stepIconMap[step.icon] || CalendarStepIcon;

              return (
                <React.Fragment key={step.id}>
                  <div
                    className={cn(
                      'stepper-item',
                      isCompleted && 'completed',
                      isActive && 'active',
                      isFuture && 'future'
                    )}
                    onClick={() => isCompleted && handleStepChange(index)}
                    role={isCompleted ? 'button' : undefined}
                    tabIndex={isCompleted ? 0 : undefined}
                  >
                    <div className="stepper-icon">
                      {isCompleted ? <CheckIcon size={18} /> : <StepIcon size={18} />}
                    </div>
                    <span className="stepper-label">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn('stepper-connector', isCompleted && 'completed')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="stepper-progress">
            Steg {currentStep + 1} av {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="booking-engine-content">
          {/* Step 0: Slot-based Selection */}
          {currentStep === 0 && config.mode === 'slots' && (
            <div className="selection-view">
              {/* Calendar Panel */}
              <div className="calendar-panel">
                {/* Calendar Header */}
                <div className="calendar-panel-header">
                  <div className="calendar-title">
                    <CalendarIcon size={20} />
                    <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                      {getModeLabel(config.mode)}
                    </Heading>
                  </div>
                  <div className="calendar-navigation">
                    <button type="button" className="nav-button" onClick={() => handleWeekChange('prev')} aria-label="Forrige uke">
                      <ChevronLeftIcon size={20} />
                    </button>
                    <span className="nav-date">{formatDateRange(calendarDate)}</span>
                    <button type="button" className="nav-button" onClick={() => handleWeekChange('next')} aria-label="Neste uke">
                      <ChevronRightIcon size={20} />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid-wrapper">
                  <div className="calendar-grid">
                    {/* Header Row */}
                    <div className="grid-row header-row">
                      <div className="time-cell">Tid</div>
                      {weekDates.map((date, i) => {
                        const isToday = date.toDateString() === today;
                        return (
                          <div key={i} className={cn('day-cell', isToday && 'today')}>
                            <span className="day-name">{dayNames[i]}</span>
                            <span className="day-number">{date.getDate()}</span>
                            {isToday && <span className="today-indicator">I dag</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Time Rows */}
                    {Array.from({ length: 12 }, (_, i) => {
                      const hour = 8 + i;
                      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                      return (
                        <div key={hour} className="grid-row">
                          <div className="time-cell">{timeStr}</div>
                          {weekDates.map((date, dayIndex) => {
                            const dateKey = date.toDateString();
                            const daySlots = slotsByDate.get(dateKey) || [];
                            const slot = daySlots.find(s => s.startTime === timeStr);

                            if (!slot) {
                              return <div key={dayIndex} className="slot-cell unavailable" />;
                            }

                            const selected = isSlotSelected(slot);
                            const status = selected ? 'selected' : slot.status;

                            return (
                              <div
                                key={dayIndex}
                                className={cn('slot-cell', status)}
                                onClick={() => handleSlotClick(slot)}
                                role={slot.status === 'available' ? 'button' : undefined}
                                tabIndex={slot.status === 'available' ? 0 : undefined}
                              >
                                <span className="slot-time">{timeStr}</span>
                                {selected && <CheckIcon size={12} className="slot-check" />}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-dot available" />
                    <span>Ledig</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot selected" />
                    <span>Valgt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot occupied" />
                    <span>Opptatt</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot blocked" />
                    <span>Utilgjengelig</span>
                  </div>
                </div>
              </div>

              {/* Selection Summary Panel */}
              <div className="summary-panel">
                <div className="summary-header">
                  <ClockIcon size={20} />
                  <Heading level={3} data-size="sm" style={{ margin: 0 }}>
                    Din booking
                  </Heading>
                </div>

                {selection.slots.length === 0 ? (
                  <div className="summary-empty">
                    <div className="empty-illustration">
                      <CalendarIcon size={40} />
                    </div>
                    <Paragraph data-size="sm" style={{ margin: 0, textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                      Velg tidspunkter fra kalenderen for å starte bookingen
                    </Paragraph>
                  </div>
                ) : (
                  <>
                    {/* Selected Slots List */}
                    <div className="selected-slots-list">
                      {selection.slots
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((slot, index) => (
                          <div
                            key={slot.id}
                            className="selected-slot-item"
                            style={{ animationDelay: `${index * 40}ms` }}
                          >
                            <div className="slot-info">
                              <span className="slot-date">
                                {new Date(slot.date).toLocaleDateString('nb-NO', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                              <span className="slot-time-range">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="slot-remove"
                              onClick={() => handleSlotClick(slot)}
                              aria-label="Fjern"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Price Summary */}
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
                          <span className="price-label">MVA ({config.pricing.vatPercentage}%)</span>
                          <span className="price-value">{formatPrice(priceCalculation.vat, priceCalculation.currency)}</span>
                        </div>
                      )}
                      <div className="price-row total">
                        <span className="price-label">Totalt</span>
                        <span className="price-value">{formatPrice(priceCalculation.total, priceCalculation.currency)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="summary-actions">
                      <Button
                        type="button"
                        variant="tertiary"
                        data-size="sm"
                        onClick={() => setSelection({ slots: [] })}
                      >
                        Tøm valg
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        data-color="accent"
                        onClick={handleContinue}
                        disabled={!canContinue}
                      >
                        Fortsett
                        <ChevronRightIcon size={18} />
                      </Button>
                    </div>
                  </>
                )}

                {/* Tips Section */}
                <div className="tips-section">
                  <Heading level={4} data-size="2xs" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                    <InfoIcon size={14} />
                    Tips
                  </Heading>
                  <ul className="tips-list">
                    <li>Klikk på ledige tidspunkter for å velge</li>
                    <li>Du kan velge flere tidspunkter</li>
                    <li>Minimum {config.rules.minLeadTimeHours}t forvarsel</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 0: Daily Mode Selection */}
          {currentStep === 0 && config.mode === 'daily' && (
            <DailyModeView
              calendarDate={calendarDate}
              dayAvailability={dayAvailability}
              selection={selection}
              onDateSelect={handleDaySelect}
              onMonthChange={handleMonthChange}
              formatPrice={formatPrice}
              currency={config.pricing.currency}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Date Range Mode Selection */}
          {currentStep === 0 && config.mode === 'dateRange' && (
            <DateRangeModeView
              calendarDate={calendarDate}
              dayAvailability={dayAvailability}
              selection={selection}
              onRangeSelect={handleDateRangeSelect}
              onMonthChange={handleMonthChange}
              formatPrice={formatPrice}
              currency={config.pricing.currency}
              pricing={config.pricing}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Event Mode Selection */}
          {currentStep === 0 && config.mode === 'event' && (
            <EventModeView
              config={config}
              selection={selection}
              onTicketChange={handleTicketChange}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Recurring Mode Selection */}
          {currentStep === 0 && config.mode === 'recurring' && (
            <RecurringModeView
              config={config}
              selection={selection}
              onRecurringChange={handleRecurringChange}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 0: Instant Mode (skip to form) */}
          {currentStep === 0 && config.mode === 'instant' && (
            <InstantModeView
              config={config}
              formatPrice={formatPrice}
              priceCalculation={priceCalculation}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 1: Booking Form */}
          {currentStep === 1 && (
            <BookingFormStep
              formData={formData}
              config={config}
              additionalServices={additionalServices}
              onFormChange={handleFormChange}
              onBack={handleBack}
              onContinue={handleContinue}
              canContinue={canContinue}
            />
          )}

          {/* Step 2: Confirmation */}
          {currentStep === 2 && (
            <BookingConfirmStep
              selection={selection}
              formData={formData as BookingFormData}
              config={config}
              rentalObjectName={rentalObjectName}
              {...(rentalObjectImage ? { rentalObjectImage } : {})}
              priceCalculation={priceCalculation}
              additionalServices={additionalServices}
              isSubmitting={isSubmitting}
              submitError={submitError}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}

          {/* Success Step */}
          {currentStep === steps.length - 1 && (
            <div className="success-view">
              <div className="success-icon">
                <SuccessStepIcon size={48} />
              </div>
              <Heading level={2} data-size="lg" style={{ margin: 0, textAlign: 'center' }}>
                Booking sendt!
              </Heading>
              <Paragraph data-size="md" style={{ margin: 0, marginTop: 'var(--ds-spacing-2)', textAlign: 'center', color: 'var(--ds-color-neutral-text-subtle)' }}>
                Du vil motta en bekreftelse på e-post.
              </Paragraph>
            </div>
          )}
        </div>
      </div>

      {/* Styles */}
      <style>{unifiedBookingEngineStyles}</style>
    </div>
  );
}
