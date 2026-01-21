import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type {
  Booking,
  BookingSelectionDTO,
  BookingVisibility,
} from '@digilist/client-sdk/types';
import { useMyBookings, useCreateBooking, useCancelBooking } from '@digilist/client-sdk/hooks';

/**
 * Booking mode for the booking flow
 * Using the booking.ts definition: 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING'
 */
export type BookingMode = 'SINGLE_SLOT' | 'IN_GAME' | 'RECURRING';

/**
 * Booking wizard step for multi-step booking flows
 */
export type BookingWizardStep =
  | 'select-time'
  | 'select-extras'
  | 'confirm-details'
  | 'payment'
  | 'confirmation';

/**
 * Booking flow state for managing the booking creation process
 */
export interface BookingFlowState {
  /** Current step in the booking wizard */
  currentStep: BookingWizardStep;
  /** Selected rental object ID */
  rentalObjectId: string | null;
  /** Booking mode */
  mode: BookingMode;
  /** Selected time slot */
  selection: BookingSelectionDTO | null;
  /** Number of attendees */
  attendees?: number;
  /** Purpose/reason for booking */
  purpose?: string;
  /** Calendar visibility preference */
  visibility?: BookingVisibility;
  /** Selected extras/add-ons */
  selectedExtras?: string[];
  /** Additional notes */
  notes?: string;
  /** Organization ID (for org bookings) */
  organizationId?: string;
  /** Whether flow is complete */
  isComplete: boolean;
  /** Error message if any */
  error?: string;
}

/**
 * Booking context state
 */
