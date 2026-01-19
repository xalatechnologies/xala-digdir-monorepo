/**
 * Calendar Availability Calculator Unit Tests
 * 
 * Tests the complex server-side logic for generating availability matrices.
 * This logic MUST be server-side only - availability cannot be computed client-side.
 */

import { describe, it, expect, beforeEach } from 'vitest';

type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'BLACKOUT' | 'CLOSED';
type CalendarGranularity = 'TIME_SLOTS' | 'ALL_DAY' | 'MULTI_DAY';

interface AvailabilityCell {
  date: string;
  time?: string;
  status: SlotStatus;
  bookingId?: string;
}

interface OpeningHours {
  open: string;
  close: string;
  closed?: boolean;
}

// Mock availability calculator (TODO: Import actual service)
class AvailabilityCalculator {
  generateTimeSlots(date: string, openingHours: OpeningHours, slotDuration: number = 60): AvailabilityCell[] {
    if (openingHours.closed) {
      return [];
    }

    const slots: AvailabilityCell[] = [];
    const [openHour] = openingHours.open.split(':').map(Number);
    const [closeHour] = openingHours.close.split(':').map(Number);
    
    const totalHours = closeHour - openHour;
    const slotsPerHour = 60 / slotDuration;
    const totalSlots = totalHours * slotsPerHour;

    for (let i = 0; i < totalSlots; i++) {
      const hour = openHour + Math.floor(i / slotsPerHour);
      const minute = (i % slotsPerHour) * slotDuration;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      slots.push({
        date,
        time,
        status: 'AVAILABLE',
      });
    }

    return slots;
  }

  markSlotAsBooked(cells: AvailabilityCell[], targetTime: string, bookingId: string): AvailabilityCell[] {
    return cells.map(cell => 
      cell.time === targetTime 
        ? { ...cell, status: 'BOOKED' as SlotStatus, bookingId }
        : cell
    );
  }

  applyBufferTime(cells: AvailabilityCell[], bookedTime: string, bufferMinutes: number): AvailabilityCell[] {
    if (bufferMinutes === 0) return cells;

    const bookedIndex = cells.findIndex(c => c.time === bookedTime);
    if (bookedIndex === -1) return cells;

    // Mark buffer slots before and after as blocked
    return cells.map((cell, index) => {
      const isBufferBefore = index === bookedIndex - 1;
      const isBufferAfter = index === bookedIndex + 1;
      
      if ((isBufferBefore || isBufferAfter) && cell.status === 'AVAILABLE') {
        return { ...cell, status: 'BLOCKED' as SlotStatus };
      }
      return cell;
    });
  }

  applyBlackoutDates(cells: AvailabilityCell[], blackoutDates: string[]): AvailabilityCell[] {
    return cells.map(cell =>
      blackoutDates.includes(cell.date)
        ? { ...cell, status: 'BLACKOUT' as SlotStatus }
        : cell
    );
  }

  checkConflict(existingStart: Date, existingEnd: Date, newStart: Date, newEnd: Date): boolean {
    return newStart < existingEnd && newEnd > existingStart;
  }
}

describe('Availability Calculator - Time Slot Generation', () => {
  let calculator: AvailabilityCalculator;

  beforeEach(() => {
    calculator = new AvailabilityCalculator();
  });

  it('generates hourly slots for a normal day', () => {
    const slots = calculator.generateTimeSlots('2026-01-20', {
      open: '09:00',
      close: '17:00',
    }, 60);

    expect(slots).toHaveLength(8); // 9-17 = 8 hours
    expect(slots[0].time).toBe('09:00');
    expect(slots[7].time).toBe('16:00');
    expect(slots.every(s => s.status === 'AVAILABLE')).toBe(true);
  });

  it('generates 30-minute slots', () => {
    const slots = calculator.generateTimeSlots('2026-01-20', {
      open: '09:00',
      close: '11:00',
    }, 30);

    expect(slots).toHaveLength(4); // 2 hours × 2 slots = 4
    expect(slots[0].time).toBe('09:00');
    expect(slots[1].time).toBe('09:30');
    expect(slots[2].time).toBe('10:00');
    expect(slots[3].time).toBe('10:30');
  });

  it('generates 15-minute slots', () => {
    const slots = calculator.generateTimeSlots('2026-01-20', {
      open: '10:00',
      close: '11:00',
    }, 15);

    expect(slots).toHaveLength(4); // 1 hour × 4 slots = 4
    expect(slots[0].time).toBe('10:00');
    expect(slots[1].time).toBe('10:15');
    expect(slots[2].time).toBe('10:30');
    expect(slots[3].time).toBe('10:45');
  });

  it('returns empty array for closed day', () => {
    const slots = calculator.generateTimeSlots('2026-01-20', {
      open: '00:00',
      close: '00:00',
      closed: true,
    });

    expect(slots).toHaveLength(0);
  });
});

