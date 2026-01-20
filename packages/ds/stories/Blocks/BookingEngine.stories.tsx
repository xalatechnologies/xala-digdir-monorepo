import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card, Paragraph } from '@xala/ds';
import { UnifiedBookingEngine } from '../../src/blocks/booking-engine/UnifiedBookingEngine';
import type {
  BookingConfig,
  BookingSelection,
  BookingFormData,
  AvailabilitySlot,
  DayAvailability,
} from '../../src/types/booking';
import type { AdditionalService } from '../../src/types/listing-detail';

/**
 * UnifiedBookingEngine is a comprehensive booking system that adapts to all rental object types.
 *
 * ## Supported Modes
 * - **slots**: Hourly time slots (meeting rooms, sports halls)
 * - **daily**: Full day booking (conference rooms, outdoor spaces)
 * - **dateRange**: Multi-day range (vehicles, equipment rental)
 * - **event**: Event/ticket based (workshops, classes)
 * - **recurring**: Seasonal/recurring (sports clubs weekly slot)
 * - **instant**: Instant booking without calendar (digital services)
 *
 * ## Features
 * - Mode-specific calendar views
 * - Price calculation with fees and discounts
 * - Multi-step booking flow
 * - Form validation
 * - Confirmation step
 *
 * ## Accessibility
 * - Keyboard navigation
 * - ARIA labels
 * - Focus management
 * - Screen reader support
 */
