import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RentalObjectAvailabilityCalendar, Button, Card, Heading, Paragraph, Alert } from '@xalatechnologies/platform/ui';
import type {
  CalendarMode,
  CalendarCell,
  CalendarSelection,
  CalendarSlotStatus,
} from '../../src/types/listing-detail';
import { DEFAULT_CALENDAR_LEGEND } from '../../src/types/listing-detail';

/**
 * RentalObjectAvailabilityCalendar is a dynamic calendar component with multiple modes.
 *
 * ## Features
 * - Three calendar modes: TIME_SLOTS, ALL_DAY, MULTI_DAY
 * - API-driven cell data (no frontend transformation)
 * - Selection management with validation
 * - Loading and error states
 * - Tips panel with selection summary
 * - Norwegian localization
 *
 * ## Modes
 * - **TIME_SLOTS**: Week/day view with hourly slots
 * - **ALL_DAY**: Month view with day selection
 * - **MULTI_DAY**: Month view with date range picker
 *
 * ## Accessibility
 * - Full keyboard navigation
 * - ARIA labels and roles
 * - Status announcements
 * - Focus management
 */
const meta: Meta<typeof RentalObjectAvailabilityCalendar> = {
  title: 'Blocks/RentalObjectAvailabilityCalendar',
  component: RentalObjectAvailabilityCalendar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
RentalObjectAvailabilityCalendar is the primary calendar component for the booking engine.

## Use Cases
- Hourly facility booking (TIME_SLOTS)
- Full-day equipment rental (ALL_DAY)
- Multi-day accommodation booking (MULTI_DAY)
- Seasonal facility allocation

## Status Types
- **AVAILABLE**: Can be booked
- **RESERVED**: Temporarily held
- **BOOKED**: Confirmed booking
- **BLOCKED**: Admin blocked
- **BLACKOUT**: System unavailable
- **CLOSED**: Outside hours

## data-testid
- Calendar: \`data-testid="rental-object-availability-calendar"\`
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RentalObjectAvailabilityCalendar>;

// Helper to generate cells for TIME_SLOTS mode
function generateTimeSlotsData(
  startDate: Date,
  startHour: number = 8,
  endHour: number = 17
): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const weekStart = getWeekStart(startDate);
  const statuses: CalendarSlotStatus[] = ['AVAILABLE', 'AVAILABLE', 'BOOKED', 'AVAILABLE', 'CLOSED'];

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (let hour = startHour; hour <= endHour; hour++) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(date);
      end.setHours(hour + 1, 0, 0, 0);

      const status: CalendarSlotStatus = isWeekend
        ? 'CLOSED'
        : statuses[Math.floor(Math.random() * statuses.length)]!;

      cells.push({
        id: `cell-${day}-${hour}`,
        start: start.toISOString(),
        end: end.toISOString(),
        status,
        reasonKey: status !== 'AVAILABLE' ? `calendar.reason.${status.toLowerCase()}` : null,
      });
    }
  }

  return cells;
}

// Helper to generate cells for ALL_DAY mode
function generateAllDayData(date: Date): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const statuses: CalendarSlotStatus[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BOOKED', 'BLOCKED'];

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
    const start = new Date(cellDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(cellDate);
    end.setHours(23, 59, 59, 999);

    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
    const status: CalendarSlotStatus = isWeekend
      ? 'CLOSED'
      : statuses[Math.floor(Math.random() * statuses.length)]!;

    cells.push({
      id: `cell-${date.getMonth()}-${day}`,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      reasonKey: status !== 'AVAILABLE' ? `calendar.reason.${status.toLowerCase()}` : null,
    });
  }

  return cells;
}

// Helper to generate cells for MULTI_DAY mode (more availability)
function generateMultiDayData(date: Date): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(date.getFullYear(), date.getMonth(), day);
    const start = new Date(cellDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(cellDate);
    end.setHours(23, 59, 59, 999);

    // More availability for MULTI_DAY to demonstrate range selection
    const random = Math.random();
    let status: CalendarSlotStatus = 'AVAILABLE';
    if (random > 0.9) status = 'BOOKED';
    else if (random > 0.85) status = 'BLOCKED';

    cells.push({
      id: `cell-multiday-${date.getMonth()}-${day}`,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      reasonKey: status !== 'AVAILABLE' ? `calendar.reason.${status.toLowerCase()}` : null,
    });
  }

  return cells;
}

// Get Monday of current week
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Interactive wrapper for TIME_SLOTS mode
const TimeSlotsDemo = (props: Partial<React.ComponentProps<typeof RentalObjectAvailabilityCalendar>>) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cells, setCells] = useState<CalendarCell[]>(generateTimeSlotsData(currentDate));
  const [selection, setSelection] = useState<CalendarSelection>({
    cells: [],
    isValid: true,
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setCells(generateTimeSlotsData(date));
  };

  const handleCellClick = (cell: CalendarCell) => {
    setSelection((prev) => {
      const isSelected = prev.cells.some((c) => c.id === cell.id);
      const newCells = isSelected
        ? prev.cells.filter((c) => c.id !== cell.id)
        : [...prev.cells, cell];
      return { cells: newCells, isValid: true };
    });
  };

  return (
    <RentalObjectAvailabilityCalendar
      mode="TIME_SLOTS"
      cells={cells}
      currentDate={currentDate}
      selection={selection}
      onDateChange={handleDateChange}
      onCellClick={handleCellClick}
      legend={DEFAULT_CALENDAR_LEGEND}
      {...props}
    />
  );
};

// Interactive wrapper for ALL_DAY mode
const AllDayDemo = (props: Partial<React.ComponentProps<typeof RentalObjectAvailabilityCalendar>>) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cells, setCells] = useState<CalendarCell[]>(generateAllDayData(currentDate));
  const [selection, setSelection] = useState<CalendarSelection>({
    cells: [],
    isValid: true,
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setCells(generateAllDayData(date));
  };

  const handleCellClick = (cell: CalendarCell) => {
    setSelection((prev) => {
      const isSelected = prev.cells.some((c) => c.id === cell.id);
      const newCells = isSelected
        ? prev.cells.filter((c) => c.id !== cell.id)
        : [...prev.cells, cell];
      return { cells: newCells, isValid: true };
    });
  };

  return (
    <RentalObjectAvailabilityCalendar
      mode="ALL_DAY"
      cells={cells}
      currentDate={currentDate}
      selection={selection}
      onDateChange={handleDateChange}
      onCellClick={handleCellClick}
      legend={DEFAULT_CALENDAR_LEGEND}
      {...props}
    />
  );
};

// Interactive wrapper for MULTI_DAY mode
const MultiDayDemo = (props: Partial<React.ComponentProps<typeof RentalObjectAvailabilityCalendar>>) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cells, setCells] = useState<CalendarCell[]>(generateMultiDayData(currentDate));
  const [selection, setSelection] = useState<CalendarSelection>({
    cells: [],
    isValid: true,
  });

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setCells(generateMultiDayData(date));
  };

  const handleSelectionChange = (newSelection: CalendarSelection) => {
    setSelection(newSelection);
  };

  return (
    <RentalObjectAvailabilityCalendar
      mode="MULTI_DAY"
      cells={cells}
      currentDate={currentDate}
      selection={selection}
      onDateChange={handleDateChange}
      onSelectionChange={handleSelectionChange}
      legend={DEFAULT_CALENDAR_LEGEND}
      {...props}
    />
  );
};

/**
 * TIME_SLOTS mode - Week view with hourly slots
 */
export const TimeSlots: Story = {
  render: () => <TimeSlotsDemo title="Velg tid" subtitle="Klikk på ledige tidspunkter for å velge dem" />,
};

/**
 * ALL_DAY mode - Month view with day selection
 */
export const AllDay: Story = {
  render: () => <AllDayDemo title="Velg dato" subtitle="Velg en eller flere datoer" />,
};

/**
 * MULTI_DAY mode - Date range picker
 */
export const MultiDay: Story = {
  render: () => <MultiDayDemo title="Velg periode" subtitle="Velg start- og sluttdato" />,
};

/**
 * Without tips panel (compact view)
 */
export const WithoutTips: Story = {
  render: () => <TimeSlotsDemo showTips={false} title="Kompakt visning" />,
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => (
    <RentalObjectAvailabilityCalendar
      mode="TIME_SLOTS"
      cells={[]}
      currentDate={new Date()}
      isLoading={true}
      title="Laster tilgjengelighet"
    />
  ),
};

/**
 * Error state
 */
export const Error: Story = {
  render: () => (
    <RentalObjectAvailabilityCalendar
      mode="TIME_SLOTS"
      cells={[]}
      currentDate={new Date()}
      errorMessage="Kunne ikke hente tilgjengelighet. Prøv igjen senere."
      title="Tilgjengelighet"
    />
  ),
};

/**
 * With warning message
 */
export const WithWarning: Story = {
  render: () => (
    <TimeSlotsDemo
      title="Tilgjengelighet"
      warningMessage="Noen av dine valgte tidspunkter er ikke lenger tilgjengelige."
    />
  ),
};

/**
 * Read-only mode (view only)
 */
export const ReadOnly: Story = {
  render: () => (
    <TimeSlotsDemo
      title="Min booking"
      subtitle="Bookingen din er bekreftet"
      readOnly={true}
    />
  ),
};

/**
 * Extended hours (6:00 - 22:00)
 */
export const ExtendedHours: Story = {
  render: () => (
    <TimeSlotsDemo
      title="Treningssenter"
      subtitle="Åpent 06:00 - 22:00"
      startHour={6}
      endHour={22}
    />
  ),
};

/**
 * Morning only (06:00 - 12:00)
 */
export const MorningOnly: Story = {
  render: () => (
    <TimeSlotsDemo
      title="Morgentimer"
      startHour={6}
      endHour={12}
    />
  ),
};

/**
 * Sports hall booking scenario
 */
export const SportsHallBooking: Story = {
  render: () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selection, setSelection] = useState<CalendarSelection>({
      cells: [],
      isValid: true,
    });

    // Generate realistic booking pattern
    const cells: CalendarCell[] = [];
    const weekStart = getWeekStart(currentDate);

    const bookingPattern: Record<number, number[]> = {
      1: [10, 11, 16, 17], // Monday
      2: [9, 10, 14, 15, 16], // Tuesday
      3: [11, 12, 13], // Wednesday
      4: [8, 9, 10, 15, 16, 17], // Thursday
      5: [14, 15, 16, 17], // Friday
    };

    for (let day = 0; day < 7; day++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const bookedHours = bookingPattern[dayOfWeek] || [];

      for (let hour = 8; hour <= 21; hour++) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(date);
        end.setHours(hour + 1, 0, 0, 0);

        let status: CalendarSlotStatus = 'AVAILABLE';
        if (isWeekend) {
          status = 'CLOSED';
        } else if (bookedHours.includes(hour)) {
          status = 'BOOKED';
        }

        cells.push({
          id: `hall-${day}-${hour}`,
          start: start.toISOString(),
          end: end.toISOString(),
          status,
          reasonKey: status === 'BOOKED' ? 'calendar.reason.booked' : null,
          bookingId: status === 'BOOKED' ? `booking-${day}-${hour}` : null,
        });
      }
    }

    const handleCellClick = (cell: CalendarCell) => {
      setSelection((prev) => {
        const isSelected = prev.cells.some((c) => c.id === cell.id);
        const newCells = isSelected
          ? prev.cells.filter((c) => c.id !== cell.id)
          : [...prev.cells, cell];
        return { cells: newCells, isValid: true };
      });
    };

    return (
      <div>
        <RentalObjectAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          currentDate={currentDate}
          selection={selection}
          onDateChange={setCurrentDate}
          onCellClick={handleCellClick}
          startHour={8}
          endHour={21}
          title="Idrettshall A"
          subtitle="Velg tidspunkter for din aktivitet"
        />
        {selection.cells.length > 0 && (
          <Card style={{ marginTop: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              Valgte tider ({selection.cells.length})
            </Heading>
            <div style={{ marginTop: 'var(--ds-spacing-2)' }}>
              <Button>Gå videre til booking</Button>
            </div>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * Cabin/Accommodation booking scenario (MULTI_DAY)
 */
export const CabinBooking: Story = {
  render: () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selection, setSelection] = useState<CalendarSelection>({
      cells: [],
      isValid: true,
    });

    // Generate availability with some booked periods
    const cells: CalendarCell[] = [];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    // Some booked ranges
    const bookedRanges = [
      { start: 5, end: 8 },
      { start: 15, end: 18 },
      { start: 25, end: 27 },
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const start = new Date(cellDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(cellDate);
      end.setHours(23, 59, 59, 999);

      const isBooked = bookedRanges.some(
        (range) => day >= range.start && day <= range.end
      );

      cells.push({
        id: `cabin-${currentDate.getMonth()}-${day}`,
        start: start.toISOString(),
        end: end.toISOString(),
        status: isBooked ? 'BOOKED' : 'AVAILABLE',
        reasonKey: isBooked ? 'calendar.reason.booked' : null,
      });
    }

    const handleSelectionChange = (newSelection: CalendarSelection) => {
      setSelection(newSelection);
    };

    return (
      <div>
        <RentalObjectAvailabilityCalendar
          mode="MULTI_DAY"
          cells={cells}
          currentDate={currentDate}
          selection={selection}
          onDateChange={setCurrentDate}
          onSelectionChange={handleSelectionChange}
          title="Fjellhytte Solheim"
          subtitle="Velg innsjekk og utsjekk"
        />
        {selection.range?.startDate && selection.range?.endDate && (
          <Card style={{ marginTop: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              Valgt periode
            </Heading>
            <Paragraph data-size="sm" style={{ marginTop: 'var(--ds-spacing-2)' }}>
              Innsjekk: {new Date(selection.range.startDate).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Paragraph>
            <Paragraph data-size="sm">
              Utsjekk: {new Date(selection.range.endDate).toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Paragraph>
            {!selection.isValid && (
              <Alert data-color="danger" style={{ marginTop: 'var(--ds-spacing-2)' }}>
                <Paragraph data-size="sm">Noen datoer i perioden er ikke tilgjengelige</Paragraph>
              </Alert>
            )}
            <div style={{ marginTop: 'var(--ds-spacing-3)' }}>
              <Button disabled={!selection.isValid}>Gå videre til booking</Button>
            </div>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * Equipment rental scenario (ALL_DAY)
 */
export const EquipmentRental: Story = {
  render: () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selection, setSelection] = useState<CalendarSelection>({
      cells: [],
      isValid: true,
    });

    // Generate availability
    const cells: CalendarCell[] = [];
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const start = new Date(cellDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(cellDate);
      end.setHours(23, 59, 59, 999);

      const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
      const random = Math.random();
      let status: CalendarSlotStatus = 'AVAILABLE';
      if (isWeekend) {
        status = 'CLOSED';
      } else if (random > 0.8) {
        status = 'BOOKED';
      }

      cells.push({
        id: `equip-${currentDate.getMonth()}-${day}`,
        start: start.toISOString(),
        end: end.toISOString(),
        status,
        reasonKey: status !== 'AVAILABLE' ? `calendar.reason.${status.toLowerCase()}` : null,
      });
    }

    const handleCellClick = (cell: CalendarCell) => {
      setSelection((prev) => {
        const isSelected = prev.cells.some((c) => c.id === cell.id);
        const newCells = isSelected
          ? prev.cells.filter((c) => c.id !== cell.id)
          : [...prev.cells, cell];
        return { cells: newCells, isValid: true };
      });
    };

    return (
      <div>
        <RentalObjectAvailabilityCalendar
          mode="ALL_DAY"
          cells={cells}
          currentDate={currentDate}
          selection={selection}
          onDateChange={setCurrentDate}
          onCellClick={handleCellClick}
          title="Projektor - Epson EB-L635SU"
          subtitle="Velg datoer for utlån"
        />
        {selection.cells.length > 0 && (
          <Card style={{ marginTop: 'var(--ds-spacing-4)', padding: 'var(--ds-spacing-4)' }}>
            <Heading level={4} data-size="xs">
              Valgte datoer ({selection.cells.length})
            </Heading>
            <ul style={{ margin: 'var(--ds-spacing-2) 0 var(--ds-spacing-3)', paddingLeft: 'var(--ds-spacing-4)' }}>
              {selection.cells.slice(0, 5).map((cell) => (
                <li key={cell.id} style={{ fontSize: 'var(--ds-font-size-sm)' }}>
                  {new Date(cell.start).toLocaleDateString('nb-NO', { weekday: 'short', day: 'numeric', month: 'short' })}
                </li>
              ))}
              {selection.cells.length > 5 && (
                <li style={{ fontSize: 'var(--ds-font-size-sm)', color: 'var(--ds-color-neutral-text-subtle)' }}>
                  + {selection.cells.length - 5} flere...
                </li>
              )}
            </ul>
            <Button>Bekreft utlån</Button>
          </Card>
        )}
      </div>
    );
  },
};

/**
 * Mode comparison - all three modes side by side
 */
export const ModeComparison: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--ds-spacing-6)' }}>
      <div>
        <Heading level={3} data-size="md" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          TIME_SLOTS Mode
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          For timebooking av rom og fasiliteter
        </Paragraph>
        <TimeSlotsDemo title="Idrettshall" showTips={false} />
      </div>
      <div>
        <Heading level={3} data-size="md" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          ALL_DAY Mode
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          For dagslån av utstyr og ressurser
        </Paragraph>
        <AllDayDemo title="Utstyr" showTips={false} />
      </div>
      <div>
        <Heading level={3} data-size="md" style={{ marginBottom: 'var(--ds-spacing-3)' }}>
          MULTI_DAY Mode
        </Heading>
        <Paragraph data-size="sm" style={{ marginBottom: 'var(--ds-spacing-3)', color: 'var(--ds-color-neutral-text-subtle)' }}>
          For periodebasert utleie som hytter
        </Paragraph>
        <MultiDayDemo title="Hytte" showTips={false} />
      </div>
    </div>
  ),
};