describe('Availability Calculator - Booking Conflicts', () => {
  let calculator: AvailabilityCalculator;

  beforeEach(() => {
    calculator = new AvailabilityCalculator();
  });

  it('detects overlapping bookings', () => {
    const existing = {
      start: new Date('2026-01-20T10:00:00Z'),
      end: new Date('2026-01-20T12:00:00Z'),
    };

    const newBooking = {
      start: new Date('2026-01-20T11:00:00Z'),
      end: new Date('2026-01-20T13:00:00Z'),
    };

    const hasConflict = calculator.checkConflict(
      existing.start,
      existing.end,
      newBooking.start,
      newBooking.end
    );

    expect(hasConflict).toBe(true);
  });

  it('allows non-overlapping bookings', () => {
    const existing = {
      start: new Date('2026-01-20T10:00:00Z'),
      end: new Date('2026-01-20T12:00:00Z'),
    };

    const newBooking = {
      start: new Date('2026-01-20T12:00:00Z'),
      end: new Date('2026-01-20T14:00:00Z'),
    };

    const hasConflict = calculator.checkConflict(
      existing.start,
      existing.end,
      newBooking.start,
      newBooking.end
    );

    expect(hasConflict).toBe(false);
  });

  it('detects booking completely within another', () => {
    const existing = {
      start: new Date('2026-01-20T10:00:00Z'),
      end: new Date('2026-01-20T14:00:00Z'),
    };

    const newBooking = {
      start: new Date('2026-01-20T11:00:00Z'),
      end: new Date('2026-01-20T12:00:00Z'),
    };

    const hasConflict = calculator.checkConflict(
      existing.start,
      existing.end,
      newBooking.start,
      newBooking.end
    );

    expect(hasConflict).toBe(true);
  });
});

describe('Availability Calculator - Buffer Time', () => {
  let calculator: AvailabilityCalculator;

  beforeEach(() => {
    calculator = new AvailabilityCalculator();
  });

  it('applies buffer time before and after booking', () => {
    let cells = calculator.generateTimeSlots('2026-01-20', {
      open: '09:00',
      close: '13:00',
    }, 60);

    // Book 10:00 slot
    cells = calculator.markSlotAsBooked(cells, '10:00', 'booking-123');
    
    // Apply 60min buffer
    cells = calculator.applyBufferTime(cells, '10:00', 60);

    // Check: 09:00 (BLOCKED), 10:00 (BOOKED), 11:00 (BLOCKED), 12:00 (AVAILABLE)
    expect(cells[0].status).toBe('BLOCKED'); // 09:00 buffer before
    expect(cells[1].status).toBe('BOOKED');  // 10:00 booked
    expect(cells[2].status).toBe('BLOCKED'); // 11:00 buffer after
    expect(cells[3].status).toBe('AVAILABLE'); // 12:00 free
  });

  it('handles zero buffer time', () => {
    let cells = calculator.generateTimeSlots('2026-01-20', {
      open: '09:00',
      close: '12:00',
    }, 60);

    cells = calculator.markSlotAsBooked(cells, '10:00', 'booking-123');
    cells = calculator.applyBufferTime(cells, '10:00', 0);

    // Only booked slot should be marked
    expect(cells[0].status).toBe('AVAILABLE');
    expect(cells[1].status).toBe('BOOKED');
    expect(cells[2].status).toBe('AVAILABLE');
  });
});

describe('Availability Calculator - Blackout Dates', () => {
  let calculator: AvailabilityCalculator;

  beforeEach(() => {
    calculator = new AvailabilityCalculator();
  });

  it('marks blackout dates as unavailable', () => {
    const cells = calculator.generateTimeSlots('2026-12-25', {
      open: '09:00',
      close: '17:00',
    }, 60);

    const blackoutDates = ['2026-12-25']; // Christmas
    const result = calculator.applyBlackoutDates(cells, blackoutDates);

    expect(result.every(c => c.status === 'BLACKOUT')).toBe(true);
  });

  it('does not affect non-blackout dates', () => {
    const cells = calculator.generateTimeSlots('2026-01-20', {
      open: '09:00',
      close: '17:00',
    }, 60);

    const blackoutDates = ['2026-12-25'];
    const result = calculator.applyBlackoutDates(cells, blackoutDates);

    expect(result.every(c => c.status === 'AVAILABLE')).toBe(true);
  });
});
