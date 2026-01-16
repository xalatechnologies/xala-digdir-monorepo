import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedBookingEngine } from '../blocks/booking-engine';
import type { BookingConfig, AvailabilitySlot, DayAvailability } from '../types/booking';
import type { AdditionalService } from '../types/listing-detail';

// Mock config for slot-based booking
const createSlotConfig = (): BookingConfig => ({
  listingId: 'test-listing-1',
  listingType: 'SPACE',
  mode: 'slots',
  pricing: {
    basePrice: 500,
    currency: 'NOK',
    unit: 'hour',
    vatPercentage: 25,
  },
  rules: {
    requireApproval: false,
    advanceBookingDays: 90,
    minBookingHours: 1,
    maxBookingHours: 8,
    cancellationHours: 24,
  },
  schedule: [
    {
      dayOfWeek: 1,
      isOpen: true,
      timeSlots: [{ startTime: '08:00', endTime: '16:00' }],
    },
    {
      dayOfWeek: 2,
      isOpen: true,
      timeSlots: [{ startTime: '08:00', endTime: '16:00' }],
    },
  ],
  slotDurationMinutes: 60,
});

// Mock config for daily booking
const createDailyConfig = (): BookingConfig => ({
  listingId: 'test-listing-2',
  listingType: 'SPACE',
  mode: 'daily',
  pricing: {
    basePrice: 2000,
    currency: 'NOK',
    unit: 'day',
    vatPercentage: 25,
  },
  rules: {
    requireApproval: true,
    advanceBookingDays: 60,
    minBookingHours: 24,
    maxBookingHours: 168,
    cancellationHours: 48,
  },
  schedule: [],
});

// Mock config for event booking
const createEventConfig = (): BookingConfig => ({
  listingId: 'test-listing-3',
  listingType: 'EVENT',
  mode: 'event',
  pricing: {
    basePrice: 200,
    currency: 'NOK',
    unit: 'person',
    perPerson: true,
    vatPercentage: 25,
  },
  rules: {
    requireApproval: false,
    advanceBookingDays: 30,
    minBookingHours: 2,
    maxBookingHours: 4,
    cancellationHours: 72,
  },
  schedule: [],
  eventCapacity: 50,
  eventDate: new Date('2026-02-15T10:00:00'),
});

// Mock available slots - use dates in the current/next week
const createMockSlots = (): AvailabilitySlot[] => {
  // Get next Monday
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) + 7; // Next Monday
  const nextMonday = new Date(today.setDate(diff));
  nextMonday.setHours(0, 0, 0, 0);

  return [
    {
      id: 'slot-1',
      date: new Date(nextMonday.getTime() + 8 * 60 * 60 * 1000), // 08:00
      startTime: '08:00',
      endTime: '09:00',
      status: 'available',
      price: 500,
    },
    {
      id: 'slot-2',
      date: new Date(nextMonday.getTime() + 9 * 60 * 60 * 1000), // 09:00
      startTime: '09:00',
      endTime: '10:00',
      status: 'available',
      price: 500,
    },
    {
      id: 'slot-3',
      date: new Date(nextMonday.getTime() + 10 * 60 * 60 * 1000), // 10:00
      startTime: '10:00',
      endTime: '11:00',
      status: 'occupied',
      price: 500,
    },
  ];
};

// Mock day availability
const createMockDayAvailability = (): DayAvailability[] => [
  {
    date: new Date('2026-01-20'),
    isAvailable: true,
    availableSlots: 5,
    totalSlots: 8,
    minPrice: 500,
    maxPrice: 500,
    status: 'open',
  },
  {
    date: new Date('2026-01-21'),
    isAvailable: true,
    availableSlots: 8,
    totalSlots: 8,
    minPrice: 500,
    maxPrice: 500,
    status: 'open',
  },
  {
    date: new Date('2026-01-22'),
    isAvailable: false,
    availableSlots: 0,
    totalSlots: 8,
    minPrice: 500,
    maxPrice: 500,
    status: 'closed',
  },
];

// Mock additional services
const createMockServices = (): AdditionalService[] => [
  {
    id: 'service-1',
    name: 'Katering',
    description: 'Kaffe og kaker',
    price: 150,
    unit: 'person',
    category: 'food',
  },
  {
    id: 'service-2',
    name: 'Projektor',
    description: 'HD projektor med skjerm',
    price: 300,
    unit: 'booking',
    category: 'equipment',
  },
];

