/**
 * BookingWidgetPlacement Component
 *
 * Full-width booking section with time slot calendar.
 * Provides entry point to the booking flow.
 */

import * as React from 'react';
import { Heading, Paragraph, Button } from '@xalatechnologies/platform/ui';
import { bookingService, auditService, authService, type CreateBookingDTO, useOrganizations } from '@digilist/client-sdk';
import type { BookingConfig } from '../../types';
import { BookingDialog, type BookingFormData, type BookingSlot } from '../BookingDialog';
import { CalendarSection } from '../CalendarSection';
import { useAuth } from '@xala/auth';
import { useT } from '@xala/i18n';
import type { CalendarSelection, CalendarCell } from '@xalatechnologies/platform/ui';

import { BookingStepperHeader, type BookingStep } from './components/BookingStepperHeader';
import { BookingCartSidebar, type SlotDetail } from './components/BookingCartSidebar';
import { BookingPricingStep, type PriceGroup, type AdditionalService } from './components/BookingPricingStep';
import { BookingConfirmationStep } from './components/BookingConfirmationStep';
import type { BookingVisibility } from './components/BookingVisibilitySelector';
import { BookingAvailabilityConflictDialog, type SlotAvailability } from './components/BookingAvailabilityConflictDialog';
import { BookingModeSelector } from './components/BookingModeSelector';
import { RecurringBuilder, type RecurringPattern } from './components/RecurringBuilder';
import { RecurringPreview } from './components/RecurringPreview';
import { ConflictResolver, type ConflictResolution, type AlternativeSlot } from './components/ConflictResolver';
import type { RecurringConstraintsDTO, RecurringOccurrenceDTO, RecurringSummary } from '@digilist/client-sdk';

// =============================================================================
// Local Types - Extended BookingMode for this component
// =============================================================================

/**
 * Extended BookingMode for this component.
 * The SDK has a narrower type, but this component supports more modes.
 */
type BookingMode = 'SINGLE_SLOT' | 'RECURRING' | 'IN_GAME' | 'ACTIVITY_REGISTRATION' | 'RANGE' | 'ALL_DAY' | 'SEASON_RENTAL';

// =============================================================================
// Icons
// =============================================================================

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

export interface OpeningHours {
  open: string;
  close: string;
}

// =============================================================================
// Props
// =============================================================================

export interface BookingWidgetPlacementProps {
  rentalObjectId?: string;
  bookingConfig?: BookingConfig;
  pricing?: {
    basePrice?: number;
    currency?: string;
    unit?: string;
  };
  className?: string;
  listingTitle?: string;
  openingHours?: Record<number, OpeningHours>;
  busySlots?: Array<{ date: string; startTime: string; endTime: string }>;
  /** Available booking modes for this rental object */
  availableBookingModes?: BookingMode[];
  /** Recurring booking constraints */
  recurringConstraints?: RecurringConstraintsDTO;
}

// =============================================================================
// Constants
// =============================================================================

// Booking steps - 5 step flow:
// 1. calendar - Select time
// 2. details - Pricing and terms
// 3. login - Login (if not authenticated)
// 4. confirm - Confirm booking details
// 5. done - Success
const BOOKING_STEP_IDS = ['calendar', 'details', 'login', 'confirm', 'done'] as const;
type BookingStepIcon = 'calendar' | 'confirm' | 'pricing' | 'success' | undefined;
const BOOKING_STEP_ICONS: Record<string, BookingStepIcon> = {
  calendar: 'calendar',
  details: 'pricing',
  login: undefined,
  confirm: 'confirm',
  done: 'success',
};

// Price groups and services are computed in the component using t()
const PRICE_GROUP_CONFIGS = [
  { id: 'standard', pricePerHour: 500 },
  { id: 'member', pricePerHour: 350 },
  { id: 'youth', pricePerHour: 250 },
] as const;

const SERVICE_CONFIGS = [
  { id: 'cleaning', price: 500 },
  { id: 'equipment', price: 300 },
] as const;

// Flag to enable demo/auto-login for testing
// Set to false when proper OAuth is implemented
const DEMO_MODE_ENABLED = true;

const DEFAULT_OPENING_HOURS: Record<number, OpeningHours> = {
  0: { open: '10:00', close: '18:00' },
  1: { open: '08:00', close: '21:00' },
  2: { open: '08:00', close: '21:00' },
  3: { open: '08:00', close: '21:00' },
  4: { open: '08:00', close: '21:00' },
  5: { open: '08:00', close: '21:00' },
  6: { open: '10:00', close: '18:00' },
};

// =============================================================================
// Booking Mode to Calendar Mode Mapping
// =============================================================================

/**
 * Maps booking mode to calendar display mode
 */
function getCalendarModeForBookingMode(bookingMode: BookingMode): 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY' {
  switch (bookingMode) {
    case 'SINGLE_SLOT':
    case 'RECURRING':
    case 'IN_GAME':
    case 'ACTIVITY_REGISTRATION':
      return 'TIME_SLOTS';
    case 'RANGE':
      return 'MULTI_DAY';
    case 'ALL_DAY':
      return 'ALL_DAY';
    case 'SEASON_RENTAL':
      return 'ALL_DAY'; // Season rentals use day-based selection
    default:
      return 'TIME_SLOTS';
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function generateTimeSlots(
  openingHours: Record<number, OpeningHours>,
  busySlots: Array<{ date: string; startTime: string; endTime: string }>,
  weekStart: Date,
  selectedSlots: Set<string>
): DayColumn[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  const dayNames = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];

  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    const dayOfWeek = date.getDay();
    const hours = openingHours[dayOfWeek] || { open: '08:00', close: '18:00' };

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const startMins = (openH ?? 8) * 60 + (openM ?? 0);
    const endMins = (closeH ?? 18) * 60 + (closeM ?? 0);

    const dateStr = date.toISOString().split('T')[0];
    const dayBusySlots = busySlots.filter(s => s.date === dateStr);

    const slots: TimeSlot[] = [];
    for (let mins = startMins; mins < endMins; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const slotKey = `${dayIndex}-${timeStr}`;

      const isPast = date < today || (date.toDateString() === now.toDateString() && mins <= now.getHours() * 60 + now.getMinutes());
      const isOccupied = dayBusySlots.some(busy => {
        const [bsH, bsM] = busy.startTime.split(':').map(Number);
        const [beH, beM] = busy.endTime.split(':').map(Number);
        const busyStart = (bsH ?? 0) * 60 + (bsM ?? 0);
        const busyEnd = (beH ?? 0) * 60 + (beM ?? 0);
        return mins >= busyStart && mins < busyEnd;
      });

      let status: SlotStatus = 'available';
      if (isPast) status = 'unavailable';
      else if (isOccupied) status = 'occupied';
      else if (selectedSlots.has(slotKey)) status = 'selected';

      slots.push({ time: timeStr, status, isPast });
    }

    return {
      dayName: dayNames[dayOfWeek] ?? '',
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      slots,
    };
  });
}

// =============================================================================
// Component
// =============================================================================

