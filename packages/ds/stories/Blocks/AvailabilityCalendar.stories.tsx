import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AvailabilityCalendar, Button, Card, Heading, Paragraph } from '@xala/ds';
import type { TimeSlot, TimeSlotStatus } from '../../src/types/listing-detail';

/**
 * AvailabilityCalendar is a weekly calendar grid component for booking time slots.
 *
 * ## Features
 * - Week view with 7-day grid
 * - Time slots with availability status
 * - Multi-selection support
 * - Week navigation
 * - Legend with status explanation
 * - Norwegian localization
 *
 * ## Accessibility
 * - Keyboard navigable slots
 * - ARIA labels for screen readers
 * - Focus management
 * - Status announcements
 */
const meta: Meta<typeof AvailabilityCalendar> = {
  title: 'Blocks/AvailabilityCalendar',
  component: AvailabilityCalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
AvailabilityCalendar provides a weekly view for selecting available time slots.

## Use Cases
- Booking sports halls and facilities
- Meeting room reservations
- Equipment rentals
- Service appointments

## Status Types
- **available** (green): Can be booked
- **occupied** (red): Already booked
- **selected** (blue): Currently selected
- **unavailable** (gray): Cannot be booked

## data-testid
- Grid: \`data-testid="availability-calendar"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AvailabilityCalendar>;

// Helper to generate time slots for a week
function generateTimeSlots(
  startDate: Date,
  startHour: number = 8,
  endHour: number = 17
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const statuses: TimeSlotStatus[] = ['available', 'available', 'occupied', 'available', 'unavailable'];

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);

    for (let hour = startHour; hour <= endHour; hour++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]!;
      slots.push({
        id: `slot-${day}-${hour}`,
        date: date,
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
        status: randomStatus,
      });
    }
  }

  return slots;
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

// Interactive wrapper for stories
const CalendarDemo = ({
  initialSlots,
  ...props
}: Partial<React.ComponentProps<typeof AvailabilityCalendar>> & { initialSlots?: TimeSlot[] }) => {
  const [startDate, setStartDate] = useState(getWeekStart());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(
    initialSlots || generateTimeSlots(startDate)
  );
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setStartDate(newDate);
    setTimeSlots(generateTimeSlots(newDate));
    setSelectedSlots([]);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const isSelected = prev.some(
        (s) =>
          new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
          s.startTime === slot.startTime
      );
      if (isSelected) {
        return prev.filter(
          (s) =>
            !(
              new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
              s.startTime === slot.startTime
            )
        );
      }
      return [...prev, slot];
    });
  };

  return (
    <AvailabilityCalendar
      startDate={startDate}
      timeSlots={timeSlots}
      selectedSlots={selectedSlots}
      onSlotClick={handleSlotClick}
      onWeekChange={handleWeekChange}
      {...props}
    />
  );
};

/**
 * Default availability calendar with week view
 */
export const Default: Story = {
  render: () => <CalendarDemo />,
};

/**
 * Calendar without tips panel (compact view)
 */
export const WithoutTips: Story = {
  render: () => <CalendarDemo showTips={false} />,
};

/**
 * Calendar with extended hours (6:00 - 22:00)
 */
export const ExtendedHours: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const extendedSlots = generateTimeSlots(weekStart, 6, 22);

    return (
      <CalendarDemo
        initialSlots={extendedSlots}
        startHour={6}
        endHour={22}
        title="Treningssenter - Tilgjengelighet"
      />
    );
  },
};

/**
 * Calendar with all available slots
 */
export const AllAvailable: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots: TimeSlot[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);

      for (let hour = 8; hour <= 17; hour++) {
        slots.push({
          id: `slot-${day}-${hour}`,
          date: date,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: 'available',
        });
      }
    }

    return <CalendarDemo initialSlots={slots} title="Alle tider ledige" />;
  },
};

/**
 * Fully booked calendar
 */
export const FullyBooked: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots: TimeSlot[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);

      for (let hour = 8; hour <= 17; hour++) {
        slots.push({
          id: `slot-${day}-${hour}`,
          date: date,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: 'occupied',
        });
      }
    }

    return <CalendarDemo initialSlots={slots} title="Fullt booket" />;
  },
};

/**
 * Calendar with weekend closed
 */
export const WeekendClosed: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots: TimeSlot[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      for (let hour = 8; hour <= 17; hour++) {
        slots.push({
          id: `slot-${day}-${hour}`,
          date: date,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: isWeekend ? 'unavailable' : 'available',
        });
      }
    }

    return <CalendarDemo initialSlots={slots} title="Stengt i helgen" />;
  },
};

/**
 * Real use case: Sports hall booking
 */
export const SportsHallBooking: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots: TimeSlot[] = [];

    // Realistic pattern: some booked, some available
    const bookingPattern: Record<number, number[]> = {
      0: [10, 11, 16, 17], // Monday bookings
      1: [9, 10, 14, 15, 16], // Tuesday bookings
      2: [11, 12, 13], // Wednesday bookings
      3: [8, 9, 10, 15, 16, 17], // Thursday bookings
      4: [14, 15, 16, 17], // Friday bookings
      5: [], // Saturday - all closed
      6: [], // Sunday - all closed
    };

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const isWeekend = day === 5 || day === 6;
      const bookedHours = bookingPattern[day] || [];

      for (let hour = 8; hour <= 17; hour++) {
        let status: TimeSlotStatus = 'available';
        if (isWeekend) {
          status = 'unavailable';
        } else if (bookedHours.includes(hour)) {
          status = 'occupied';
        }

        slots.push({
          id: `slot-${day}-${hour}`,
          date: date,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status,
        });
      }
    }

    return <CalendarDemo initialSlots={slots} title="Idrettshall A - Booking" />;
  },
};

/**
 * Calendar with pre-selected slots
 */
export const WithPreselectedSlots: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots: TimeSlot[] = [];
    const preselectedSlots: TimeSlot[] = [];

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);

      for (let hour = 8; hour <= 17; hour++) {
        const slot: TimeSlot = {
          id: `slot-${day}-${hour}`,
          date: date,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          status: 'available',
        };
        slots.push(slot);

        // Pre-select some slots on Wednesday
        if (day === 2 && (hour === 10 || hour === 11 || hour === 12)) {
          preselectedSlots.push(slot);
        }
      }
    }

    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(preselectedSlots);
    const [startDate, setStartDate] = useState(weekStart);
    const [timeSlots] = useState(slots);

    const handleSlotClick = (slot: TimeSlot) => {
      setSelectedSlots((prev) => {
        const isSelected = prev.some(
          (s) =>
            new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
            s.startTime === slot.startTime
        );
        if (isSelected) {
          return prev.filter(
            (s) =>
              !(
                new Date(s.date).toDateString() === new Date(slot.date).toDateString() &&
                s.startTime === slot.startTime
              )
          );
        }
        return [...prev, slot];
      });
    };

    const handleWeekChange = (direction: 'prev' | 'next') => {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      setStartDate(newDate);
    };

    return (
      <div>
        <AvailabilityCalendar
          startDate={startDate}
          timeSlots={timeSlots}
          selectedSlots={selectedSlots}
          onSlotClick={handleSlotClick}
          onWeekChange={handleWeekChange}
          title="Med forhåndsvalgte tider"
        />
        {selectedSlots.length > 0 && (
          <Card style={{ marginTop: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              Valgte tidspunkter ({selectedSlots.length})
            </Heading>
            <ul style={{ margin: 'var(--ds-spacing-2) 0', paddingLeft: 'var(--ds-spacing-4)' }}>
              {selectedSlots.map((slot) => (
                <li key={slot.id}>
                  {new Date(slot.date).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'short' })} kl {slot.startTime}
                </li>
              ))}
            </ul>
            <Button>Gå til neste steg</Button>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * Custom title and description
 */
export const CustomTitle: Story = {
  render: () => (
    <CalendarDemo
      title="Møterom Fjorden"
      showTips={true}
    />
  ),
};

/**
 * Compact morning-only calendar
 */
export const MorningOnly: Story = {
  render: () => {
    const weekStart = getWeekStart();
    const slots = generateTimeSlots(weekStart, 6, 12);

    return (
      <CalendarDemo
        initialSlots={slots}
        startHour={6}
        endHour={12}
        title="Morgenbooking"
        showTips={false}
      />
    );
  },
};