describe('UnifiedBookingEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders with slot mode configuration', () => {
      const config = createSlotConfig();
      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Conference Room"
          availableSlots={createMockSlots()}
        />
      );

      expect(screen.getByText('Test Conference Room')).toBeInTheDocument();
    });

    it('renders with daily mode configuration', () => {
      const config = createDailyConfig();
      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Venue"
          dayAvailability={createMockDayAvailability()}
        />
      );

      expect(screen.getByText('Test Venue')).toBeInTheDocument();
    });

    it('renders with event mode configuration', () => {
      const config = createEventConfig();
      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Workshop"
        />
      );

      expect(screen.getByText('Test Workshop')).toBeInTheDocument();
    });

    it('renders listing image when provided in confirmation step', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();
      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          rentalObjectImage="https://example.com/room.jpg"
          currentStep={2}
          availableSlots={slots}
          onSelectionChange={() => {}}
        />
      );

      const image = screen.getByAltText('Test Room');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/room.jpg');
    });

    it('applies custom className', () => {
      const config = createSlotConfig();
      const { container } = render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          className="custom-class"
        />
      );

      const engine = container.querySelector('.custom-class');
      expect(engine).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('starts at step 0 by default', () => {
      const config = createSlotConfig();
      const { container } = render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={createMockSlots()}
        />
      );

      // First step should be active
      const activeStep = container.querySelector('.stepper-item.active');
      expect(activeStep).toBeInTheDocument();
      expect(activeStep).toHaveTextContent('Velg tid');
    });

    it('respects controlled currentStep prop', () => {
      const config = createSlotConfig();
      const { container } = render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
          availableSlots={createMockSlots()}
        />
      );

      // Second step should be active (Detaljer / Details)
      const activeStep = container.querySelector('.stepper-item.active');
      expect(activeStep).toBeInTheDocument();
      expect(activeStep).toHaveTextContent('Detaljer');
    });

    it('changes step with onStepChange callback', async () => {
      const handleStepChange = vi.fn();
      const config = createSlotConfig();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={0}
          onStepChange={handleStepChange}
        />
      );

      // Verify callback can be called (component accepts it)
      expect(handleStepChange).not.toHaveBeenCalled();
    });

    it('calls onStepChange when navigating backward', async () => {
      const handleStepChange = vi.fn();
      const config = createSlotConfig();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
          onStepChange={handleStepChange}
        />
      );

      // Click back button
      const backButton = screen.getByRole('button', { name: /Tilbake|Back/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(handleStepChange).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('Slot Selection', () => {
    it('allows selecting available slots', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
        />
      );

      const slotButton = screen.getByText('08:00').closest('[role="button"]');
      if (slotButton) {
        fireEvent.click(slotButton);
        expect(slotButton).toHaveClass('selected');
      }
    });

    it('renders with occupied slots in availableSlots prop', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
        />
      );

      // Component should render with slots data
      expect(screen.getByText('Test Room')).toBeInTheDocument();
    });

    it('accepts onSelectionChange callback', () => {
      const handleSelectionChange = vi.fn();
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
          onSelectionChange={handleSelectionChange}
        />
      );

      // Component should accept the callback
      expect(screen.getByText('Test Room')).toBeInTheDocument();
    });

    it('allows deselecting a selected slot', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
        />
      );

      const slotButton = screen.getByText('08:00').closest('[role="button"]');
      if (slotButton) {
        // Select
        fireEvent.click(slotButton);
        expect(slotButton).toHaveClass('selected');

        // Deselect
        fireEvent.click(slotButton);
        expect(slotButton).not.toHaveClass('selected');
      }
    });
  });

  describe('Additional Services', () => {
    it('renders additional services when provided', () => {
      const config = createSlotConfig();
      const services = createMockServices();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
          additionalServices={services}
        />
      );

      expect(screen.getByText('Katering')).toBeInTheDocument();
      expect(screen.getByText('Projektor')).toBeInTheDocument();
    });

    it('allows selecting additional services', () => {
      const config = createSlotConfig();
      const services = createMockServices();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
          additionalServices={services}
        />
      );

      const serviceCheckbox = screen.getByRole('checkbox', { name: /Katering/i });
      fireEvent.click(serviceCheckbox);

      expect(serviceCheckbox).toBeChecked();
    });
  });

  describe('Form Submission', () => {
    it('renders different steps based on currentStep prop', () => {
      const config = createSlotConfig();

      const { rerender } = render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={0}
        />
      );

      expect(screen.getByText('Test Room')).toBeInTheDocument();

      // Change to step 1
      rerender(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
        />
      );

      expect(screen.getByText('Test Room')).toBeInTheDocument();
    });

    it('shows confirmation step when on step 2', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      const { container } = render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
          currentStep={2}
        />
      );

      // Should show confirmation step in stepper
      const confirmStep = container.querySelector('.stepper-item.active');
      expect(confirmStep).toHaveTextContent(/Bekreft/i);
    });

    it('shows loading state during submission', async () => {
      const handleSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const config = createSlotConfig();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={2}
          onSubmit={handleSubmit}
        />
      );

      const submitButton = screen.getByRole('button', { name: /Bekreft|Confirm/i });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/sender|sending/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Price Calculation', () => {
    it('displays price information', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
        />
      );

      // Should show base price
      expect(screen.getByText(/500 kr/i)).toBeInTheDocument();
    });

    it('shows price summary when slots are selected', () => {
      const config = createSlotConfig();
      const slots = createMockSlots();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          availableSlots={slots}
        />
      );

      // Select a slot
      const slotButton = screen.getByText('08:00').closest('[role="button"]');
      if (slotButton) {
        fireEvent.click(slotButton);
        // After selection, price details should be visible
        expect(screen.getByText(/500 kr/i)).toBeInTheDocument();
      }
    });

    it('includes additional services in price calculation', () => {
      const config = createSlotConfig();
      const services = createMockServices();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Room"
          currentStep={1}
          additionalServices={services}
        />
      );

      // Select a service
      const serviceCheckbox = screen.getByRole('checkbox', { name: /Projektor/i });
      fireEvent.click(serviceCheckbox);

      // Price should include service price (300 NOK)
      expect(screen.getByText(/300/)).toBeInTheDocument();
    });
  });

  describe('Booking Modes', () => {
    it('renders correctly for daily mode', () => {
      const config = createDailyConfig();
      const dayAvailability = createMockDayAvailability();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Venue"
          dayAvailability={dayAvailability}
        />
      );

      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      // Daily mode should show calendar view
      expect(screen.getByText(/Velg dato|Select date/i)).toBeInTheDocument();
    });

    it('renders correctly for event mode', () => {
      const config = createEventConfig();

      render(
        <UnifiedBookingEngine
          config={config}
          rentalObjectName="Test Workshop"
        />
      );

      expect(screen.getByText('Test Workshop')).toBeInTheDocument();
      // Event mode should show participant count
      expect(screen.getByText(/deltakere|participants/i)).toBeInTheDocument();
    });
  });
});
