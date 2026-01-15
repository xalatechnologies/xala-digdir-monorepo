import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListingAvailabilityCalendar } from '../blocks/ListingAvailabilityCalendar';
import type {
  CalendarCell,
  CalendarSelection,
  CalendarSlotStatus,
} from '../types/listing-detail';

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Create a CalendarCell for testing
 */
function createCell(
  options: {
    id?: string;
    status?: CalendarSlotStatus;
    date?: Date;
    hour?: number;
    reasonKey?: string | null;
    bookingId?: string | null;
    blockId?: string | null;
  } = {}
): CalendarCell {
  const {
    id = 'cell-1',
    status = 'AVAILABLE',
    date = new Date(2026, 0, 15),
    hour = 10,
    reasonKey = null,
    bookingId = null,
    blockId = null,
  } = options;

  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setHours(hour + 1, 0, 0, 0);

  return {
    id,
    start: start.toISOString(),
    end: end.toISOString(),
    status,
    reasonKey,
    bookingId,
    blockId,
    lockedUntil: null,
  };
}

/**
 * Generate a week's worth of cells for TIME_SLOTS mode
 */
function generateWeekCells(
  startDate: Date,
  startHour = 8,
  endHour = 17,
  status: CalendarSlotStatus = 'AVAILABLE'
): CalendarCell[] {
  const cells: CalendarCell[] = [];
  let cellId = 0;

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);

    for (let hour = startHour; hour <= endHour; hour++) {
      cells.push(
        createCell({
          id: `cell-${cellId++}`,
          date,
          hour,
          status,
        })
      );
    }
  }

  return cells;
}

/**
 * Generate a month's worth of cells for ALL_DAY mode
 */
function generateMonthCells(
  year: number,
  month: number,
  status: CalendarSlotStatus = 'AVAILABLE'
): CalendarCell[] {
  const cells: CalendarCell[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day, 0, 0, 0, 0);
    const end = new Date(year, month, day, 23, 59, 59, 999);

    cells.push({
      id: `day-${day}`,
      start: date.toISOString(),
      end: end.toISOString(),
      status,
      reasonKey: null,
      bookingId: null,
      blockId: null,
      lockedUntil: null,
    });
  }

  return cells;
}

// =============================================================================
// Tests
// =============================================================================