export interface BookingContextState {
  /** Current booking flow state */
  flowState: BookingFlowState;
  /** Recent bookings for current user */
  recentBookings: Booking[];
  /** Upcoming bookings for current user */
  upcomingBookings: Booking[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Booking context actions
 */
export interface BookingContextActions {
  /** Start a new booking flow */
  startBookingFlow: (rentalObjectId: string, mode?: BookingMode) => void;
  /** Update booking flow state */
  updateFlowState: (updates: Partial<BookingFlowState>) => void;
  /** Go to next step in wizard */
  nextStep: () => void;
  /** Go to previous step in wizard */
  prevStep: () => void;
  /** Go to specific step */
  goToStep: (step: BookingWizardStep) => void;
  /** Set time selection */
  setSelection: (selection: BookingSelectionDTO) => void;
  /** Reset booking flow */
  resetFlow: () => void;
  /** Complete booking (submit) */
  completeBooking: () => Promise<Booking | null>;
  /** Cancel an existing booking */
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
  /** Refresh bookings data */
  refreshBookings: () => void;
}

/**
 * Combined booking context value
 */
export interface BookingContextValue extends BookingContextState, BookingContextActions {}

// Default flow state
const defaultFlowState: BookingFlowState = {
  currentStep: 'select-time',
  rentalObjectId: null,
  mode: 'SINGLE_SLOT',
  selection: null,
  isComplete: false,
};

// Step order for navigation
const STEP_ORDER: BookingWizardStep[] = [
  'select-time',
  'select-extras',
  'confirm-details',
  'payment',
  'confirmation',
];

// Context
const BookingContext = createContext<BookingContextValue | undefined>(undefined);

/**
 * BookingContextProvider Props
 */
export interface BookingContextProviderProps {
  /** Children to render */
  children: React.ReactNode;
  /** Initial rental object ID to start booking flow */
  initialRentalObjectId?: string;
  /** Initial booking mode */
  initialMode?: BookingMode;
  /** Skip payment step (for free resources) */
  skipPayment?: boolean;
}

/**
 * BookingContextProvider
 *
 * Domain-specific provider for managing booking flows and state in the Digilist platform.
 * This provider handles:
 *
 * 1. **Booking Flow Management** - Multi-step wizard state
 * 2. **Time Selection** - Single slot, recurring, and in-game modes
 * 3. **Booking CRUD** - Create and cancel operations
 * 4. **User Bookings** - Recent and upcoming bookings
 *
 * @example Basic Usage
 * ```tsx
 * import { BookingContextProvider, useBookingContext } from '@digilist/runtime';
 *
 * function BookingPage() {
 *   return (
 *     <BookingContextProvider initialRentalObjectId="venue-123">
 *       <BookingWizard />
 *     </BookingContextProvider>
 *   );
 * }
 *
 * function BookingWizard() {
 *   const { flowState, nextStep, setSelection } = useBookingContext();
 *
 *   return (
 *     <div>
 *       <p>Step: {flowState.currentStep}</p>
 *       {flowState.currentStep === 'select-time' && (
 *         <TimeSelector onSelect={setSelection} />
 *       )}
 *       <button onClick={nextStep}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const BookingContextProvider: React.FC<BookingContextProviderProps> = ({
  children,
  initialRentalObjectId,
  initialMode = 'SINGLE_SLOT',
  skipPayment = false,
}) => {
  // Flow state
  const [flowState, setFlowState] = useState<BookingFlowState>(() => ({
    ...defaultFlowState,
    rentalObjectId: initialRentalObjectId ?? null,
    mode: initialMode,
  }));

  // Get user's bookings from SDK
  const {
    data: myBookingsData,
    isLoading: isLoadingMyBookings,
    error: myBookingsError,
    refetch: refetchMyBookings,
  } = useMyBookings();

  // Mutations
  const createBookingMutation = useCreateBooking();
  const cancelBookingMutation = useCancelBooking();

  // Compute recent and upcoming bookings
  const bookings = myBookingsData?.data ?? [];
  const now = new Date();

  const recentBookings = useMemo(
    () =>
      bookings
        .filter((b) => new Date(b.endTime) < now)
        .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
        .slice(0, 5),
    [bookings, now]
  );

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter((b) => new Date(b.startTime) >= now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [bookings, now]
  );

  // Actions
  const startBookingFlow = useCallback((rentalObjectId: string, mode: BookingMode = 'SINGLE_SLOT') => {
    setFlowState({
      ...defaultFlowState,
      rentalObjectId,
      mode,
    });
  }, []);

  const updateFlowState = useCallback((updates: Partial<BookingFlowState>) => {
    setFlowState((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setFlowState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      let nextIndex = currentIndex + 1;

      // Skip payment step if configured
      if (skipPayment && STEP_ORDER[nextIndex] === 'payment') {
        nextIndex++;
      }

      if (nextIndex < STEP_ORDER.length) {
        return { ...prev, currentStep: STEP_ORDER[nextIndex] };
      }
      return prev;
    });
  }, [skipPayment]);

  const prevStep = useCallback(() => {
    setFlowState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      let prevIndex = currentIndex - 1;

      // Skip payment step if configured
      if (skipPayment && STEP_ORDER[prevIndex] === 'payment') {
        prevIndex--;
      }

      if (prevIndex >= 0) {
        return { ...prev, currentStep: STEP_ORDER[prevIndex] };
      }
      return prev;
    });
  }, [skipPayment]);

  const goToStep = useCallback((step: BookingWizardStep) => {
    setFlowState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setSelection = useCallback((selection: BookingSelectionDTO) => {
    setFlowState((prev) => ({
      ...prev,
      selection,
      rentalObjectId: selection.rentalObjectId ?? prev.rentalObjectId,
      mode: selection.mode,
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setFlowState(defaultFlowState);
  }, []);

  const completeBooking = useCallback(async (): Promise<Booking | null> => {
    const { selection, rentalObjectId, purpose, attendees, notes, organizationId, visibility } = flowState;

    if (!selection || !rentalObjectId) {
      setFlowState((prev) => ({ ...prev, error: 'Missing booking selection' }));
      return null;
    }

    try {
      const result = await createBookingMutation.mutateAsync({
        rentalObjectId,
        startTime: selection.startTime,
        endTime: selection.endTime,
        purpose,
        attendees,
        notes,
        organizationId,
        visibility,
        metadata: {
          attendees,
          recurring: selection.mode === 'RECURRING',
          frequency: selection.frequency,
          weekdays: selection.weekdays,
        },
      });

      setFlowState((prev) => ({
        ...prev,
        isComplete: true,
        currentStep: 'confirmation',
      }));

      // Refresh bookings
      refetchMyBookings();

      return result.data;
    } catch (error) {
      setFlowState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      }));
      return null;
    }
  }, [flowState, createBookingMutation, refetchMyBookings]);

  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string): Promise<boolean> => {
      try {
        await cancelBookingMutation.mutateAsync({ id: bookingId, data: reason ? { reason } : undefined });
        refetchMyBookings();
        return true;
      } catch {
        return false;
      }
    },
    [cancelBookingMutation, refetchMyBookings]
  );

  const refreshBookings = useCallback(() => {
    refetchMyBookings();
  }, [refetchMyBookings]);

  // Combined loading and error states
  const isLoading = isLoadingMyBookings || createBookingMutation.isPending || cancelBookingMutation.isPending;
  const error = myBookingsError ?? createBookingMutation.error ?? cancelBookingMutation.error ?? null;

  // Memoized context value
  const value = useMemo<BookingContextValue>(
    () => ({
      // State
      flowState,
      recentBookings,
      upcomingBookings,
      isLoading,
      error: error instanceof Error ? error : error ? new Error(String(error)) : null,
      // Actions
      startBookingFlow,
      updateFlowState,
      nextStep,
      prevStep,
      goToStep,
      setSelection,
      resetFlow,
      completeBooking,
      cancelBooking,
      refreshBookings,
    }),
    [
      flowState,
      recentBookings,
      upcomingBookings,
      isLoading,
      error,
      startBookingFlow,
      updateFlowState,
      nextStep,
      prevStep,
      goToStep,
      setSelection,
      resetFlow,
      completeBooking,
      cancelBooking,
      refreshBookings,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

BookingContextProvider.displayName = 'BookingContextProvider';

/**
 * Hook to access booking context
 *
 * @throws Error if used outside BookingContextProvider
 */
export const useBookingContext = (): BookingContextValue => {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error('useBookingContext must be used within BookingContextProvider');
  }

  return context;
};

/**
 * Hook to access booking context (optional)
 * Returns undefined if not within provider
 */
export const useBookingContextOptional = (): BookingContextValue | undefined => {
  return useContext(BookingContext);
};

export default BookingContextProvider;