export function BookingWidgetPlacement({
  rentalObjectId,
  bookingConfig,
  pricing: _pricing,
  className,
  listingTitle,
  openingHours = DEFAULT_OPENING_HOURS,
  busySlots = [],
  availableBookingModes = ['SINGLE_SLOT'],
  recurringConstraints,
}: BookingWidgetPlacementProps): React.ReactElement {
  const t = useT();

  // Create booking steps with translated labels
  const bookingSteps: BookingStep[] = React.useMemo(() => BOOKING_STEP_IDS.map(id => ({
    id,
    label: t(`bookingWidget.steps.${id}`),
    icon: BOOKING_STEP_ICONS[id] ?? 'calendar',
  })), [t]);

  // Create price groups with translated labels
  const priceGroups: PriceGroup[] = React.useMemo(() => PRICE_GROUP_CONFIGS.map(config => ({
    id: config.id,
    label: t(`bookingWidget.priceGroup.${config.id}`),
    pricePerHour: config.pricePerHour,
    description: t(`bookingWidget.priceGroup.${config.id}Desc`),
  })), [t]);

  // Create additional services with translated labels
  const additionalServices: AdditionalService[] = React.useMemo(() => SERVICE_CONFIGS.map(config => ({
    id: config.id,
    label: t(`bookingWidget.service.${config.id}`),
    description: t(`bookingWidget.service.${config.id}Desc`),
    price: config.price,
  })), [t]);
  const [isMobile, setIsMobile] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [weekStart, setWeekStart] = React.useState(() => getStartOfWeek(new Date()));
  const [selectedSlots, setSelectedSlots] = React.useState<Set<string>>(new Set());
  const [slotDetails, setSlotDetails] = React.useState<Record<string, SlotDetail>>({});
  const [selectedPriceGroup, setSelectedPriceGroup] = React.useState('standard'); // Default to standard price
  const [selectedServices, setSelectedServices] = React.useState<Set<string>>(new Set());
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [bookingAccountType, setBookingAccountType] = React.useState<'private' | 'organization' | undefined>('private'); // Default to private
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | undefined>(undefined);
  const [isAccountTypeConfirmed, setIsAccountTypeConfirmed] = React.useState(false);
  const [visibility, setVisibility] = React.useState<BookingVisibility>('PUBLIC_TITLE');

  // Use real authentication state - MUST be before any useEffect that uses isAuthenticated
  const { isAuthenticated: authIsAuthenticated, user, login: authLogin, handleAuthCallback, logout: authLogout } = useAuth();
  const isAuthenticated = authIsAuthenticated;

  // Storage key for persisting booking state across login
  const BOOKING_STATE_KEY = `booking_state_${rentalObjectId || 'default'}`;

  // Restore booking state on mount (after login redirect)
  React.useEffect(() => {
    try {
      const savedState = sessionStorage.getItem(BOOKING_STATE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.selectedSlots) setSelectedSlots(new Set(state.selectedSlots));
        if (state.slotDetails) setSlotDetails(state.slotDetails);
        if (state.selectedPriceGroup) setSelectedPriceGroup(state.selectedPriceGroup);
        if (state.selectedServices) setSelectedServices(new Set(state.selectedServices));
        if (state.weekStart) setWeekStart(new Date(state.weekStart));
        if (state.visibility) setVisibility(state.visibility);
        
        // Restore step - but advance to step 3 if we were on login step and now authenticated
        if (state.currentStep !== undefined) {
          if (state.currentStep === 2 && isAuthenticated) {
            // User just logged in, advance to confirm step
            setCurrentStep(3);
          } else {
            setCurrentStep(state.currentStep);
          }
        }
        
        // Clear saved state after restoring
        sessionStorage.removeItem(BOOKING_STATE_KEY);
      }
    } catch (error) {
      console.warn('[BookingWidget] Failed to restore booking state:', error);
    }
  }, [BOOKING_STATE_KEY, isAuthenticated]);

  // Function to save booking state before login redirect
  const saveBookingState = React.useCallback(() => {
    try {
      const state = {
        selectedSlots: Array.from(selectedSlots),
        slotDetails,
        selectedPriceGroup,
        selectedServices: Array.from(selectedServices),
        weekStart: weekStart.toISOString(),
        currentStep,
        visibility,
      };
      sessionStorage.setItem(BOOKING_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('[BookingWidget] Failed to save booking state:', error);
    }
  }, [BOOKING_STATE_KEY, selectedSlots, slotDetails, selectedPriceGroup, selectedServices, weekStart, currentStep, visibility]);

  // Booking mode state
  const [bookingMode, setBookingMode] = React.useState<BookingMode>(availableBookingModes[0] ?? 'SINGLE_SLOT');
  
  // Calendar selection state (for CalendarSection component)
  const [calendarSelection, setCalendarSelection] = React.useState<CalendarSelection | undefined>(undefined);
  
  // Range selection state (for RANGE mode)
  const [rangeSelection, setRangeSelection] = React.useState<{
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  } | null>(null);
  
  // All-day selection state (for ALL_DAY mode)
  const [allDaySelection, setAllDaySelection] = React.useState<string[]>([]); // Array of ISO date strings

  // Recurring booking state
  const [recurringPattern, setRecurringPattern] = React.useState<RecurringPattern>({
    frequency: 'WEEKLY',
    interval: 1,
    weekdays: [],
    endCondition: { type: 'AFTER_OCCURRENCES', occurrences: 10 },
  });
  const [recurringBaseSlot, setRecurringBaseSlot] = React.useState<{ startTime: string; endTime: string; date: string } | null>(null);
  const [recurringOccurrences, setRecurringOccurrences] = React.useState<RecurringOccurrenceDTO[]>([]);
  const [recurringSummary, setRecurringSummary] = React.useState<RecurringSummary | undefined>(undefined);
  const [isLoadingRecurringPreview, setIsLoadingRecurringPreview] = React.useState(false);
  const [recurringPreviewError, setRecurringPreviewError] = React.useState<string | undefined>(undefined);
  const [selectedRecurringIndices, setSelectedRecurringIndices] = React.useState<Set<number>>(new Set());
  const [conflictResolutions, setConflictResolutions] = React.useState<ConflictResolution[]>([]);
  const [conflictAlternatives, setConflictAlternatives] = React.useState<Map<number, AlternativeSlot[]>>(new Map());
  
  // isAuthenticated, user, authLogin, loginWithFlowContext defined earlier (before useEffects)
  
  // Fetch user's organizations when authenticated
  // The API should return only organizations the user is a member of
  const { data: organizationsData } = useOrganizations(
    isAuthenticated ? {} : undefined
  );
  
  // Demo organizations for testing (shown when DEMO_MODE_ENABLED and user email suggests org access)
  const DEMO_ORGANIZATIONS = [
    { id: 'demo-org-1', name: 'Skien Idrettslag' },
    { id: 'demo-org-2', name: 'Porsgrunn Fotballklubb' },
    { id: 'demo-org-3', name: 'Telemark Svømmeklubb' },
  ];
  
  const organizations = React.useMemo(() => {
    // First try to get from API
    if (organizationsData?.data && organizationsData.data.length > 0) {
    return organizationsData.data.map(org => ({ id: org.id, name: org.name }));
    }
    
    // In demo mode, check if user should have organization access
    if (DEMO_MODE_ENABLED && user) {
      // Check localStorage for demo user info
      const savedUser = localStorage.getItem('web_user');
      if (savedUser) {
        try {
          const demoUser = JSON.parse(savedUser);
          // If email contains 'org', 'kommune', 'ansatt', or 'bedrift' - show demo orgs
          if (demoUser.email && (
            demoUser.email.includes('org') ||
            demoUser.email.includes('kommune') ||
            demoUser.email.includes('ansatt') ||
            demoUser.email.includes('bedrift') ||
            demoUser.id?.includes('bankid')
          )) {
            return DEMO_ORGANIZATIONS;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    
    return [];
  }, [organizationsData, user]);
  
  // Reset account selection when authentication changes
  React.useEffect(() => {
    if (!isAuthenticated) {
      setBookingAccountType(undefined);
      setSelectedOrganizationId(undefined);
      setIsAccountTypeConfirmed(false);
    }
  }, [isAuthenticated]);
  
  // Auto-skip login step (step 2) if already authenticated
  React.useEffect(() => {
    if (currentStep === 2 && isAuthenticated) {
      setCurrentStep(3); // Go directly to confirmation
    }
  }, [currentStep, isAuthenticated]);
  
  const handleAccountTypeSelect = (type: 'private' | 'organization' | undefined, organizationId?: string): void => {
    if (type === undefined) {
      // Reset selection
      setBookingAccountType(undefined);
      setSelectedOrganizationId(undefined);
      setIsAccountTypeConfirmed(false);
    } else {
      setBookingAccountType(type);
      setSelectedOrganizationId(organizationId);
      setIsAccountTypeConfirmed(false);
      // User clicks "Fortsett" button to advance - no auto-advance
    }
  };

  const handleConfirmAccountType = (): void => {
    setIsAccountTypeConfirmed(true);
  };
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = React.useState(false);
  const [slotAvailabilities, setSlotAvailabilities] = React.useState<SlotAvailability[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedSlotForDialog, setSelectedSlotForDialog] = React.useState<BookingSlot | undefined>(undefined);
  const [isCalendarExpanded, setIsCalendarExpanded] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());

  // Create a stable key for busySlots to prevent infinite re-renders
  // when the prop is a new array reference with the same content
  const busySlotsKey = React.useMemo(() => JSON.stringify(busySlots), [busySlots]);

  // Update lastUpdated when busySlots content actually changes (real-time updates)
  React.useEffect(() => {
    setLastUpdated(new Date());
  }, [busySlotsKey]);

  // Update lastUpdated when week changes
  React.useEffect(() => {
    setLastUpdated(new Date());
  }, [weekStart]);

  React.useEffect(() => {
    const checkMobile = (): void => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isBookable = bookingConfig?.enabled !== false;

  const calendarData = React.useMemo(
    () => generateTimeSlots(openingHours, busySlots, weekStart, selectedSlots),
    [openingHours, busySlots, weekStart, selectedSlots]
  );

  const handleSlotClick = (dayIndex: number, time: string): void => {
    const slot = calendarData[dayIndex]?.slots.find(s => s.time === time);
    if (!slot || slot.status === 'unavailable' || slot.status === 'occupied') return;

    const slotDate = new Date(weekStart);
    slotDate.setDate(weekStart.getDate() + dayIndex);

    setSelectedSlotForDialog({
      date: slotDate,
      startTime: time,
      endTime: '',
    });
    setDialogOpen(true);
  };

  // Handle calendar selection from CalendarSection component
  const handleCalendarSelection = React.useCallback((selection: CalendarSelection) => {
    setCalendarSelection(selection);
    
    if (bookingMode === 'SINGLE_SLOT') {
      // For single slot mode, open drawer when a slot is selected
      if (selection.cells.length > 0) {
        const firstCell = selection.cells[0];
        if (firstCell) {
          const startDate = new Date(firstCell.start);
          const startTime = startDate.toTimeString().slice(0, 5); // HH:mm
          const endDate = new Date(firstCell.end);
          const endTime = endDate.toTimeString().slice(0, 5); // HH:mm
          
          setSelectedSlotForDialog({
            date: startDate,
            startTime,
            endTime,
          });
          setDialogOpen(true);
        }
      }
    } else if (bookingMode === 'RANGE' && selection.range) {
      // For range mode, store the range selection
      setRangeSelection({
        startDate: selection.range.startDate,
        endDate: selection.range.endDate,
        startTime: selection.range.startTime,
        endTime: selection.range.endTime,
      });
      // Open drawer for range details
      if (selection.range.startDate && selection.range.endDate) {
        setDialogOpen(true);
      }
    } else if (bookingMode === 'ALL_DAY' && selection.cells.length > 0) {
      // For all-day mode, collect selected dates
      const selectedDates = selection.cells.map(cell => {
        const date = new Date(cell.start);
        return date.toISOString().split('T')[0]!;
      });
      setAllDaySelection(selectedDates);
      // Open drawer if dates are selected
      if (selectedDates.length > 0) {
        setDialogOpen(true);
      }
    }
  }, [bookingMode]);

  const handleDialogConfirm = (data: BookingFormData): void => {
    if (bookingMode === 'SINGLE_SLOT' && selectedSlotForDialog) {
    const dayIndex = Math.floor(
      (selectedSlotForDialog.date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    const slotKey = `${dayIndex}-${selectedSlotForDialog.startTime}`;

    // Calculate duration from startTime and endTime
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const duration = ((endH ?? 0) * 60 + (endM ?? 0)) - ((startH ?? 0) * 60 + (startM ?? 0));

    setSelectedSlots(prev => new Set(prev).add(slotKey));
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: {
        duration: duration > 0 ? duration : 60,
        purpose: data.purpose,
        attendees: data.attendees,
        activityType: data.activityType,
      },
    }));
    setDialogOpen(false);
    setSelectedSlotForDialog(undefined);
    } else if (bookingMode === 'RANGE' && rangeSelection) {
      // For RANGE mode, the selection is already stored in rangeSelection
      // Store form data for later use in booking submission
      // The drawer is just for collecting booking details
      setDialogOpen(false);
    } else if (bookingMode === 'ALL_DAY' && allDaySelection.length > 0) {
      // For ALL_DAY mode, the selection is already stored in allDaySelection
      // Store form data for later use in booking submission
      // The drawer is just for collecting booking details
      setDialogOpen(false);
    }
  };

  const handleRemoveSlot = (slotKey: string): void => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      next.delete(slotKey);
      return next;
    });
    setSlotDetails(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
  };

  const handleAdjustTime = (slotKey: string, minutesDelta: number): void => {
    const [dayIdxStr, timeStr] = slotKey.split('-');
    const dayIdx = parseInt(dayIdxStr ?? '0', 10);
    const [h, m] = (timeStr ?? '00:00').split(':').map(Number);
    const newMins = (h ?? 0) * 60 + (m ?? 0) + minutesDelta;
    if (newMins < 0 || newMins >= 24 * 60) return;

    const newH = Math.floor(newMins / 60);
    const newM = newMins % 60;
    const newTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    const newKey = `${dayIdx}-${newTime}`;

    if (selectedSlots.has(newKey)) return;

    setSelectedSlots(prev => {
      const next = new Set(prev);
      next.delete(slotKey);
      next.add(newKey);
      return next;
    });
    setSlotDetails(prev => {
      const details = prev[slotKey];
      const next = { ...prev };
      delete next[slotKey];
      if (details) next[newKey] = details;
      return next;
    });
  };

  const handleChangeDuration = (slotKey: string, duration: number): void => {
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], duration } as SlotDetail,
    }));
  };

  const handleChangeAttendees = (slotKey: string, attendees: string): void => {
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], attendees } as SlotDetail,
    }));
  };

  const handleChangeActivityType = (slotKey: string, activityType: string): void => {
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], activityType } as SlotDetail,
    }));
  };

  const handleChangePurpose = (slotKey: string, purpose: string): void => {
    setSlotDetails(prev => ({
      ...prev,
      [slotKey]: { ...prev[slotKey], purpose } as SlotDetail,
    }));
  };

  const handleServiceToggle = (serviceId: string, checked: boolean): void => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
  };

  // State to track demo auth (forces re-render when demo login happens)
  const [demoAuthComplete, setDemoAuthComplete] = React.useState(false);
  const [showDemoDialog, setShowDemoDialog] = React.useState(false);
  
  // Check if demo user exists in localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('web_user');
    if (savedUser && savedUser.includes('demo-user')) {
      setDemoAuthComplete(true);
    }
  }, []);

  // One-click demo login - no form, no dialog
  const CITIZEN_DEMO_TOKEN = 'demo-token-2026';
  
  const handleDemoLoginOneClick = async (): Promise<void> => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    saveBookingState();
    
    try {
      const response = await authService.loginWithDemoToken(CITIZEN_DEMO_TOKEN);
      
      if (response.data?.user) {
        // Store user in localStorage
        localStorage.setItem('web_user', JSON.stringify(response.data.user));
        
        // Use handleAuthCallback to update auth state
        handleAuthCallback(response.data.user);
        
        // Default to private booking
        setBookingAccountType('private');
        setSelectedOrganizationId(undefined);
        setDemoAuthComplete(true);
      } else {
        console.error('[DEMO LOGIN] No user in response');
      }
    } catch (error) {
      console.error('[DEMO LOGIN] Failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLoginVipps = async (): Promise<void> => {
    setIsLoggingIn(true);
    // Save booking state before login redirect
    saveBookingState();
    try {
      if (DEMO_MODE_ENABLED) {
        // Demo mode: Simulate login with mock user (private user via Vipps)
        const demoUser = {
          id: '00000000-0000-0000-0000-000000000011', // Demo Xala user from seeds
          name: 'Demo Bruker',
          email: 'demo@xala.no',
        };
        await new Promise(resolve => setTimeout(resolve, 300));
        handleAuthCallback(demoUser);
        // Default to private - user can click Fortsett immediately or change to organization
        setBookingAccountType('private');
        setSelectedOrganizationId(undefined);
        setDemoAuthComplete(true);
        setIsLoggingIn(false);
      } else {
        // Production mode: Use real auth login (state saved via saveBookingState)
        authLogin('vipps');
      }
    } catch (error) {
      auditService.logError('login_failed', 'auth', error instanceof Error ? error : String(error), { provider: 'vipps' });
      setIsLoggingIn(false);
    }
  };

  const handleLoginEmployee = async (): Promise<void> => {
    setIsLoggingIn(true);
    // Save booking state before login redirect
    saveBookingState();
    try {
      if (DEMO_MODE_ENABLED) {
        // Demo mode: Simulate login with mock user (organization employee via BankID)
        const demoUser = {
          id: '00000000-0000-0000-0000-000000000013', // Ola Hansen from seeds (kommune employee)
          name: 'Ola Hansen',
          email: 'ola.hansen@kommune.no',
        };
        await new Promise(resolve => setTimeout(resolve, 300));
        handleAuthCallback(demoUser);
        // Default to private - user can click Fortsett immediately or change to organization
        setBookingAccountType('private');
        setSelectedOrganizationId(undefined);
        setDemoAuthComplete(true);
        setIsLoggingIn(false);
      } else {
        // Production mode: Use real auth login for organization (ID-porten)
        authLogin('idporten');
      }
    } catch (error) {
      auditService.logError('login_failed', 'auth', error instanceof Error ? error : String(error), { provider: 'idporten' });
      setIsLoggingIn(false);
    }
  };

  /**
   * Handle login with full flow context preservation
   * Called from BookingConfirmationStep when user needs to authenticate
   * Saves complete booking state before OAuth redirect
   */
  const handleLoginWithFlowContext = async (options: {
    provider: 'idporten' | 'microsoft' | 'vipps';
    bookingState: {
      selectedSlots: Array<{ date: string; startTime: string; endTime: string }>;
      slotDetails: Record<string, { duration: number; purpose?: string; attendees?: string; activityType?: string }>;
      weekStart: string;
      bookingAccountType?: 'private' | 'organization';
      selectedOrganizationId?: string;
    };
    rentalObjectId?: string;
    tenantId?: string;
    bookingMode?: string;
  }): Promise<void> => {
    setIsLoggingIn(true);
    
    // Save booking state for restoration after login
    saveBookingState();
    
    try {
      // Demo mode: Simulate login with mock user
      if (DEMO_MODE_ENABLED) {
        const demoUser = options.provider === 'vipps' 
          ? { id: '00000000-0000-0000-0000-000000000011', name: 'Demo Bruker', email: 'demo@xala.no' }
          : { id: '00000000-0000-0000-0000-000000000013', name: 'Ola Hansen', email: 'ola.hansen@kommune.no' };
        
        await new Promise(resolve => setTimeout(resolve, 300));
        handleAuthCallback(demoUser);
        // Default to private - user can click Fortsett immediately or change to organization
        setBookingAccountType('private');
        setSelectedOrganizationId(undefined);
        setDemoAuthComplete(true);
        setIsLoggingIn(false);
        return;
      }
      
      // Production mode: Real OAuth flow - state is already saved via saveBookingState()
      authLogin(options.provider);
    } catch (error) {
      auditService.logError('login_failed', 'auth', error instanceof Error ? error : String(error), {
        provider: options.provider,
        flowContextEnabled: true,
      });
      setIsLoggingIn(false);
    }
  };

  const handleSubmitBooking = async (): Promise<void> => {
    if (!rentalObjectId) {
      setBookingError(t('bookingWidget.error.missingListingId'));
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      const bookings: CreateBookingDTO[] = Array.from(selectedSlots).map(slotKey => {
        const [dayIdxStr, timeStr] = slotKey.split('-');
        const dayIdx = parseInt(dayIdxStr ?? '0', 10);
        const details = slotDetails[slotKey] ?? { duration: 60 };

        const slotDate = new Date(weekStart);
        slotDate.setDate(weekStart.getDate() + dayIdx);

        const [startH, startM] = (timeStr ?? '00:00').split(':').map(Number);
        const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
        const endH = Math.floor(endMins / 60);
        const endM = endMins % 60;

        // Create full datetime objects for API
        const startDateTime = new Date(slotDate);
        startDateTime.setHours(startH ?? 0, startM ?? 0, 0, 0);
        
        const endDateTime = new Date(slotDate);
        endDateTime.setHours(endH, endM, 0, 0);

        // API expects: rentalObjectId, startTime, endTime, userId?, totalPrice?, notes?, metadata?
        // Include userId from authenticated user (demo or real)
        return {
          rentalObjectId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          userId: user?.id || '00000000-0000-0000-0000-000000000011', // Demo user fallback
          notes: details.purpose || undefined,
          metadata: {
            attendees: details.attendees ? parseInt(details.attendees, 10) : 1,
            activityType: details.activityType,
            priceGroupId: selectedPriceGroup || undefined,
            additionalServices: Array.from(selectedServices),
            visibility,
            organizationId: bookingAccountType === 'organization' ? selectedOrganizationId : undefined,
            bookingMode,
          },
        };
      });

      for (const booking of bookings) {
        await bookingService.create(booking);
      }

      // Go to done step (step 4)
      setCurrentStep(4);
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : t('bookingWidget.error.bookingFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next'): void => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = (): void => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  const getDateRangeString = (): string => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    return `${weekStart.getDate()}. ${months[weekStart.getMonth()]} – ${endDate.getDate()}. ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
  };

  const visibleRows = isCalendarExpanded ? 24 : 8;

  // Check availability for all selected slots against busy slots
  const checkAvailability = (): SlotAvailability[] => {
    return Array.from(selectedSlots).map(slotKey => {
      const [dayIdxStr, timeStr] = slotKey.split('-');
      const dayIdx = parseInt(dayIdxStr ?? '0', 10);
      const details = slotDetails[slotKey] ?? { duration: 60 };

      const slotDate = new Date(weekStart);
      slotDate.setDate(weekStart.getDate() + dayIdx);

      const [startH, startM] = (timeStr ?? '00:00').split(':').map(Number);
      const endMins = ((startH ?? 0) * 60 + (startM ?? 0)) + details.duration;
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

      const dateStr = slotDate.toISOString().split('T')[0] ?? '';

      // Check if this slot conflicts with any busy slot
      const isConflicting = busySlots.some(busy => {
        if (busy.date !== dateStr) return false;
        const busyStart = busy.startTime;
        const busyEnd = busy.endTime;
        // Check for time overlap
        return (timeStr ?? '') < busyEnd && endTime > busyStart;
      });

      return {
        slotKey,
        date: slotDate,
        startTime: timeStr ?? '',
        endTime,
        isAvailable: !isConflicting,
        conflictReason: isConflicting ? t('bookingWidget.error.timeOccupied') : undefined,
      };
    });
  };

  const handleCheckAvailabilityAndProceed = (): void => {
    const availabilities = checkAvailability();
    const hasConflicts = availabilities.some(a => !a.isAvailable);

    if (hasConflicts && availabilities.length > 1) {
      // Show conflict dialog for multiple slots with conflicts
      setSlotAvailabilities(availabilities);
      setConflictDialogOpen(true);
    } else if (hasConflicts && availabilities.length === 1) {
      // Single slot with conflict - show error
      setBookingError(t('bookingWidget.error.slotUnavailable'));
    } else {
      // No conflicts - proceed to next step
      setCurrentStep(1);
    }
  };

  const handleBookAvailableSlots = (availableSlotKeys: string[]): void => {
    // Update selected slots to only include available ones
    setSelectedSlots(new Set(availableSlotKeys));
    setConflictDialogOpen(false);
    // Proceed to next step
    setCurrentStep(1);
  };

  const handleChangeTimeFromConflict = (): void => {
    setConflictDialogOpen(false);
    // Stay on calendar step to allow user to change selections
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
      {/* Header */}
      <BookingStepperHeader
        steps={bookingSteps}
        currentStep={currentStep}
        listingTitle={listingTitle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* LEFT COLUMN: Step Content */}
        <div
          style={{
            flex: isMobile || currentStep === 2 || currentStep === 4 ? 1 : '0 0 68%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            transition: 'opacity 0.2s ease-in-out',
          }}
          key={`step-content-${currentStep}`}
        >
          {/* Step 0: Calendar Selection */}
          {currentStep === 0 && (
            <>
              {/* Booking Mode Selector (Single / Recurring / Seasonal) */}
              <BookingModeSelector
                value={bookingMode as unknown as 'single' | 'recurring' | 'in-game'}
                onChange={setBookingMode as unknown as (mode: 'single' | 'recurring' | 'in-game') => void}
                availableModes={availableBookingModes as unknown as ('single' | 'recurring' | 'in-game')[]}
                recurringConstraints={recurringConstraints}
              />

              {/* SINGLE_SLOT Mode: Use CalendarSection component */}
              {bookingMode === 'SINGLE_SLOT' && rentalObjectId && (
                <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)' }}>
                  
                  <CalendarSection
                    rentalObjectId={rentalObjectId}
                    bookingType="SINGLE_SLOT"
                    forceMode="TIME_SLOTS"
                    onSelectionChange={handleCalendarSelection}
                    readOnly={false}
                  />
                  
                  {/* Selection count indicator */}
                  {selectedSlots.size > 0 && (
                    <div style={{
                      marginTop: 'var(--ds-spacing-4)',
                      padding: 'var(--ds-spacing-3)',
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                      borderRadius: 'var(--ds-border-radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--ds-spacing-2)',
                    }}>
                      <CheckCircleIcon size={18} />
                      <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                        {t('bookingWidget.info.selectedCount', { count: selectedSlots.size })}
                      </Paragraph>
                </div>
                  )}
                  </div>
              )}

              {/* RANGE Mode: Use CalendarSection with MULTI_DAY mode */}
              {bookingMode === 'RANGE' && rentalObjectId && (
              <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)' }}>
                  <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                    <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                      {t('bookingWidget.range.selectPeriod')}
                    </Heading>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('bookingWidget.range.selectPeriodDesc')}
                    </Paragraph>
                  </div>
                  
                  
                  <CalendarSection
                    rentalObjectId={rentalObjectId}
                    bookingType="RANGE"
                    forceMode="MULTI_DAY"
                    onSelectionChange={handleCalendarSelection}
                    readOnly={false}
                  />
                  
                  {/* Selected period summary */}
                  {rangeSelection && (
                    <div style={{ 
                      marginTop: 'var(--ds-spacing-4)', 
                      padding: 'var(--ds-spacing-3)', 
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                    borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-accent-border-default)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-2)' }}>
                        <CheckCircleIcon size={18} />
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {t('bookingWidget.range.selectedPeriod')}
                      </Paragraph>
                      </div>
                      <Paragraph data-size="sm" style={{ margin: 0 }}>
                        {new Date(rangeSelection.startDate).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} 
                        {' → '}
                        {new Date(rangeSelection.endDate).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        {rangeSelection.startTime && rangeSelection.endTime && (
                          <span style={{ display: 'block', marginTop: 'var(--ds-spacing-1)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                            {rangeSelection.startTime} - {rangeSelection.endTime}
                          </span>
                        )}
                      </Paragraph>
                    </div>
                  )}
                </div>
              )}

              {/* ALL_DAY Mode: Use CalendarSection with ALL_DAY mode */}
              {bookingMode === 'ALL_DAY' && rentalObjectId && (
                <div style={{ flex: 1, overflow: 'auto', padding: 'var(--ds-spacing-4)' }}>
                  <div style={{ marginBottom: 'var(--ds-spacing-4)' }}>
                    <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                      {t('bookingWidget.allDay.selectDays')}
                    </Heading>
                    <Paragraph data-size="sm" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                      {t('bookingWidget.allDay.selectDaysDesc')}
                          </Paragraph>
                        </div>
                  
                  
                  <CalendarSection
                    rentalObjectId={rentalObjectId}
                    bookingType="ALL_DAY"
                    forceMode="ALL_DAY"
                    onSelectionChange={handleCalendarSelection}
                    readOnly={false}
                  />
                  
                  {/* Selected days summary */}
                  {allDaySelection.length > 0 && (
                    <div style={{ 
                      marginTop: 'var(--ds-spacing-4)', 
                      padding: 'var(--ds-spacing-3)', 
                      backgroundColor: 'var(--ds-color-accent-surface-default)',
                        borderRadius: 'var(--ds-border-radius-md)',
                      border: '1px solid var(--ds-color-accent-border-default)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)', marginBottom: 'var(--ds-spacing-3)' }}>
                        <CheckCircleIcon size={18} />
                        <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)' }}>
                          {t('bookingWidget.allDay.selectedDays', { count: allDaySelection.length })}
                        </Paragraph>
                  </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-2)' }}>
                        {allDaySelection.map((date) => (
                          <span
                            key={date}
                      style={{
                              padding: 'var(--ds-spacing-1) var(--ds-spacing-2)',
                              backgroundColor: 'var(--ds-color-neutral-background-default)',
                              borderRadius: 'var(--ds-border-radius-sm)',
                              fontSize: 'var(--ds-font-size-xs)',
                              fontWeight: 'var(--ds-font-weight-medium)',
                              border: '1px solid var(--ds-color-accent-border-default)',
                            }}
                          >
                            {new Date(date).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                        ))}
                      </div>
                  </div>
                )}
              </div>
              )}

              {/* RECURRING Mode: Pattern Builder + Preview */}
              {bookingMode === 'RECURRING' && (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  {/* Step 1: Select base slot */}
                  {!recurringBaseSlot && (
                    <div style={{ padding: 'var(--ds-spacing-4)' }}>
                      <Heading level={3} data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                        {t('bookingWidget.recurring.selectFirstTime')}
                      </Heading>
                      <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                        {t('bookingWidget.recurring.selectFirstTimeDesc')}
                      </Paragraph>
                      {/* Calendar for selecting base slot */}
                      <div
                        style={{
                          padding: 'var(--ds-spacing-3) var(--ds-spacing-4)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottom: '1px solid var(--ds-color-neutral-border-subtle)',
                          gap: 'var(--ds-spacing-3)',
                        }}
                      >
                        <Button type="button" variant="tertiary" data-size="sm" onClick={goToToday}>
                          {t('bookingWidget.today')}
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-spacing-2)' }}>
                          <button
                            type="button"
                            onClick={() => navigateWeek('prev')}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px',
                              border: '1px solid var(--ds-color-neutral-border-default)',
                              borderRadius: 'var(--ds-border-radius-md)',
                              backgroundColor: 'var(--ds-color-neutral-background-default)',
                              cursor: 'pointer',
                            }}
                            aria-label={t('bookingWidget.previousWeek')}
                          >
                            <ChevronLeftIcon size={16} />
                          </button>
                          <Paragraph data-size="sm" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', minWidth: '180px', textAlign: 'center' }}>
                            {getDateRangeString()}
                          </Paragraph>
                          <button
                            type="button"
                            onClick={() => navigateWeek('next')}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '32px', height: '32px',
                              border: '1px solid var(--ds-color-neutral-border-default)',
                              borderRadius: 'var(--ds-border-radius-md)',
                              backgroundColor: 'var(--ds-color-neutral-background-default)',
                              cursor: 'pointer',
                            }}
                            aria-label={t('bookingWidget.nextWeek')}
                          >
                            <ChevronRightIcon size={16} />
                          </button>
                        </div>
                      </div>
                      {/* Simplified slot picker for recurring base */}
                      <div style={{ padding: 'var(--ds-spacing-4)', maxHeight: '300px', overflow: 'auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--ds-spacing-2)' }}>
                          {calendarData.map((day, dayIdx) => (
                            <div key={dayIdx} style={{ textAlign: 'center' }}>
                              <Paragraph data-size="xs" style={{ margin: 0, fontWeight: 'var(--ds-font-weight-medium)', marginBottom: 'var(--ds-spacing-1)' }}>
                                {day.dayName}
                              </Paragraph>
                              <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)', color: day.isToday ? 'var(--ds-color-accent-text-default)' : 'inherit' }}>
                                {day.dayNumber}
                              </Paragraph>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-1)' }}>
                                {day.slots.slice(0, 6).map((slot) => (
                                  <button
                                    key={`${dayIdx}-${slot.time}`}
                                    type="button"
                                    disabled={slot.status === 'unavailable' || slot.status === 'occupied'}
                                    onClick={() => {
                                      const slotDate = new Date(weekStart);
                                      slotDate.setDate(weekStart.getDate() + dayIdx);
                                      const [h, m] = slot.time.split(':').map(Number);
                                      const endMins = ((h ?? 0) * 60 + (m ?? 0)) + 60;
                                      const endH = Math.floor(endMins / 60);
                                      const endM = endMins % 60;
                                      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                      setRecurringBaseSlot({
                                        date: slotDate.toISOString().split('T')[0] ?? '',
                                        startTime: slot.time,
                                        endTime,
                                      });
                                    }}
                                    style={{
                                      padding: 'var(--ds-spacing-1)',
                                      fontSize: 'var(--ds-font-size-xs)',
                                      border: '1px solid var(--ds-color-neutral-border-default)',
                                      borderRadius: 'var(--ds-border-radius-sm)',
                                      backgroundColor: slot.status === 'available' ? 'var(--ds-color-success-surface-default)' : 'var(--ds-color-neutral-surface-hover)',
                                      cursor: slot.status === 'available' ? 'pointer' : 'not-allowed',
                                      opacity: slot.status === 'unavailable' || slot.status === 'occupied' ? 0.5 : 1,
                                    }}
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Configure pattern */}
                  {recurringBaseSlot && recurringOccurrences.length === 0 && (
                    <div style={{ padding: 'var(--ds-spacing-4)', overflow: 'auto', flex: 1 }}>
                      <RecurringBuilder
                        baseSlot={recurringBaseSlot}
                        constraints={recurringConstraints}
                        value={recurringPattern}
                        onChange={setRecurringPattern}
                      />
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-4)' }}>
                        <Button
                          type="button"
                          variant="secondary"
                          data-size="sm"
                          onClick={() => setRecurringBaseSlot(null)}
                        >
                          {t('bookingWidget.back')}
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          data-size="sm"
                          onClick={() => {
                            // TODO: Call API to get preview
                            setIsLoadingRecurringPreview(true);
                            // Simulate preview generation
                            setTimeout(() => {
                              const occurrences: RecurringOccurrenceDTO[] = [];
                              const baseDate = new Date(recurringBaseSlot.date);
                              const count = recurringPattern.endCondition.occurrences ?? 10;
                              for (let i = 0; i < count; i++) {
                                const occDate = new Date(baseDate);
                                occDate.setDate(baseDate.getDate() + (i * 7));
                                occurrences.push({
                                  index: i,
                                  startTime: `${occDate.toISOString().split('T')[0]}T${recurringBaseSlot.startTime}:00`,
                                  endTime: `${occDate.toISOString().split('T')[0]}T${recurringBaseSlot.endTime}:00`,
                                  status: Math.random() > 0.8 ? 'CONFLICT' : 'AVAILABLE',
                                });
                              }
                              setRecurringOccurrences(occurrences);
                              setRecurringSummary({
                                totalOccurrences: occurrences.length,
                                availableCount: occurrences.filter(o => o.status === 'AVAILABLE').length,
                                conflictCount: occurrences.filter(o => o.status === 'CONFLICT').length,
                                blockedCount: 0,
                                blackoutCount: 0,
                                totalPrice: occurrences.filter(o => o.status === 'AVAILABLE').length * 500,
                                currency: 'NOK',
                              });
                              setSelectedRecurringIndices(new Set(occurrences.filter(o => o.status === 'AVAILABLE').map(o => o.index)));
                              setIsLoadingRecurringPreview(false);
                            }, 1000);
                          }}
                        >
                          {t('bookingWidget.recurring.generatePreview')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preview occurrences */}
                  {recurringBaseSlot && recurringOccurrences.length > 0 && (
                    <div style={{ padding: 'var(--ds-spacing-4)', overflow: 'auto', flex: 1 }}>
                      <RecurringPreview
                        occurrences={recurringOccurrences}
                        summary={recurringSummary}
                        isLoading={isLoadingRecurringPreview}
                        error={recurringPreviewError}
                        selectedIndices={selectedRecurringIndices}
                        onSelectionChange={setSelectedRecurringIndices}
                        allowSelection={true}
                      />
                      {/* Conflict resolution if there are conflicts */}
                      {recurringOccurrences.some(o => o.status === 'CONFLICT') && (
                        <div style={{ marginTop: 'var(--ds-spacing-6)' }}>
                          <ConflictResolver
                            conflicts={recurringOccurrences.filter(o => o.status === 'CONFLICT')}
                            alternatives={conflictAlternatives}
                            resolutions={conflictResolutions}
                            onResolutionsChange={setConflictResolutions}
                          />
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--ds-spacing-3)', marginTop: 'var(--ds-spacing-4)' }}>
                        <Button
                          type="button"
                          variant="secondary"
                          data-size="sm"
                          onClick={() => {
                            setRecurringOccurrences([]);
                            setRecurringSummary(undefined);
                            setSelectedRecurringIndices(new Set());
                          }}
                        >
                          {t('bookingWidget.recurring.backToPattern')}
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          data-size="sm"
                          disabled={selectedRecurringIndices.size === 0}
                          onClick={() => setCurrentStep(1)}
                        >
                          {t('bookingWidget.recurring.continueWith', { count: selectedRecurringIndices.size })}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SEASON_RENTAL Mode: Redirect to seasons page */}
              {bookingMode === 'SEASON_RENTAL' && (
                <div style={{ padding: 'var(--ds-spacing-6)', textAlign: 'center' }}>
                  <Heading level={3} data-size="md" style={{ margin: 0, marginBottom: 'var(--ds-spacing-3)' }}>
                    {t('bookingWidget.season.page.title')}
                  </Heading>
                  <Paragraph data-size="sm" style={{ margin: 0, marginBottom: 'var(--ds-spacing-4)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                    {t('bookingWidget.season.description')}
                  </Paragraph>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      // Navigate to MinSide seasons page
                      window.location.href = '/minside/seasons';
                    }}
                  >
                    {t('bookingWidget.season.goToPage')}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Step 1: Pricing/Details */}
          {currentStep === 1 && (
            <BookingPricingStep
              priceGroups={priceGroups}
              additionalServices={additionalServices}
              selectedPriceGroup={selectedPriceGroup}
              selectedServices={selectedServices}
              termsAccepted={termsAccepted}
              onPriceGroupChange={setSelectedPriceGroup}
              onServiceToggle={handleServiceToggle}
              onTermsChange={setTermsAccepted}
            />
          )}

          {/* Step 2: Login + Account Type Selection */}
          {currentStep === 2 && (
            <BookingConfirmationStep
              key={`login-${isAuthenticated}-${bookingAccountType}-${selectedOrganizationId}`}
              isAuthenticated={isAuthenticated}
              isLoggingIn={isLoggingIn}
              isSubmitting={false}
              bookingError={null}
              isMobile={isMobile}
              selectedSlots={selectedSlots}
              slotDetails={slotDetails}
              weekStart={weekStart}
              onLoginWithVipps={handleLoginVipps}
              onLoginAsEmployee={handleLoginEmployee}
              onLoginWithFlowContext={handleLoginWithFlowContext}
              onConfirmBooking={() => {}} // Not used in step 2
              onClearError={() => {}}
              bookingAccountType={bookingAccountType}
              selectedOrganizationId={selectedOrganizationId}
              onAccountTypeSelect={handleAccountTypeSelect}
              onConfirmAccountType={handleConfirmAccountType}
              displayMode="login-and-selection"
              organizations={organizations}
              isAccountTypeConfirmed={false} // Force showing account type selection
              rentalObjectId={rentalObjectId}
              tenantId={import.meta.env.VITE_TENANT_ID}
              bookingMode={(bookingConfig?.mode || 'SLOTS') as 'SLOTS' | 'ALL_DAY' | 'DURATION' | 'TICKETS' | 'NONE' | undefined}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              onDemoLogin={handleDemoLoginOneClick}
              onLogout={() => {
                // Clear demo login state using auth hook (no page reload)
                authLogout();
                setDemoAuthComplete(false);
                setBookingAccountType(undefined);
                setSelectedOrganizationId(undefined);
                setIsAccountTypeConfirmed(false);
              }}
            />
          )}

          {/* Step 3: Final Confirmation (booking summary) */}
          {currentStep === 3 && (
            <BookingConfirmationStep
              key={`confirmation-${isAuthenticated}-${bookingAccountType}-${selectedOrganizationId}`}
              isAuthenticated={true}
              isLoggingIn={false}
              isSubmitting={isSubmitting}
              bookingError={bookingError}
              isMobile={isMobile}
              selectedSlots={selectedSlots}
              slotDetails={slotDetails}
              weekStart={weekStart}
              onLoginWithVipps={handleLoginVipps}
              onLoginAsEmployee={handleLoginEmployee}
              onLoginWithFlowContext={handleLoginWithFlowContext}
              onConfirmBooking={handleSubmitBooking}
              onClearError={() => setBookingError(null)}
              bookingAccountType={bookingAccountType}
              selectedOrganizationId={selectedOrganizationId}
              onAccountTypeSelect={handleAccountTypeSelect}
              onConfirmAccountType={handleConfirmAccountType}
              organizations={organizations}
              isAccountTypeConfirmed={true}
              displayMode="confirmation-only"
              rentalObjectId={rentalObjectId}
              tenantId={import.meta.env.VITE_TENANT_ID}
              bookingMode={(bookingConfig?.mode || 'SLOTS') as 'SLOTS' | 'ALL_DAY' | 'DURATION' | 'TICKETS' | 'NONE' | undefined}
              visibility={visibility}
              onVisibilityChange={setVisibility}
              onDemoLogin={handleDemoLoginOneClick}
              onLogout={() => {
                // Clear demo login state and go back to login step (no page reload)
                authLogout();
                setDemoAuthComplete(false);
                setBookingAccountType(undefined);
                setSelectedOrganizationId(undefined);
                setIsAccountTypeConfirmed(false);
                setCurrentStep(2);
              }}
            />
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div style={{ padding: 'var(--ds-spacing-8)', textAlign: 'center' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--ds-border-radius-full)',
                  backgroundColor: 'var(--ds-color-success-surface-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--ds-spacing-4)',
                }}
              >
                <CheckCircleIcon size={40} />
              </div>
              <Heading level={2} data-size="lg" style={{ margin: 0, marginBottom: 'var(--ds-spacing-2)' }}>
                {t('bookingWidget.success.page.title')}
              </Heading>
              <Paragraph data-size="md" style={{ margin: 0, color: 'var(--ds-color-neutral-text-subtle)' }}>
                {t('bookingWidget.success.message')}
              </Paragraph>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Fixed Sidebar - Only hidden on login step */}
        {!isMobile && currentStep !== 2 && currentStep < 4 && (
          <div
            style={{
              flex: '0 0 32%',
              minWidth: 0,
              maxWidth: '32%',
              borderLeft: '1px solid var(--ds-color-neutral-border-subtle)',
              padding: 'var(--ds-spacing-3)',
              backgroundColor: 'var(--ds-color-neutral-background-subtle)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <BookingCartSidebar
              selectedSlots={selectedSlots}
              slotDetails={slotDetails}
              weekStart={weekStart}
              onRemoveSlot={handleRemoveSlot}
              lastUpdated={lastUpdated}
              priceGroups={priceGroups}
              additionalServices={additionalServices}
              selectedPriceGroup={selectedPriceGroup}
              selectedServices={selectedServices}
              onPriceGroupChange={setSelectedPriceGroup}
              onServiceToggle={handleServiceToggle}
            />
          </div>
        )}
      </div>

      {/* Action Section */}
      <div
        style={{
          padding: 'var(--ds-spacing-4)',
          borderTop: '1px solid var(--ds-color-neutral-border-subtle)',
          display: 'flex',
          gap: 'var(--ds-spacing-3)',
        }}
      >
        {currentStep > 0 && currentStep < 4 && (
          <Button
            type="button"
            variant="secondary"
            data-size="lg"
            onClick={() => {
              // Normal back navigation through all steps
              setCurrentStep(prev => Math.max(0, prev - 1));
            }}
          >
            {t('bookingWidget.back')}
          </Button>
        )}
        {currentStep < 4 && (
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            data-color="accent"
            onClick={() => {
              if (currentStep === 3) {
                // Step 3: Submit booking
                handleSubmitBooking();
              } else if (currentStep === 2) {
                // Step 2: Login + Account Type - go to step 3 when both complete
                if (isAuthenticated && bookingAccountType && (bookingAccountType === 'private' || selectedOrganizationId)) {
                  setCurrentStep(3);
                }
                // Login buttons handle authentication
              } else if (currentStep === 1) {
                // Step 1: Details - go to login (will auto-skip if already authenticated)
                setCurrentStep(2);
              } else if (currentStep === 0) {
                // Step 0: Calendar - check availability
                handleCheckAvailabilityAndProceed();
              }
            }}
            disabled={
              !isBookable ||
              (currentStep === 0 && (
                (bookingMode === 'SINGLE_SLOT' && selectedSlots.size === 0) ||
                (bookingMode === 'RANGE' && !rangeSelection) ||
                (bookingMode === 'ALL_DAY' && allDaySelection.length === 0) ||
                (bookingMode === 'RECURRING' && selectedRecurringIndices.size === 0)
              )) ||
              (currentStep === 1 && (!selectedPriceGroup || !termsAccepted)) ||
              // Step 2: Need authenticated
              (currentStep === 2 && !isAuthenticated) ||
              // Step 3: Need account type selected (+ org if organization), not submitting
              (currentStep === 3 && (!bookingAccountType || (bookingAccountType === 'organization' && !selectedOrganizationId) || isSubmitting))
            }
            style={{
              flex: 1,
              // Ensure proper contrast when disabled
              ...((!isBookable ||
                (currentStep === 0 && (
                  (bookingMode === 'SINGLE_SLOT' && selectedSlots.size === 0) ||
                  (bookingMode === 'RANGE' && !rangeSelection) ||
                  (bookingMode === 'ALL_DAY' && allDaySelection.length === 0) ||
                  (bookingMode === 'RECURRING' && selectedRecurringIndices.size === 0)
                ))) && {
                backgroundColor: 'var(--ds-color-neutral-surface-default)',
                color: 'var(--ds-color-neutral-text-subtle)',
                borderColor: 'var(--ds-color-neutral-border-default)',
              }),
            }}
          >
            {isSubmitting
              ? t('bookingWidget.submitting')
              : currentStep === 0
                ? (() => {
                    if (bookingMode === 'SINGLE_SLOT' && selectedSlots.size > 0) {
                      return selectedSlots.size > 1
                    ? t('bookingWidget.continueWithSlotsPlural', { count: selectedSlots.size })
                        : t('bookingWidget.continueWithSlots', { count: selectedSlots.size });
                    }
                    if (bookingMode === 'RANGE' && rangeSelection) {
                      return t('bookingWidget.continueWithRange');
                    }
                    if (bookingMode === 'ALL_DAY' && allDaySelection.length > 0) {
                      return t('bookingWidget.continueWithDays', { count: allDaySelection.length });
                    }
                    if (bookingMode === 'RECURRING' && selectedRecurringIndices.size > 0) {
                      return t('bookingWidget.continueWithRecurring', { count: selectedRecurringIndices.size });
                    }
                    return t('bookingWidget.selectTimeToContiue');
                  })()
                : currentStep === 1
                  ? isAuthenticated
                  ? t('bookingWidget.continueToConfirmation')
                    : t('bookingWidget.continueToLogin')
                  : currentStep === 2
                    ? t('bookingWidget.loginToContinue')
                    : currentStep === 3
                      ? t('bookingWidget.sendRequest')
                    : t('bookingWidget.done')}
          </Button>
        )}
        {currentStep === 4 && (
          <Button
            type="button"
            variant="primary"
            data-size="lg"
            onClick={() => {
              setCurrentStep(0);
              setSelectedSlots(new Set());
              setSlotDetails({});
              setSelectedPriceGroup('');
              setSelectedServices(new Set());
              setTermsAccepted(false);
            }}
            style={{ flex: 1 }}
          >
            {t('bookingWidget.success.bookMore')}
          </Button>
        )}
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        key={selectedSlotForDialog ? `${selectedSlotForDialog.date.getTime()}-${selectedSlotForDialog.startTime}` : 'dialog'}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        slot={selectedSlotForDialog}
        busySlots={busySlots}
      />

      {/* Availability Conflict Dialog */}
      <BookingAvailabilityConflictDialog
        isOpen={conflictDialogOpen}
        onClose={() => setConflictDialogOpen(false)}
        slots={slotAvailabilities}
        onChangeTime={handleChangeTimeFromConflict}
        onBookAvailable={handleBookAvailableSlots}
        listingTitle={listingTitle}
        rentalObjectId={rentalObjectId ?? ''}
      />
    </div>
  );
}

export default BookingWidgetPlacement;