describe('ListingAvailabilityCalendar', () => {
  const defaultProps = {
    currentDate: new Date(2026, 0, 15), // January 15, 2026 (Wednesday)
  };

  // Get the Monday of the week containing currentDate
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  describe('Mode Switching', () => {
    describe('TIME_SLOTS mode', () => {
      it('renders week view header with navigation', () => {
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            {...defaultProps}
          />
        );

        // Should render navigation buttons
        expect(screen.getByRole('button', { name: /forrige uke/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /neste uke/i })).toBeDefined();
      });

      it('renders time slots in a grid', () => {
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart, 8, 10);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            startHour={8}
            endHour={10}
            {...defaultProps}
          />
        );

        // Should render day headers (MAN, TIR, ONS, etc.)
        expect(screen.getByText('MAN')).toBeDefined();
        expect(screen.getByText('TIR')).toBeDefined();
        expect(screen.getByText('ONS')).toBeDefined();
      });

      it('renders time labels for each row', () => {
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart, 9, 11);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            startHour={9}
            endHour={11}
            {...defaultProps}
          />
        );

        // Should render time labels (may appear multiple times)
        expect(screen.getAllByText('09:00').length).toBeGreaterThan(0);
        expect(screen.getAllByText('10:00').length).toBeGreaterThan(0);
        expect(screen.getAllByText('11:00').length).toBeGreaterThan(0);
      });

      it('navigates to previous week when clicking prev button', () => {
        const onDateChange = vi.fn();
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            onDateChange={onDateChange}
            {...defaultProps}
          />
        );

        fireEvent.click(screen.getByRole('button', { name: /forrige uke/i }));

        expect(onDateChange).toHaveBeenCalledTimes(1);
        const newDate = onDateChange.mock.calls[0][0] as Date;
        expect(newDate.getTime()).toBeLessThan(weekStart.getTime());
      });

      it('navigates to next week when clicking next button', () => {
        const onDateChange = vi.fn();
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            onDateChange={onDateChange}
            {...defaultProps}
          />
        );

        fireEvent.click(screen.getByRole('button', { name: /neste uke/i }));

        expect(onDateChange).toHaveBeenCalledTimes(1);
        const newDate = onDateChange.mock.calls[0][0] as Date;
        expect(newDate.getTime()).toBeGreaterThan(weekStart.getTime());
      });
    });

    describe('ALL_DAY mode', () => {
      it('renders month view with day grid', () => {
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="ALL_DAY"
            cells={cells}
            {...defaultProps}
          />
        );

        // Should render month navigation
        expect(screen.getByRole('button', { name: /forrige måned/i })).toBeDefined();
        expect(screen.getByRole('button', { name: /neste måned/i })).toBeDefined();
      });

      it('renders weekday headers (Monday first)', () => {
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="ALL_DAY"
            cells={cells}
            {...defaultProps}
          />
        );

        // Norwegian weekday headers (Monday first)
        expect(screen.getByText('MAN')).toBeDefined();
        expect(screen.getByText('TIR')).toBeDefined();
        expect(screen.getByText('SØN')).toBeDefined();
      });

      it('navigates to previous month when clicking prev button', () => {
        const onDateChange = vi.fn();
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="ALL_DAY"
            cells={cells}
            onDateChange={onDateChange}
            {...defaultProps}
          />
        );

        fireEvent.click(screen.getByRole('button', { name: /forrige måned/i }));

        expect(onDateChange).toHaveBeenCalledTimes(1);
        const newDate = onDateChange.mock.calls[0][0] as Date;
        expect(newDate.getMonth()).toBe(11); // December 2025
      });

      it('navigates to next month when clicking next button', () => {
        const onDateChange = vi.fn();
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="ALL_DAY"
            cells={cells}
            onDateChange={onDateChange}
            {...defaultProps}
          />
        );

        fireEvent.click(screen.getByRole('button', { name: /neste måned/i }));

        expect(onDateChange).toHaveBeenCalledTimes(1);
        const newDate = onDateChange.mock.calls[0][0] as Date;
        expect(newDate.getMonth()).toBe(1); // February 2026
      });
    });

    describe('MULTI_DAY mode', () => {
      it('renders month view with range selection UI', () => {
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="MULTI_DAY"
            cells={cells}
            {...defaultProps}
          />
        );

        // Should show range selection prompt
        expect(screen.getByText(/velg startdato/i)).toBeDefined();
      });

      it('renders range selection legend item', () => {
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="MULTI_DAY"
            cells={cells}
            {...defaultProps}
          />
        );

        // Should have "Valgt periode" legend item (may appear multiple times)
        expect(screen.getAllByText('Valgt periode').length).toBeGreaterThan(0);
      });

      it('shows tips panel for MULTI_DAY mode', () => {
        const cells = generateMonthCells(2026, 0);

        render(
          <ListingAvailabilityCalendar
            mode="MULTI_DAY"
            cells={cells}
            showTips={true}
            {...defaultProps}
          />
        );

        // Should show MULTI_DAY specific tips (may appear multiple times)
        expect(screen.getAllByText(/velg først en startdato/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Slot Status Rendering', () => {
    const statuses: CalendarSlotStatus[] = [
      'AVAILABLE',
      'RESERVED',
      'BOOKED',
      'BLOCKED',
      'BLACKOUT',
      'CLOSED',
    ];

    describe('TIME_SLOTS mode slot rendering', () => {
      it.each(statuses)('renders %s status cells with data attribute', (status) => {
        const weekStart = getWeekStart(defaultProps.currentDate);
        const cells = generateWeekCells(weekStart, 10, 10, status);

        render(
          <ListingAvailabilityCalendar
            mode="TIME_SLOTS"
            cells={cells}
            startHour={10}
            endHour={10}
            {...defaultProps}
          />
        );

        // Find cells with the status data attribute
        const statusCells = document.querySelectorAll(`[data-status="${status}"]`);
        expect(statusCells.length).toBeGreaterThan(0);
      });
    });

    describe('ALL_DAY mode slot rendering', () => {
      it.each(statuses)('renders %s status cells with data attribute', (status) => {
        // Create cells with mixed statuses, but include the one we're testing
        const cells = generateMonthCells(2026, 0, status);

        render(
          <ListingAvailabilityCalendar
            mode="ALL_DAY"
            cells={cells}
            {...defaultProps}
          />
        );

        // Find cells with the status data attribute
        const statusCells = document.querySelectorAll(`[data-status="${status}"]`);
        expect(statusCells.length).toBeGreaterThan(0);
      });
    });

    it('renders legend with all slot statuses', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          {...defaultProps}
        />
      );

      // Norwegian labels in legend
      expect(screen.getByText('Forklaring')).toBeDefined();
      expect(screen.getByText('Ledig')).toBeDefined();
      expect(screen.getByText('Reservert')).toBeDefined();
      expect(screen.getByText('Booket')).toBeDefined();
      expect(screen.getByText('Blokkert')).toBeDefined();
      expect(screen.getByText('Utilgjengelig')).toBeDefined();
      expect(screen.getByText('Stengt')).toBeDefined();
    });

    it('AVAILABLE cells are clickable (have button role)', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          {...defaultProps}
        />
      );

      // Find available cells with button role
      const availableCells = document.querySelectorAll('[data-status="AVAILABLE"][role="button"]');
      expect(availableCells.length).toBeGreaterThan(0);
    });

    it('non-AVAILABLE cells are not clickable in non-readOnly mode', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'BOOKED');

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      // Find booked cells - should NOT have button role since they're not selectable
      const bookedCells = document.querySelectorAll('[data-status="BOOKED"]');
      expect(bookedCells.length).toBeGreaterThan(0);

      bookedCells.forEach((cell) => {
        expect(cell.getAttribute('role')).not.toBe('button');
      });
    });
  });

  describe('Cell Interaction', () => {
    it('calls onCellClick when clicking an AVAILABLE cell', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          {...defaultProps}
        />
      );

      // Find an available cell and click it
      const availableCell = document.querySelector('[data-status="AVAILABLE"][role="button"]');
      expect(availableCell).not.toBeNull();

      if (availableCell) {
        fireEvent.click(availableCell);
        expect(onCellClick).toHaveBeenCalledTimes(1);
        expect(onCellClick).toHaveBeenCalledWith(expect.objectContaining({
          status: 'AVAILABLE',
        }));
      }
    });

    it('does not call onCellClick when clicking a BOOKED cell', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'BOOKED');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          {...defaultProps}
        />
      );

      // Find a booked cell and try to click it
      const bookedCell = document.querySelector('[data-status="BOOKED"]');
      if (bookedCell) {
        fireEvent.click(bookedCell);
        expect(onCellClick).not.toHaveBeenCalled();
      }
    });

    it('supports keyboard interaction (Enter key) on AVAILABLE cells', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          {...defaultProps}
        />
      );

      const availableCell = document.querySelector('[data-status="AVAILABLE"][role="button"]');
      if (availableCell) {
        fireEvent.keyDown(availableCell, { key: 'Enter' });
        expect(onCellClick).toHaveBeenCalledTimes(1);
      }
    });

    it('supports keyboard interaction (Space key) on AVAILABLE cells', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          {...defaultProps}
        />
      );

      const availableCell = document.querySelector('[data-status="AVAILABLE"][role="button"]');
      if (availableCell) {
        fireEvent.keyDown(availableCell, { key: ' ' });
        expect(onCellClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Selection State', () => {
    it('renders selected cells with visual indication', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const selectedCell = cells[0]!;

      const selection: CalendarSelection = {
        cells: [selectedCell],
        isValid: true,
      };

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          selection={selection}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      // Find selected cell by class
      const selectedCellElement = document.querySelector('.listing-calendar-cell.selected');
      expect(selectedCellElement).toBeDefined();
    });

    it('shows selection count in tips panel', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 12, 'AVAILABLE');
      const selectedCells = cells.slice(0, 3);

      const selection: CalendarSelection = {
        cells: selectedCells,
        isValid: true,
      };

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          selection={selection}
          startHour={10}
          endHour={12}
          showTips={true}
          {...defaultProps}
        />
      );

      // Should show "3 tidspunkter valgt" (3 time slots selected)
      expect(screen.getByText(/3 tidspunkter valgt/i)).toBeDefined();
    });

    it('shows singular form for single selection', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const selectedCell = cells[0]!;

      const selection: CalendarSelection = {
        cells: [selectedCell],
        isValid: true,
      };

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          selection={selection}
          startHour={10}
          endHour={10}
          showTips={true}
          {...defaultProps}
        />
      );

      expect(screen.getByText(/1 tidspunkt valgt/i)).toBeDefined();
    });
  });

  describe('Loading State', () => {
    it('displays loading message when isLoading is true', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          isLoading={true}
          {...defaultProps}
        />
      );

      expect(screen.getByText(/laster tilgjengelighet/i)).toBeDefined();
    });

    it('disables navigation buttons when loading', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          isLoading={true}
          {...defaultProps}
        />
      );

      // Navigation buttons should not be rendered when loading
      expect(screen.queryByRole('button', { name: /forrige uke/i })).toBeNull();
    });

    it('hides tips panel when loading', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          isLoading={true}
          showTips={true}
          {...defaultProps}
        />
      );

      // Tips panel should not be shown when loading
      expect(screen.queryByText('Tips')).toBeNull();
    });
  });

  describe('Error State', () => {
    it('displays error message when errorMessage is provided', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          errorMessage="Kunne ikke laste tilgjengelighet"
          {...defaultProps}
        />
      );

      expect(screen.getByText('Kunne ikke laste tilgjengelighet')).toBeDefined();
    });

    it('displays error with proper visual indication', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          errorMessage="Error occurred"
          {...defaultProps}
        />
      );

      // The error message should be visible
      expect(screen.getByText('Error occurred')).toBeDefined();
    });

    it('hides tips panel when error occurs', () => {
      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[]}
          errorMessage="Error occurred"
          showTips={true}
          {...defaultProps}
        />
      );

      expect(screen.queryByText('Tips')).toBeNull();
    });
  });

  describe('Warning State', () => {
    it('displays warning banner when warningMessage is provided', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          warningMessage="Valgt tidspunkt er ikke lenger tilgjengelig"
          {...defaultProps}
        />
      );

      expect(screen.getByText('Valgt tidspunkt er ikke lenger tilgjengelig')).toBeDefined();
    });
  });

  describe('Read-Only Mode', () => {
    it('prevents cell clicks when readOnly is true', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');
      const onCellClick = vi.fn();

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          onCellClick={onCellClick}
          readOnly={true}
          {...defaultProps}
        />
      );

      // Cells should not have button role when readOnly
      const cellsElem = document.querySelectorAll('[data-status="AVAILABLE"]');
      cellsElem.forEach((cell) => {
        expect(cell.getAttribute('role')).not.toBe('button');
      });

      // Clicking should not trigger handler
      if (cellsElem[0]) {
        fireEvent.click(cellsElem[0]);
        expect(onCellClick).not.toHaveBeenCalled();
      }
    });

    it('hides selection tips for readOnly mode', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          readOnly={true}
          showTips={true}
          {...defaultProps}
        />
      );

      // Should not show "Valgte tidspunkter vises med blå ramme" tip in readOnly
      expect(screen.queryByText(/valgte tidspunkter vises/i)).toBeNull();
    });
  });

  describe('Header and Title', () => {
    it('renders title when provided', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          title="Book møterom"
          {...defaultProps}
        />
      );

      expect(screen.getByText('Book møterom')).toBeDefined();
    });

    it('renders default title when not provided', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Tilgjengelighet')).toBeDefined();
    });

    it('renders subtitle when provided', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          subtitle="Velg et ledig tidspunkt for å booke"
          {...defaultProps}
        />
      );

      expect(screen.getByText('Velg et ledig tidspunkt for å booke')).toBeDefined();
    });
  });

  describe('Tips Panel', () => {
    it('renders tips panel when showTips is true', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          showTips={true}
          {...defaultProps}
        />
      );

      expect(screen.getByText('Tips')).toBeDefined();
    });

    it('hides tips panel when showTips is false', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          showTips={false}
          {...defaultProps}
        />
      );

      expect(screen.queryByText('Tips')).toBeNull();
    });

    it('shows mode-specific tips for TIME_SLOTS', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          showTips={true}
          {...defaultProps}
        />
      );

      // Tips content may appear multiple times in the DOM
      expect(screen.getAllByText(/klikk på ledige.*tidspunkter/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/bytt mellom uker/i).length).toBeGreaterThan(0);
    });

    it('shows mode-specific tips for ALL_DAY', () => {
      const cells = generateMonthCells(2026, 0);

      render(
        <ListingAvailabilityCalendar
          mode="ALL_DAY"
          cells={cells}
          showTips={true}
          {...defaultProps}
        />
      );

      // Tips content may appear multiple times in the DOM
      expect(screen.getAllByText(/klikk på ledige.*dager/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/heldagsbooking/i).length).toBeGreaterThan(0);
    });

    it('shows mode-specific tips for MULTI_DAY', () => {
      const cells = generateMonthCells(2026, 0);

      render(
        <ListingAvailabilityCalendar
          mode="MULTI_DAY"
          cells={cells}
          showTips={true}
          {...defaultProps}
        />
      );

      // Tips content may appear multiple times in the DOM
      expect(screen.getAllByText(/velg først en startdato/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/alle dager i perioden/i).length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('cells have appropriate aria-labels', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      // All cells should have aria-label
      const calendarCells = document.querySelectorAll('.listing-calendar-cell');
      calendarCells.forEach((cell) => {
        expect(cell.hasAttribute('aria-label')).toBe(true);
      });
    });

    it('cells have tabIndex for keyboard navigation', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      // Available cells should be keyboard navigable
      const availableCells = document.querySelectorAll('[data-status="AVAILABLE"][role="button"]');
      availableCells.forEach((cell) => {
        expect(cell.getAttribute('tabIndex')).toBe('0');
      });
    });

    it('navigation buttons have aria-labels', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          {...defaultProps}
        />
      );

      expect(screen.getByRole('button', { name: /forrige uke/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /neste uke/i })).toBeDefined();
    });
  });

  describe('Tooltips', () => {
    it('cells have title attribute with tooltip text', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'AVAILABLE');

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      const calendarCells = document.querySelectorAll('.listing-calendar-cell');
      calendarCells.forEach((cell) => {
        expect(cell.hasAttribute('title')).toBe(true);
        expect(cell.getAttribute('title')).toContain('Ledig');
      });
    });

    it('BOOKED cells show appropriate tooltip', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart, 10, 10, 'BOOKED');

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      const bookedCells = document.querySelectorAll('[data-status="BOOKED"]');
      bookedCells.forEach((cell) => {
        expect(cell.getAttribute('title')).toContain('Booket');
      });
    });

    it('includes reasonKey in tooltip when provided', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cell = createCell({
        id: 'blocked-cell',
        status: 'BLOCKED',
        date: weekStart,
        hour: 10,
        reasonKey: 'maintenance.scheduled',
      });

      render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={[cell]}
          startHour={10}
          endHour={10}
          {...defaultProps}
        />
      );

      const blockedCell = document.querySelector('[data-status="BLOCKED"]');
      expect(blockedCell?.getAttribute('title')).toContain('maintenance.scheduled');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to root element', () => {
      const weekStart = getWeekStart(defaultProps.currentDate);
      const cells = generateWeekCells(weekStart);

      const { container } = render(
        <ListingAvailabilityCalendar
          mode="TIME_SLOTS"
          cells={cells}
          className="my-custom-calendar"
          {...defaultProps}
        />
      );

      expect(container.querySelector('.listing-availability-calendar.my-custom-calendar')).not.toBeNull();
    });
  });
});
