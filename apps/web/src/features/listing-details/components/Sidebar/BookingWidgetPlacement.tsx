/**
 * BookingWidgetPlacement Component
 *
 * Full-width booking section with time slot calendar.
 * Provides entry point to the booking flow.
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@digdir/designsystemet-react';
import type { BookingConfig } from '../../types';
import { BookingDialog, type BookingFormData, type BookingSlot } from '../BookingDialog';

// =============================================================================
// Icons
// =============================================================================

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

function ChevronLeftIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckCircleIcon({ size = 18 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function DetailsIcon({ size = 20 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

// =============================================================================
// Types
// =============================================================================

type SlotStatus = 'available' | 'occupied' | 'selected' | 'unavailable';

interface TimeSlot {
  time: string;
  status: SlotStatus;
  isPast?: boolean;
}

interface DayColumn {
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  slots: TimeSlot[];
}

// =============================================================================
// Types for Opening Hours
// =============================================================================

export interface OpeningHours {
  open: string; // "10:00"
  close: string; // "21:00"
}

// =============================================================================
// Props
// =============================================================================

export interface BookingWidgetPlacementProps {
  bookingConfig?: BookingConfig;
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
    displayPrice?: string;
  };
  openingHours?: OpeningHours;
  busySlots?: Array<{ date: string; startTime: string; endTime: string }>;
  onBookClick?: () => void;
  className?: string;
}

// =============================================================================
// Booking Steps Configuration
// =============================================================================

const bookingSteps = [
  { id: 'select', label: 'Velg tidspunkt' },
  { id: 'details', label: 'Detaljer og vilkår' },
  { id: 'confirm', label: 'Bekreft' },
  { id: 'done', label: 'Sendt' },
];

// =============================================================================
// Helper Functions
// =============================================================================

function isTimeInPast(date: Date, time: string): boolean {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const slotTime = new Date(date);
  slotTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return slotTime <= now;
}

function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

function generateMockWeekData(
  startDate: Date,
  openingHours: OpeningHours = { open: '08:00', close: '21:00' },
  busySlots: Array<{ date: string; startTime: string; endTime: string }> = []
): DayColumn[] {
  const days: string[] = ['SØN', 'MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR'];

  // Parse opening hours
  const openHour = parseInt(openingHours.open.split(':')[0] ?? '8', 10);
  const closeHour = parseInt(openingHours.close.split(':')[0] ?? '21', 10);

  // Generate 30-minute slots based on opening hours
  const timeSlots: string[] = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dayIndex = date.getDay();
    const isToday = date.toDateString() === today.toDateString();
    const dateKey = date.toISOString().split('T')[0] ?? '';
    const isPastDay = isDateInPast(date);

    return {
      dayName: days[dayIndex] ?? 'UKE',
      dayNumber: date.getDate(),
      isToday,
      slots: timeSlots.map((time) => {
        // Check if slot is in the past
        const isPastTime = isToday && isTimeInPast(date, time);

        // Check if slot is busy
        const isBusy = busySlots.some(slot => {
          if (slot.date !== dateKey) return false;
          return time >= slot.startTime && time < slot.endTime;
        });

        // Determine status
        let status: SlotStatus;
        if (isPastDay || isPastTime) {
          status = 'unavailable';
        } else if (isBusy) {
          status = 'occupied';
        } else {
          // Generate random status for demo (in real app, this comes from API)
          const rand = Math.random();
          if (rand < 0.6) status = 'available';
          else if (rand < 0.85) status = 'occupied';
          else status = 'unavailable';
        }

        return { time, status, isPast: isPastDay || isPastTime };
      }),
    };
  });
}

function formatDateRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];

  return `${startDate.getDate()}. - ${endDate.getDate()}. ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
}

// =============================================================================
// Slot Status Colors
// =============================================================================

const slotColors: Record<SlotStatus, { bg: string; text: string; border: string }> = {
  available: {
    bg: 'var(--ds-color-neutral-background-default)',
    text: 'var(--ds-color-neutral-text-default)',
    border: 'var(--ds-color-neutral-border-default)',
  },
  occupied: {
    bg: 'var(--ds-color-danger-surface-default)',
    text: 'var(--ds-color-danger-text-default)',
    border: 'var(--ds-color-danger-border-subtle)',
  },
  selected: {
    bg: 'var(--ds-color-accent-base-default)',
    text: 'var(--ds-color-accent-contrast-default)',
    border: 'var(--ds-color-accent-base-default)',
  },
  unavailable: {
    bg: 'var(--ds-color-neutral-surface-default)',
    text: 'var(--ds-color-neutral-text-subtle)',
    border: 'var(--ds-color-neutral-border-subtle)',
  },
};

// =============================================================================
// Component
// =============================================================================

export function BookingWidgetPlacement({
  bookingConfig,
  openingHours = { open: '08:00', close: '21:00' },
  busySlots = [],
  onBookClick,
  className,
}: BookingWidgetPlacementProps): React.ReactElement {
  const isBookable = bookingConfig?.enabled !== false && bookingConfig?.mode !== 'NONE';

  // Mobile detection state
  const [isMobile, setIsMobile] = React.useState(false);

  // Current day index for mobile day view (0-6 for Mon-Sun)
  const [mobileDayIndex, setMobileDayIndex] = React.useState(0);

  // Ref for scroll container
  const timeGridRef = React.useRef<HTMLDivElement>(null);
  const mobileTimeGridRef = React.useRef<HTMLDivElement>(null);

  // Week navigation state
  const [weekStart, setWeekStart] = React.useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1);
    return monday;
  });

  // Selected slots state
  const [selectedSlots, setSelectedSlots] = React.useState<Set<string>>(new Set());

  // Booking details per slot (duration, purpose, etc)
  interface SlotBookingDetails {
    duration: number; // minutes
    purpose: string;
    showPurpose: boolean;
    attendees: string;
    activityType: string;
  }
  const [slotDetails, setSlotDetails] = React.useState<Record<string, SlotBookingDetails>>({});

  // Update slot details helper
  const updateSlotDetail = (slotKey: string, field: keyof SlotBookingDetails, value: string | number | boolean) => {
    setSlotDetails(prev => {
      const existing = prev[slotKey] ?? { duration: 60, purpose: '', showPurpose: false, attendees: '', activityType: '' };
      return {
        ...prev,
        [slotKey]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  // Adjust slot time by minutes
  const adjustSlotTime = (slotKey: string, minutesDelta: number) => {
    const parts = slotKey.split('-');
    const dayIdx = parseInt(parts[0] ?? '0', 10);
    const timeStr = parts[1] ?? '08:00';
    const [h, m] = timeStr.split(':').map(Number);
    let totalMins = (h ?? 8) * 60 + (m ?? 0) + minutesDelta;

    // Clamp to opening hours
    const openMins = parseInt(openingHours.open.split(':')[0] ?? '8', 10) * 60;
    const closeMins = (parseInt(openingHours.close.split(':')[0] ?? '21', 10) - 1) * 60 + 30;
    totalMins = Math.max(openMins, Math.min(closeMins, totalMins));

    const newH = Math.floor(totalMins / 60);
    const newM = totalMins % 60;
    const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    const newSlotKey = `${dayIdx}-${newTime}`;

    // Update the slots
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      newSet.delete(slotKey);
      newSet.add(newSlotKey);
      return newSet;
    });

    // Transfer details to new key
    setSlotDetails(prev => {
      const details = prev[slotKey];
      const newDetails = { ...prev };
      delete newDetails[slotKey];
      if (details) {
        newDetails[newSlotKey] = details;
      }
      return newDetails;
    });
  };

  // Booking dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSlotForDialog, setSelectedSlotForDialog] = React.useState<BookingSlot | undefined>(undefined);

  // Calendar expanded state
  const [isCalendarExpanded, setIsCalendarExpanded] = React.useState(false);

  // Selected time and duration for simplified mobile view
  const [selectedTime, setSelectedTime] = React.useState<string>('');
  const [selectedDuration, setSelectedDuration] = React.useState<number>(60); // minutes

  // Check for mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate week data with opening hours support
  const weekData = React.useMemo(() => generateMockWeekData(weekStart, openingHours, busySlots), [weekStart, openingHours, busySlots]);

  // Auto-scroll to first available time slot
  React.useEffect(() => {
    const scrollToFirstAvailable = () => {
      // Find the first available slot across all days
      let firstAvailableIndex = -1;
      for (const day of weekData) {
        const idx = day.slots.findIndex(slot => slot.status === 'available');
        if (idx !== -1 && (firstAvailableIndex === -1 || idx < firstAvailableIndex)) {
          firstAvailableIndex = idx;
        }
      }

      if (firstAvailableIndex > 0 && timeGridRef.current) {
        // Each row is approximately 42px (padding + button)
        const rowHeight = 42;
        const scrollPosition = Math.max(0, (firstAvailableIndex - 1) * rowHeight);
        timeGridRef.current.scrollTop = scrollPosition;
      }

      if (firstAvailableIndex > 0 && mobileTimeGridRef.current) {
        // For mobile, scroll to show the first available slot
        const rowHeight = 48;
        const scrollPosition = Math.max(0, Math.floor(firstAvailableIndex / 4) * rowHeight);
        mobileTimeGridRef.current.scrollTop = scrollPosition;
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToFirstAvailable, 100);
    return () => clearTimeout(timer);
  }, [weekData, isMobile]);

  // Navigate weeks
  const goToPrevWeek = () => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const goToNextWeek = () => {
    setWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  };

  // Navigate days (mobile only)
  const goToPrevDay = () => {
    if (mobileDayIndex > 0) {
      setMobileDayIndex(mobileDayIndex - 1);
    } else {
      // Go to previous week, last day
      goToPrevWeek();
      setMobileDayIndex(6);
    }
  };

  const goToNextDay = () => {
    if (mobileDayIndex < 6) {
      setMobileDayIndex(mobileDayIndex + 1);
    } else {
      // Go to next week, first day
      goToNextWeek();
      setMobileDayIndex(0);
    }
  };

  // Handle slot click
  const handleSlotClick = (dayIndex: number, time: string, status: SlotStatus) => {
    if (status !== 'available') return;

    const slotKey = `${dayIndex}-${time}`;

    // Check if slot is already selected - if so, deselect it
    if (selectedSlots.has(slotKey)) {
      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(slotKey);
        return newSet;
      });
      return;
    }

    // Open the booking dialog for new slot selection
    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    setSelectedSlotForDialog({
      date: slotDate,
      startTime: time,
    });
    setDialogOpen(true);
  };

  // Handle dialog confirm
  const handleDialogConfirm = (data: BookingFormData) => {
    if (selectedSlotForDialog) {
      // Find the day index from the date
      const dayDiff = Math.floor((selectedSlotForDialog.date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      const slotKey = `${dayDiff}-${selectedSlotForDialog.startTime}`;

      setSelectedSlots((prev) => {
        const newSet = new Set(prev);
        newSet.add(slotKey);
        return newSet;
      });

      // Calculate duration from start/end times
      const [startH, startM] = data.startTime.split(':').map(Number);
      const [endH, endM] = data.endTime.split(':').map(Number);
      const durationMins = ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0));

      // Save booking details for this slot
      setSlotDetails(prev => ({
        ...prev,
        [slotKey]: {
          duration: durationMins > 0 ? durationMins : 60,
          purpose: data.purpose,
          showPurpose: data.showPurposeInCalendar,
          attendees: data.attendees,
          activityType: data.activityType,
        },
      }));
    }
    setDialogOpen(false);
    console.log('Booking data:', data);
  };

  // Get current day data for mobile view
  const currentDayData = weekData[mobileDayIndex];

  // Format single day date for mobile
  const formatSingleDate = (dayIndex: number): string => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const months = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
    const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]}`;
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--ds-color-neutral-background-default)',
        borderRadius: 'var(--ds-border-radius-lg)',
        border: '1px solid var(--ds-color-neutral-border-subtle)',
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <div
        className="booking-header-mobile"
        style={{
          backgroundColor: 'var(--ds-color-accent-base-default)',
          padding: 'var(--ds-spacing-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Heading level={2} data-size="md" style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)' }}>
          Book dette lokalet
        </Heading>
        <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-accent-contrast-default)', opacity: 0.9 }}>
          Steg 1 av 4
        </Paragraph>
      </div>

      {/* Stepper Section */}
      <div style={{ padding: 'var(--ds-spacing-4)', borderBottom: '1px solid var(--ds-color-neutral-border-subtle)' }}>
        <div
          className="booking-stepper-mobile"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {bookingSteps.map((step, index) => {
            const isFirst = index === 0;

            return (
              <div
                key={step.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {/* Connecting line */}
                {!isFirst && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'var(--ds-spacing-5)',
                      right: '50%',
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'var(--ds-color-neutral-border-subtle)',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Circle with icon */}
                <div
                  className="booking-step-circle"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isFirst ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-surface-default)',
                    color: isFirst ? 'var(--ds-color-accent-contrast-default)' : 'var(--ds-color-neutral-text-subtle)',
                    border: isFirst ? 'none' : '2px solid var(--ds-color-neutral-border-subtle)',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {step.id === 'select' && <CalendarIcon size={18} />}
                  {step.id === 'details' && <DetailsIcon size={18} />}
                  {step.id === 'confirm' && <CheckCircleIcon size={18} />}
                  {step.id === 'done' && <CheckCircleIcon size={18} />}
                </div>

                {/* Label */}
                <Paragraph
                  className="booking-step-label"
                  data-size="sm"
                  style={{
                    margin: 0,
                    marginTop: 'var(--ds-spacing-2)',
                    color: isFirst ? 'var(--ds-color-neutral-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                    fontWeight: isFirst ? 'var(--ds-font-weight-medium)' : 'var(--ds-font-weight-regular)',
                    textAlign: 'center',
                    maxWidth: '90px',
                    lineHeight: 'var(--ds-line-height-condensed)',
                  }}
                >
                  {step.label}
                </Paragraph>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Header - Today (left) + Date Nav (center) + Legend (right) */}
      <div
        style={{
          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {/* Today button - Left */}
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - dayOfWeek + 1);
            setWeekStart(monday);
            setMobileDayIndex(dayOfWeek === 0 ? 6 : dayOfWeek - 1);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-1)',
            padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
            border: '1px solid var(--ds-color-neutral-border-default)',
            borderRadius: 'var(--ds-border-radius-md)',
            backgroundColor: 'var(--ds-color-neutral-background-default)',
            cursor: 'pointer',
            color: 'var(--ds-color-neutral-text-default)',
            fontSize: 'var(--ds-font-size-sm)',
            fontWeight: 'var(--ds-font-weight-medium)',
          }}
        >
          I dag
        </button>

        {/* Date Navigation - Center */}
        <div
          className="booking-date-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--ds-spacing-2)',
          }}
        >
          <button
            type="button"
            onClick={isMobile ? goToPrevDay : goToPrevWeek}
            aria-label={isMobile ? 'Forrige dag' : 'Forrige uke'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              cursor: 'pointer',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            <ChevronLeftIcon size={16} />
          </button>
          <Paragraph
            data-size="sm"
            style={{
              margin: 0,
              fontWeight: 'var(--ds-font-weight-semibold)',
              minWidth: '160px',
              textAlign: 'center',
            }}
          >
            {isMobile ? formatSingleDate(mobileDayIndex) : formatDateRange(weekStart)}
          </Paragraph>
          <button
            type="button"
            onClick={isMobile ? goToNextDay : goToNextWeek}
            aria-label={isMobile ? 'Neste dag' : 'Neste uke'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: '1px solid var(--ds-color-neutral-border-default)',
              borderRadius: 'var(--ds-border-radius-md)',
              backgroundColor: 'var(--ds-color-neutral-background-default)',
              cursor: 'pointer',
              color: 'var(--ds-color-neutral-text-default)',
            }}
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>

        {/* Legend - Right on desktop, centered on mobile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--ds-spacing-3)',
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <Paragraph data-size="xs" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
            Forklaring
          </Paragraph>
          {[
            { status: 'available' as const, label: 'Ledig' },
            { status: 'occupied' as const, label: 'Opptatt' },
            { status: 'selected' as const, label: 'Valgt' },
            { status: 'unavailable' as const, label: 'Ikke tilgjengelig' },
          ].map(({ status, label }) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-1)' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: slotColors[status].bg,
                  border: `1px solid ${slotColors[status].border}`,
                }}
              />
              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {label}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area - Split Layout on Desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 420px',
          gap: 'var(--ds-spacing-4)',
        }}
      >
        {/* Left Side - Calendar */}
        <div>
          {/* Time Slot Grid */}
          <div style={{ padding: 'var(--ds-spacing-4)', overflowX: isMobile ? 'visible' : 'auto', WebkitOverflowScrolling: 'touch' }}>
            {/* Mobile Single Day View - Simplified Design */}
            {isMobile && currentDayData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)' }}>
            {/* Horizontal Day Selector */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 'var(--ds-spacing-1)',
                padding: 'var(--ds-spacing-2)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              {weekData.map((day, idx) => {
                const isSelectedDay = idx === mobileDayIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMobileDayIndex(idx)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-1)',
                      padding: 'var(--ds-spacing-2)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      border: isSelectedDay ? '2px solid var(--ds-color-accent-base-default)' : '2px solid transparent',
                      backgroundColor: isSelectedDay
                        ? 'var(--ds-color-accent-surface-default)'
                        : day.isToday
                          ? 'var(--ds-color-neutral-surface-hover)'
                          : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--ds-font-size-xs)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                        color: isSelectedDay ? 'var(--ds-color-accent-text-default)' : 'var(--ds-color-neutral-text-subtle)',
                      }}
                    >
                      {day.dayName}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--ds-font-size-md)',
                        fontWeight: 'var(--ds-font-weight-bold)',
                        color: isSelectedDay ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-text-default)',
                      }}
                    >
                      {day.dayNumber}
                    </span>
                    {day.isToday && (
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: 'var(--ds-border-radius-full)',
                          backgroundColor: 'var(--ds-color-accent-base-default)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Time Slots - Simplified Grid */}
            <div
              ref={mobileTimeGridRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 'var(--ds-spacing-2)',
              }}
            >
              {currentDayData.slots
                .filter(slot => slot.status === 'available' || slot.status === 'occupied')
                .slice(0, isCalendarExpanded ? undefined : 12)
                .map((slot, slotIndex) => {
                  const slotKey = `${mobileDayIndex}-${slot.time}`;
                  const isSelected = selectedTime === slot.time && selectedSlots.has(slotKey);
                  const isAvailable = slot.status === 'available';

                  return (
                    <button
                      key={slotIndex}
                      type="button"
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedTime(slot.time);
                          handleSlotClick(mobileDayIndex, slot.time, slot.status);
                        }
                      }}
                      disabled={!isAvailable}
                      style={{
                        padding: 'var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: isSelected
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '1px solid var(--ds-color-neutral-border-subtle)',
                        backgroundColor: isSelected
                          ? 'var(--ds-color-accent-base-default)'
                          : isAvailable
                            ? 'var(--ds-color-neutral-background-default)'
                            : 'var(--ds-color-danger-surface-default)',
                        color: isSelected
                          ? 'var(--ds-color-accent-contrast-default)'
                          : isAvailable
                            ? 'var(--ds-color-neutral-text-default)'
                            : 'var(--ds-color-danger-text-default)',
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                        opacity: isAvailable ? 1 : 0.6,
                        transition: 'all 150ms ease',
                      }}
                    >
                      {slot.time}
                    </button>
                  );
                })}
            </div>

            {/* Show more/less button */}
            {currentDayData.slots.filter(s => s.status === 'available' || s.status === 'occupied').length > 12 && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                  aria-label={isCalendarExpanded ? 'Vis færre tidspunkter' : 'Vis flere tidspunkter'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points={isCalendarExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                  </svg>
                  {isCalendarExpanded ? 'Vis færre' : 'Vis flere'}
                </button>
              </div>
            )}

            {/* Duration Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-3)',
                padding: 'var(--ds-spacing-3)',
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                borderRadius: 'var(--ds-border-radius-lg)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', whiteSpace: 'nowrap' }}>
                Varighet:
              </Paragraph>
              <div style={{ display: 'flex', gap: 'var(--ds-spacing-2)', flexWrap: 'wrap' }}>
                {[
                  { label: '30 min', value: 30 },
                  { label: '1 time', value: 60 },
                  { label: '2 timer', value: 120 },
                  { label: '3 timer', value: 180 },
                ].map(({ label, value }) => {
                  const isSelectedDur = selectedDuration === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedDuration(value)}
                      style={{
                        padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                        borderRadius: 'var(--ds-border-radius-md)',
                        border: isSelectedDur
                          ? '2px solid var(--ds-color-accent-base-default)'
                          : '1px solid var(--ds-color-neutral-border-subtle)',
                        backgroundColor: isSelectedDur
                          ? 'var(--ds-color-accent-surface-default)'
                          : 'var(--ds-color-neutral-background-default)',
                        color: isSelectedDur
                          ? 'var(--ds-color-accent-base-default)'
                          : 'var(--ds-color-neutral-text-default)',
                        fontSize: 'var(--ds-font-size-sm)',
                        fontWeight: isSelectedDur ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Week View */
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '700px' }}>
            {/* Combined grid for header and time slots with column borders */}
            <div
              className="booking-calendar-wrapper"
              style={{
                display: 'grid',
                gridTemplateColumns: '80px repeat(7, 1fr)',
                border: '1px solid var(--ds-color-neutral-border-subtle)',
                borderRadius: 'var(--ds-border-radius-md)',
                overflow: 'hidden',
              }}
            >
              {/* Header row - empty cell for time column */}
              <div
                style={{
                  borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                  borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  backgroundColor: 'var(--ds-color-neutral-surface-default)',
                }}
              />

              {/* Day headers - compact style with column borders */}
              {weekData.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--ds-spacing-2)',
                    backgroundColor: day.isToday ? 'var(--ds-color-neutral-surface-hover)' : 'var(--ds-color-neutral-surface-default)',
                    borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                    borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                  }}
                >
                  <Paragraph
                    data-size="xs"
                    style={{
                      margin: 0,
                      color: 'var(--ds-color-neutral-text-subtle)',
                      fontWeight: 'var(--ds-font-weight-medium)',
                    }}
                  >
                    {day.dayName}
                  </Paragraph>
                  <Paragraph
                    data-size="md"
                    style={{
                      margin: 0,
                      fontWeight: 'var(--ds-font-weight-bold)',
                      color: 'var(--ds-color-neutral-text-default)',
                    }}
                  >
                    {day.dayNumber}
                  </Paragraph>
                </div>
              ))}

              {/* Time grid rows */}
              {(weekData[0]?.slots ?? []).slice(0, isCalendarExpanded ? undefined : 16).map((firstDaySlot, slotIndex) => (
                <React.Fragment key={slotIndex}>
                  {/* Time label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      padding: 'var(--ds-spacing-2) var(--ds-spacing-3)',
                      borderRight: '1px solid var(--ds-color-neutral-border-subtle)',
                    }}
                  >
                    <Paragraph
                      data-size="sm"
                      style={{
                        margin: 0,
                        color: 'var(--ds-color-neutral-text-default)',
                        fontWeight: 'var(--ds-font-weight-medium)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {firstDaySlot.time}
                    </Paragraph>
                  </div>

                  {/* Slots for each day - colored blocks without text */}
                  {weekData.map((day, dayIndex) => {
                    const slot = day.slots[slotIndex];
                    if (!slot) return null;

                    const slotKey = `${dayIndex}-${slot.time}`;
                    const isSelected = selectedSlots.has(slotKey);
                    const effectiveStatus: SlotStatus = isSelected ? 'selected' : slot.status;
                    const colors = slotColors[effectiveStatus];
                    const isClickable = slot.status === 'available';

                    return (
                      <div
                        key={dayIndex}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'var(--ds-spacing-1)',
                          backgroundColor: day.isToday ? 'var(--ds-color-neutral-surface-hover)' : 'transparent',
                          borderRight: dayIndex < 6 ? '1px solid var(--ds-color-neutral-border-subtle)' : 'none',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSlotClick(dayIndex, slot.time, slot.status)}
                          disabled={!isClickable}
                          aria-label={`${slot.time} - ${effectiveStatus}`}
                          style={{
                            width: '100%',
                            height: '32px',
                            borderRadius: 'var(--ds-border-radius-sm)',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.bg,
                            color: colors.text,
                            cursor: isClickable ? 'pointer' : 'default',
                            opacity: effectiveStatus === 'unavailable' ? 0.5 : 1,
                            transition: 'all 0.15s ease',
                            fontSize: 'var(--ds-font-size-xs)',
                            fontWeight: 'var(--ds-font-weight-medium)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {slot.time}
                        </button>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* Show more button */}
            {!isCalendarExpanded && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: 'var(--ds-spacing-3)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCalendarExpanded(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Vis flere
                </button>
              </div>
            )}

            {/* Show less button when expanded */}
            {isCalendarExpanded && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  paddingTop: 'var(--ds-spacing-3)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCalendarExpanded(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-2)',
                    padding: 'var(--ds-spacing-2) var(--ds-spacing-4)',
                    backgroundColor: 'var(--ds-color-neutral-surface-default)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    color: 'var(--ds-color-neutral-text-default)',
                    fontSize: 'var(--ds-font-size-sm)',
                    fontWeight: 'var(--ds-font-weight-medium)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Vis færre
                </button>
              </div>
            )}
          </div>
        )}
          </div>
        </div>

        {/* Right Side - Selected Slots Panel (Desktop Only) */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-4)',
              padding: 'var(--ds-spacing-4)',
              borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
            }}
          >
            {/* Selected Slots Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--ds-spacing-2)',
                paddingBottom: 'var(--ds-spacing-3)',
                borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
              }}
            >
              <CalendarIcon size={20} />
              <Heading level={4} data-size="xs" style={{ margin: 0 }}>
                Valgte tidspunkter
              </Heading>
            </div>

            {/* Selected Slots List or Empty State */}
            {selectedSlots.size > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-4)', flex: 1, overflow: 'auto' }}>
                {Array.from(selectedSlots).map((slotKey, index) => {
                  const parts = slotKey.split('-');
                  const dayIdxStr = parts[0] ?? '0';
                  const timeStr = parts[1] ?? '';
                  const dayIdx = parseInt(dayIdxStr, 10);
                  const day = weekData[dayIdx];
                  const details = slotDetails[slotKey] ?? { duration: 60, purpose: '', showPurpose: false, attendees: '', activityType: '' };

                  // Calculate end time based on duration
                  const [startH, startM] = timeStr.split(':').map(Number);
                  const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
                  const endH = Math.floor(endMins / 60);
                  const endM = endMins % 60;
                  const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

                  // Get full date for display
                  const slotDate = new Date(weekStart);
                  slotDate.setDate(weekStart.getDate() + dayIdx);
                  const monthNames = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
                  const dayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

                  return (
                    <div
                      key={slotKey}
                      style={{
                        backgroundColor: 'var(--ds-color-neutral-background-default)',
                        borderRadius: 'var(--ds-border-radius-xl)',
                        border: '2px solid var(--ds-color-accent-border-subtle)',
                        overflow: 'hidden',
                        boxShadow: 'var(--ds-shadow-sm)',
                      }}
                    >
                      {/* Card Header */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, var(--ds-color-accent-base-default) 0%, var(--ds-color-accent-base-hover) 100%)',
                          padding: 'var(--ds-spacing-4)',
                          color: 'var(--ds-color-accent-contrast-default)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <Paragraph data-size="xs" style={{ margin: 0, opacity: 0.8, marginBottom: 'var(--ds-spacing-1)' }}>
                              Booking #{index + 1}
                            </Paragraph>
                            <Heading level={3} data-size="md" style={{ margin: 0 }}>
                              {dayNames[slotDate.getDay()]}
                            </Heading>
                            <Paragraph data-size="sm" style={{ margin: 0, opacity: 0.9, marginTop: 'var(--ds-spacing-1)' }}>
                              {slotDate.getDate()}. {monthNames[slotDate.getMonth()]} {slotDate.getFullYear()}
                            </Paragraph>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlots(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(slotKey);
                                return newSet;
                              });
                              setSlotDetails(prev => {
                                const newDetails = { ...prev };
                                delete newDetails[slotKey];
                                return newDetails;
                              });
                            }}
                            aria-label="Fjern booking"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              border: 'none',
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              color: 'var(--ds-color-accent-contrast-default)',
                              borderRadius: 'var(--ds-border-radius-full)',
                              transition: 'all 150ms ease',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: 'var(--ds-spacing-4)' }}>
                        {/* Time Display with Large Numbers */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--ds-spacing-3)',
                            padding: 'var(--ds-spacing-4)',
                            backgroundColor: 'var(--ds-color-neutral-surface-default)',
                            borderRadius: 'var(--ds-border-radius-lg)',
                            marginBottom: 'var(--ds-spacing-4)',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => adjustSlotTime(slotKey, -30)}
                            aria-label="30 minutter tidligere"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--ds-border-radius-full)',
                              border: '2px solid var(--ds-color-neutral-border-default)',
                              backgroundColor: 'var(--ds-color-neutral-background-default)',
                              cursor: 'pointer',
                              fontSize: 'var(--ds-font-size-xl)',
                              fontWeight: 'var(--ds-font-weight-bold)',
                              color: 'var(--ds-color-neutral-text-default)',
                              transition: 'all 150ms ease',
                            }}
                          >
                            −
                          </button>
                          <div style={{ textAlign: 'center', minWidth: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'var(--ds-spacing-2)' }}>
                              <Heading level={2} data-size="xl" style={{ margin: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ds-color-accent-base-default)' }}>
                                {timeStr}
                              </Heading>
                              <span style={{ fontSize: 'var(--ds-font-size-lg)', color: 'var(--ds-color-neutral-text-subtle)' }}>–</span>
                              <Heading level={2} data-size="xl" style={{ margin: 0, fontVariantNumeric: 'tabular-nums', color: 'var(--ds-color-accent-base-default)' }}>
                                {endTime}
                              </Heading>
                            </div>
                            <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', marginTop: 'var(--ds-spacing-1)' }}>
                              {details.duration} minutter
                            </Paragraph>
                          </div>
                          <button
                            type="button"
                            onClick={() => adjustSlotTime(slotKey, 30)}
                            aria-label="30 minutter senere"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--ds-border-radius-full)',
                              border: '2px solid var(--ds-color-neutral-border-default)',
                              backgroundColor: 'var(--ds-color-neutral-background-default)',
                              cursor: 'pointer',
                              fontSize: 'var(--ds-font-size-xl)',
                              fontWeight: 'var(--ds-font-weight-bold)',
                              color: 'var(--ds-color-neutral-text-default)',
                              transition: 'all 150ms ease',
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Duration Selector */}
                        <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
                            Varighet
                          </Paragraph>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--ds-spacing-2)' }}>
                            {[
                              { label: '30 min', value: 30 },
                              { label: '1 time', value: 60 },
                              { label: '2 timer', value: 120 },
                              { label: '3 timer', value: 180 },
                            ].map(({ label, value }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => updateSlotDetail(slotKey, 'duration', value)}
                                style={{
                                  padding: 'var(--ds-spacing-2) var(--ds-spacing-1)',
                                  borderRadius: 'var(--ds-border-radius-md)',
                                  border: details.duration === value
                                    ? '2px solid var(--ds-color-accent-base-default)'
                                    : '1px solid var(--ds-color-neutral-border-subtle)',
                                  backgroundColor: details.duration === value
                                    ? 'var(--ds-color-accent-surface-default)'
                                    : 'var(--ds-color-neutral-background-default)',
                                  color: details.duration === value
                                    ? 'var(--ds-color-accent-base-default)'
                                    : 'var(--ds-color-neutral-text-default)',
                                  fontSize: 'var(--ds-font-size-sm)',
                                  fontWeight: details.duration === value ? 'var(--ds-font-weight-semibold)' : 'var(--ds-font-weight-medium)',
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease',
                                }}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-3)' }}>
                          {/* Purpose Field */}
                          <div>
                            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
                              Formål
                            </Paragraph>
                            <input
                              type="text"
                              value={details.purpose}
                              onChange={(e) => updateSlotDetail(slotKey, 'purpose', e.target.value)}
                              placeholder="f.eks. Trening, Møte, Kurs..."
                              style={{
                                width: '100%',
                                padding: 'var(--ds-spacing-3)',
                                borderRadius: 'var(--ds-border-radius-md)',
                                border: '1px solid var(--ds-color-neutral-border-default)',
                                backgroundColor: 'var(--ds-color-neutral-background-default)',
                                fontSize: 'var(--ds-font-size-sm)',
                                color: 'var(--ds-color-neutral-text-default)',
                                outline: 'none',
                                transition: 'border-color 150ms ease',
                              }}
                            />
                            {/* Show in calendar toggle */}
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--ds-spacing-2)',
                                marginTop: 'var(--ds-spacing-2)',
                                cursor: 'pointer',
                              }}
                            >
                              <div
                                onClick={() => updateSlotDetail(slotKey, 'showPurpose', !details.showPurpose)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: 'var(--ds-border-radius-sm)',
                                  border: `2px solid ${details.showPurpose ? 'var(--ds-color-accent-base-default)' : 'var(--ds-color-neutral-border-default)'}`,
                                  backgroundColor: details.showPurpose ? 'var(--ds-color-accent-base-default)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease',
                                  color: 'var(--ds-color-accent-contrast-default)',
                                }}
                              >
                                {details.showPurpose && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              <Paragraph data-size="xs" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                                Vis formål i kalender
                              </Paragraph>
                            </label>
                          </div>

                          {/* Activity Type & Attendees Row */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ds-spacing-3)' }}>
                            <div>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
                                Aktivitet
                              </Paragraph>
                              <select
                                value={details.activityType}
                                onChange={(e) => updateSlotDetail(slotKey, 'activityType', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: 'var(--ds-spacing-3)',
                                  borderRadius: 'var(--ds-border-radius-md)',
                                  border: '1px solid var(--ds-color-neutral-border-default)',
                                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                                  fontSize: 'var(--ds-font-size-sm)',
                                  color: 'var(--ds-color-neutral-text-default)',
                                  outline: 'none',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="">Velg type...</option>
                                <option value="Trening">Trening</option>
                                <option value="Møte">Møte</option>
                                <option value="Kurs">Kurs</option>
                                <option value="Arrangement">Arrangement</option>
                                <option value="Annet">Annet</option>
                              </select>
                            </div>
                            <div>
                              <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-2)' }}>
                                Antall personer
                              </Paragraph>
                              <input
                                type="number"
                                value={details.attendees}
                                onChange={(e) => updateSlotDetail(slotKey, 'attendees', e.target.value)}
                                placeholder="0"
                                min="1"
                                style={{
                                  width: '100%',
                                  padding: 'var(--ds-spacing-3)',
                                  borderRadius: 'var(--ds-border-radius-md)',
                                  border: '1px solid var(--ds-color-neutral-border-default)',
                                  backgroundColor: 'var(--ds-color-neutral-background-default)',
                                  fontSize: 'var(--ds-font-size-sm)',
                                  color: 'var(--ds-color-neutral-text-default)',
                                  outline: 'none',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--ds-spacing-8)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--ds-border-radius-full)',
                    backgroundColor: 'var(--ds-color-accent-surface-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--ds-spacing-4)',
                  }}
                >
                  <CalendarIcon size={36} />
                </div>
                <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                  Ingen bookinger ennå
                </Heading>
                <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)', maxWidth: '280px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Velg et ledig tidspunkt i kalenderen til venstre for å starte bookingen.
                </Paragraph>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Selected Slots Drawer */}
      {isMobile && selectedSlots.size > 0 && (
        <div
          style={{
            padding: 'var(--ds-spacing-4)',
            backgroundColor: 'var(--ds-color-accent-surface-default)',
            borderTop: '1px solid var(--ds-color-accent-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
            <CalendarIcon size={18} />
            <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-semibold)' }}>
              Valgte tidspunkter ({selectedSlots.size})
            </Paragraph>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
            {Array.from(selectedSlots).map((slotKey) => {
              const parts = slotKey.split('-');
              const dayIdxStr = parts[0] ?? '0';
              const timeStr = parts[1] ?? '';
              const dayIdx = parseInt(dayIdxStr, 10);
              const day = weekData[dayIdx];
              return (
                <div
                  key={slotKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-1)',
                    padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                    backgroundColor: 'var(--ds-color-neutral-background-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                    border: '1px solid var(--ds-color-neutral-border-default)',
                  }}
                >
                  <Paragraph data-size="xs" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                    {day?.dayName} {timeStr}
                  </Paragraph>
                  <button
                    type="button"
                    onClick={() => handleSlotClick(dayIdx, timeStr, 'available')}
                    aria-label="Fjern"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '16px',
                      height: '16px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--ds-color-neutral-text-subtle)',
                      fontSize: 'var(--ds-font-size-xs)',
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
        }}
      >
        <Button
          type="button"
          variant="primary"
          data-size="lg"
          data-color="accent"
          onClick={onBookClick}
          disabled={!isBookable || selectedSlots.size === 0}
          aria-label={isBookable ? 'Fortsett til neste steg' : 'Lokalet er ikke tilgjengelig for booking'}
          style={{
            width: '100%',
            padding: 'var(--ds-spacing-4)',
            fontSize: 'var(--ds-font-size-md)',
            fontWeight: 'var(--ds-font-weight-semibold)',
          }}
        >
          {selectedSlots.size > 0
            ? `Fortsett med ${selectedSlots.size} valgte tidspunkt${selectedSlots.size > 1 ? 'er' : ''}`
            : 'Velg tidspunkt for å fortsette'}
        </Button>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        slot={selectedSlotForDialog}
        openingHours={openingHours}
        busySlots={busySlots}
      />

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .booking-calendar-grid {
            min-width: 100% !important;
          }
          .booking-calendar-grid > div {
            font-size: var(--ds-font-size-xs) !important;
          }
          .booking-calendar-grid button {
            padding: var(--ds-spacing-1) !important;
            font-size: 10px !important;
          }
        }

        @media (max-width: 599px) {
          .booking-stepper-mobile {
            gap: var(--ds-spacing-1) !important;
          }
          .booking-stepper-mobile > div {
            min-width: 0 !important;
          }
          .booking-step-circle {
            width: 32px !important;
            height: 32px !important;
          }
          .booking-step-label {
            font-size: 10px !important;
            max-width: 60px !important;
          }
          .booking-header-mobile {
            flex-direction: column !important;
            gap: var(--ds-spacing-2) !important;
            align-items: flex-start !important;
          }
          .booking-date-nav {
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          .booking-date-nav > p {
            min-width: auto !important;
            font-size: var(--ds-font-size-xs) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default BookingWidgetPlacement;