const meta: Meta<typeof UnifiedBookingEngine> = {
  title: 'Blocks/BookingEngine',
  component: UnifiedBookingEngine,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
UnifiedBookingEngine provides a complete booking experience for all listing types.

## Booking Modes
- **slots**: Time slot selection with weekly calendar
- **daily**: Day selection with monthly calendar
- **dateRange**: Date range picker for multi-day bookings
- **event**: Ticket-based booking for events
- **recurring**: Pattern-based recurring bookings
- **instant**: Quick booking without calendar

## Steps
1. Selection (mode-specific)
2. Contact details form
3. Confirmation
4. Success

## data-testid
- Engine: \`data-testid="unified-booking-engine"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UnifiedBookingEngine>;

// Helper: Generate availability slots for a week
function generateWeekSlots(startDate: Date): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const statuses: Array<'available' | 'occupied' | 'blocked'> = ['available', 'available', 'available', 'occupied', 'blocked'];

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (let hour = 8; hour < 20; hour++) {
      const status = isWeekend
        ? 'blocked'
        : statuses[Math.floor(Math.random() * statuses.length)]!;

      slots.push({
        id: `slot-${day}-${hour}`,
        date: new Date(date),
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        status,
      });
    }
  }

  return slots;
}

// Helper: Generate day availability for a month
function generateMonthAvailability(startDate: Date): DayAvailability[] {
  const days: DayAvailability[] = [];
  const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const random = Math.random();

    let status: 'open' | 'full' | 'limited' | 'closed' = 'open';
    let availableSlots = 10;

    if (isWeekend) {
      status = 'closed';
      availableSlots = 0;
    } else if (random > 0.9) {
      status = 'full';
      availableSlots = 0;
    } else if (random > 0.7) {
      status = 'limited';
      availableSlots = 3;
    }

    days.push({
      date,
      isAvailable: status !== 'closed' && status !== 'full',
      availableSlots,
      totalSlots: 10,
      status,
    });
  }

  return days;
}

// Get Monday of current week
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Base config for slots mode
const slotsConfig: BookingConfig = {
  listingId: 'listing-1',
  listingType: 'SPACE',
  mode: 'slots',
  slotDurationMinutes: 60,
  pricing: {
    basePrice: 500,
    currency: 'NOK',
    unit: 'hour',
    vatPercentage: 25,
  },
  rules: {
    requireApproval: false,
    minLeadTimeHours: 2,
    maxAdvanceDays: 90,
    cancellationPolicy: 'flexible',
    freeCancellationHours: 24,
    maxAttendees: 50,
  },
  schedule: [
    { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '20:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '20:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '20:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '20:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '20:00' },
    { dayOfWeek: 6, isOpen: false },
    { dayOfWeek: 0, isOpen: false },
  ],
};

// Daily mode config
const dailyConfig: BookingConfig = {
  ...slotsConfig,
  listingType: 'RESOURCE',
  mode: 'daily',
  pricing: {
    basePrice: 2000,
    currency: 'NOK',
    unit: 'day',
    vatPercentage: 25,
    cleaningFee: 500,
  },
};

// Date range config
const dateRangeConfig: BookingConfig = {
  ...slotsConfig,
  listingType: 'VEHICLE',
  mode: 'dateRange',
  pricing: {
    basePrice: 1500,
    currency: 'NOK',
    unit: 'day',
    vatPercentage: 25,
    setupFee: 200,
  },
};

// Event config
const eventConfig: BookingConfig = {
  ...slotsConfig,
  listingType: 'EVENT',
  mode: 'event',
  eventCapacity: 50,
  eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
  pricing: {
    basePrice: 299,
    currency: 'NOK',
    unit: 'person',
    perPerson: true,
    vatPercentage: 25,
  },
  rules: {
    ...slotsConfig.rules,
    minAttendees: 5,
    maxAttendees: 50,
  },
};

// Recurring config
const recurringConfig: BookingConfig = {
  ...slotsConfig,
  mode: 'recurring',
  pricing: {
    basePrice: 400,
    currency: 'NOK',
    unit: 'hour',
    memberDiscount: 20,
    vatPercentage: 25,
  },
};

// Additional services
const additionalServices: AdditionalService[] = [
  { id: 'service-1', name: 'Kaffeservering', description: 'Kaffe, te og småkaker', price: 150 },
  { id: 'service-2', name: 'Projektor', description: 'HD projektor med lerret', price: 200 },
  { id: 'service-3', name: 'Lydanlegg', description: 'PA-system med mikrofoner', price: 500 },
  { id: 'service-4', name: 'Rengjøring', description: 'Profesjonell rengjøring', price: 750 },
];

/**
 * Slot-based booking (meeting rooms, sports halls)
 */
export const SlotsMode: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const weekStart = getWeekStart();
    const slots = generateWeekSlots(weekStart);

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Booking submitted:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={slotsConfig}
        rentalObjectName="Idrettshall A"
        availableSlots={slots}
        additionalServices={additionalServices}
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
        onSelectionChange={(sel) => console.log('Selection:', sel)}
      />
    );
  },
};

/**
 * Daily booking (conference rooms, outdoor spaces)
 */
export const DailyMode: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const today = new Date();
    const dayAvailability = generateMonthAvailability(today);

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Booking submitted:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={dailyConfig}
        rentalObjectName="Konferanserom Solstua"
        dayAvailability={dayAvailability}
        additionalServices={additionalServices}
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Date range booking (vehicles, equipment rental)
 */
export const DateRangeMode: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const today = new Date();
    const dayAvailability = generateMonthAvailability(today);

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Booking submitted:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={dateRangeConfig}
        rentalObjectName="Varebil - Ford Transit"
        dayAvailability={dayAvailability}
        additionalServices={additionalServices.slice(0, 2)}
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Event booking (workshops, classes)
 */
export const EventMode: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Booking submitted:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={eventConfig}
        rentalObjectName="Workshop: Introduksjon til 3D-printing"
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Recurring booking (seasonal, weekly slots)
 */
export const RecurringMode: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Booking submitted:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={recurringConfig}
        rentalObjectName="Idrettshall A - Sesongleie"
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Sports hall booking (realistic scenario)
 */
export const SportsHallBooking: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const weekStart = getWeekStart();

    // Generate realistic sports hall availability
    const slots: AvailabilitySlot[] = [];
    const bookingPattern: Record<number, number[]> = {
      0: [10, 11, 16, 17, 18], // Monday
      1: [9, 10, 14, 15, 16, 17], // Tuesday
      2: [11, 12, 13, 18, 19], // Wednesday
      3: [8, 9, 10, 15, 16, 17, 18], // Thursday
      4: [14, 15, 16, 17, 18, 19], // Friday
    };

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const bookedHours = bookingPattern[dayOfWeek === 0 ? 6 : dayOfWeek - 1] || [];

      for (let hour = 8; hour <= 21; hour++) {
        let status: 'available' | 'occupied' | 'blocked' = 'available';
        if (isWeekend) {
          status = 'blocked';
        } else if (bookedHours.includes(hour)) {
          status = 'occupied';
        }

        slots.push({
          id: `slot-${day}-${hour}`,
          date: new Date(date),
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status,
        });
      }
    }

    const sportsHallConfig: BookingConfig = {
      listingId: 'sports-hall-a',
      listingType: 'SPACE',
      mode: 'slots',
      slotDurationMinutes: 60,
      pricing: {
        basePrice: 750,
        currency: 'NOK',
        unit: 'hour',
        weekendMultiplier: 1.5,
        eveningMultiplier: 1.2,
        vatPercentage: 25,
      },
      rules: {
        requireApproval: false,
        minLeadTimeHours: 4,
        maxAdvanceDays: 60,
        cancellationPolicy: 'moderate',
        freeCancellationHours: 48,
        maxAttendees: 200,
        allowSameDayBooking: true,
      },
      schedule: [
        { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '22:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '22:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '22:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '22:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '22:00' },
        { dayOfWeek: 6, isOpen: false },
        { dayOfWeek: 0, isOpen: false },
      ],
      activityTypes: ['training', 'match', 'event', 'meeting'],
    };

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Sports hall booking:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    return (
      <div>
        <Card style={{ marginBottom: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)', backgroundColor: 'var(--ds-color-accent-surface-default)' }}>
          <Paragraph data-size="sm" style={{ margin: 0 }}>
            <strong>Demo:</strong> Dette er en realistisk booking-opplevelse for en idrettshall.
            Velg tidspunkter, fyll ut kontaktskjema, og bekreft bookingen.
          </Paragraph>
        </Card>
        <UnifiedBookingEngine
          config={sportsHallConfig}
          rentalObjectName="Idrettshall A - Hovedhallen"
          rentalObjectImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
          availableSlots={slots}
          additionalServices={[
            { id: 's1', name: 'Garderobe', description: 'Tilgang til garderobe og dusj', price: 100 },
            { id: 's2', name: 'Utstyrslager', description: 'Tilgang til utstyrslager', price: 150 },
            { id: 's3', name: 'Resultattavle', description: 'Bruk av elektronisk resultattavle', price: 200 },
          ]}
          currentStep={step}
          onStepChange={setStep}
          onSubmit={handleSubmit}
        />
      </div>
    );
  },
};

/**
 * Cabin booking (multi-day range)
 */
export const CabinBooking: Story = {
  render: () => {
    const [step, setStep] = useState(0);
    const today = new Date();

    // Generate cabin availability with some booked periods
    const dayAvailability: DayAvailability[] = [];
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const bookedRanges = [
      { start: 5, end: 8 },
      { start: 15, end: 18 },
      { start: 25, end: 27 },
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const isBooked = bookedRanges.some(range => day >= range.start && day <= range.end);

      dayAvailability.push({
        date,
        isAvailable: !isBooked,
        availableSlots: isBooked ? 0 : 1,
        totalSlots: 1,
        status: isBooked ? 'full' : 'open',
      });
    }

    const cabinConfig: BookingConfig = {
      listingId: 'cabin-1',
      listingType: 'SPACE',
      mode: 'dateRange',
      pricing: {
        basePrice: 1200,
        currency: 'NOK',
        unit: 'day',
        cleaningFee: 750,
        vatPercentage: 25,
      },
      rules: {
        requireApproval: true,
        minLeadTimeHours: 48,
        maxAdvanceDays: 365,
        cancellationPolicy: 'moderate',
        freeCancellationHours: 72,
        maxAttendees: 8,
      },
      schedule: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        isOpen: true,
        openTime: '15:00',
        closeTime: '11:00',
      })),
    };

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Cabin booking:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={cabinConfig}
        rentalObjectName="Fjellhytte Solheim"
        rentalObjectImage="https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800"
        dayAvailability={dayAvailability}
        additionalServices={[
          { id: 'wood', name: 'Ved', description: 'Ferdig oppkuttet ved for peisen', price: 250 },
          { id: 'bedding', name: 'Sengetøy', description: 'Ferdig oppredd senger', price: 400 },
          { id: 'final-cleaning', name: 'Sluttrengjøring', description: 'Profesjonell sluttrengjøring', price: 1500 },
        ]}
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Workshop event booking
 */
export const WorkshopBooking: Story = {
  render: () => {
    const [step, setStep] = useState(0);

    const workshopConfig: BookingConfig = {
      listingId: 'workshop-3dprint',
      listingType: 'EVENT',
      mode: 'event',
      eventCapacity: 20,
      eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      pricing: {
        basePrice: 450,
        currency: 'NOK',
        unit: 'person',
        perPerson: true,
        vatPercentage: 25,
      },
      rules: {
        requireApproval: false,
        minLeadTimeHours: 24,
        maxAdvanceDays: 60,
        cancellationPolicy: 'flexible',
        freeCancellationHours: 48,
        minAttendees: 3,
        maxAttendees: 20,
      },
      schedule: [],
    };

    const handleSubmit = async (selection: BookingSelection, formData: BookingFormData) => {
      console.log('Workshop booking:', { selection, formData });
      await new Promise(resolve => setTimeout(resolve, 1500));
    };

    return (
      <UnifiedBookingEngine
        config={workshopConfig}
        rentalObjectName="Workshop: Introduksjon til 3D-printing"
        rentalObjectImage="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"
        additionalServices={[
          { id: 'materials', name: 'Materiale-pakke', description: 'PLA filament og ekstra verktøy', price: 150 },
        ]}
        currentStep={step}
        onStepChange={setStep}
        onSubmit={handleSubmit}
      />
    );
  },
};

/**
 * Step-by-step flow demonstration (Form step)
 */
export const FormStep: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots = generateWeekSlots(weekStart);

    // Pre-select some slots
    const preselectedSlots = slots
      .filter(s => s.status === 'available')
      .slice(0, 3)
      .map(s => ({ ...s, status: 'selected' as const }));

    return (
      <UnifiedBookingEngine
        config={slotsConfig}
        rentalObjectName="Idrettshall A"
        availableSlots={slots}
        additionalServices={additionalServices}
        currentStep={1}
        onStepChange={(step) => console.log('Step:', step)}
        onSubmit={async () => {}}
      />
    );
  },
};

/**
 * Step-by-step flow demonstration (Confirmation step)
 */
export const ConfirmationStep: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots = generateWeekSlots(weekStart);

    return (
      <UnifiedBookingEngine
        config={slotsConfig}
        rentalObjectName="Idrettshall A"
        availableSlots={slots}
        additionalServices={additionalServices}
        currentStep={2}
        onStepChange={(step) => console.log('Step:', step)}
        onSubmit={async () => {}}
      />
    );
  },
};

/**
 * All booking modes comparison
 */
export const ModeComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-spacing-8)' }}>
      <Card style={{ padding: 'var(--ds-spacing-4)' }}>
        <Paragraph style={{ fontWeight: 'var(--ds-font-weight-semibold)', marginBottom: 'var(--ds-spacing-2)' }}>
          Available Booking Modes
        </Paragraph>
        <ul style={{ margin: 0, paddingLeft: 'var(--ds-spacing-5)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          <li><strong>slots</strong> - Timebooking med ukeskalender</li>
          <li><strong>daily</strong> - Dagsbooking med månedskalender</li>
          <li><strong>dateRange</strong> - Periodebasert booking</li>
          <li><strong>event</strong> - Billettbasert for arrangementer</li>
          <li><strong>recurring</strong> - Gjentakende booking (sesongleie)</li>
          <li><strong>instant</strong> - Umiddelbar booking uten kalender</li>
        </ul>
      </Card>
      <Paragraph data-size="sm" style={{ color: 'var(--ds-color-neutral-text-subtle)' }}>
        Se de individuelle stories for å prøve hver booking-modus.
      </Paragraph>
    </div>
  ),
};
