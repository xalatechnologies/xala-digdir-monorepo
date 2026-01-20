/**
 * Calendar Availability Service Tests
 * 
 * Tests calendar availability calculation logic
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// TYPES
// =============================================================================

interface TimeSlot {
  start: Date;
  end: Date;
}

interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
  isFullyBooked: boolean;
}

interface OpeningHours {
  dayOfWeek: number; // 0-6
  open: string; // HH:mm
  close: string; // HH:mm
}

// =============================================================================
// AVAILABILITY CALCULATION LOGIC
// =============================================================================

function generateTimeSlots(
  opening: string,
  closing: string,
  slotDurationMinutes: number,
  date: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  const [openHour, openMin] = opening.split(':').map(Number);
  const [closeHour, closeMin] = closing.split(':').map(Number);
  
  const start = new Date(date);
  start.setHours(openHour, openMin, 0, 0);
  
  const end = new Date(date);
  end.setHours(closeHour, closeMin, 0, 0);
  
  let current = new Date(start);
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + slotDurationMinutes * 60 * 1000);
    
    if (slotEnd <= end) {
      slots.push({
        start: new Date(current),
        end: new Date(slotEnd),
      });
    }
    
    current = slotEnd;
  }
  
  return slots;
}

function removeBookedSlots(
  availableSlots: TimeSlot[],
  bookedSlots: TimeSlot[]
): TimeSlot[] {
  return availableSlots.filter(slot => {
    return !bookedSlots.some(booked => 
      slot.start < booked.end && slot.end > booked.start
    );
  });
}

function getDayAvailability(
  date: Date,
  openingHours: OpeningHours[],
  bookedSlots: TimeSlot[],
  slotDurationMinutes: number
): DayAvailability {
  const dayOfWeek = date.getDay();
  const hours = openingHours.find(h => h.dayOfWeek === dayOfWeek);
  
  if (!hours) {
    return {
      date: date.toISOString().split('T')[0],
      slots: [],
      isFullyBooked: true,
    };
  }
  
  const allSlots = generateTimeSlots(hours.open, hours.close, slotDurationMinutes, date);
  const availableSlots = removeBookedSlots(allSlots, bookedSlots);
  
  return {
    date: date.toISOString().split('T')[0],
    slots: availableSlots,
    isFullyBooked: availableSlots.length === 0,
  };
}

// =============================================================================
// TESTS
// =============================================================================

describe('Calendar Availability Service', () => {
  describe('generateTimeSlots', () => {
    it('should generate correct number of 1-hour slots', () => {
      const date = new Date('2026-01-20');
      const slots = generateTimeSlots('08:00', '17:00', 60, date);
      
      expect(slots).toHaveLength(9); // 9 hours from 08:00-17:00
    });

    it('should generate correct number of 30-minute slots', () => {
      const date = new Date('2026-01-20');
      const slots = generateTimeSlots('09:00', '12:00', 30, date);
      
      expect(slots).toHaveLength(6); // 6 half-hour slots
    });

    it('should set correct start and end times', () => {
      const date = new Date('2026-01-20');
      const slots = generateTimeSlots('10:00', '11:00', 30, date);
      
      expect(slots).toHaveLength(2);
      expect(slots[0].start.getHours()).toBe(10);
      expect(slots[0].start.getMinutes()).toBe(0);
      expect(slots[0].end.getHours()).toBe(10);
      expect(slots[0].end.getMinutes()).toBe(30);
    });

    it('should not generate partial slots at end of day', () => {
      const date = new Date('2026-01-20');
      const slots = generateTimeSlots('16:00', '17:30', 60, date);
      
      // Only 1 full hour slot (16:00-17:00), not partial 17:00-17:30
      expect(slots).toHaveLength(1);
    });
  });

  describe('removeBookedSlots', () => {
    it('should remove overlapping slots', () => {
      const date = new Date('2026-01-20');
      const availableSlots: TimeSlot[] = [
        { start: new Date(date.setHours(9, 0)), end: new Date(date.setHours(10, 0)) },
        { start: new Date(date.setHours(10, 0)), end: new Date(date.setHours(11, 0)) },
        { start: new Date(date.setHours(11, 0)), end: new Date(date.setHours(12, 0)) },
      ];
      
      const bookedSlots: TimeSlot[] = [
        { start: new Date(date.setHours(10, 0)), end: new Date(date.setHours(11, 0)) },
      ];
      
      const remaining = removeBookedSlots(availableSlots, bookedSlots);
      
      expect(remaining).toHaveLength(2);
    });

    it('should keep non-overlapping slots', () => {
      const date = new Date('2026-01-20');
      date.setHours(9, 0, 0, 0);
      
      const availableSlots: TimeSlot[] = [
        { start: new Date(date), end: new Date(date.getTime() + 60 * 60 * 1000) },
      ];
      
      const bookedSlots: TimeSlot[] = [
        { 
          start: new Date(date.getTime() + 2 * 60 * 60 * 1000), 
          end: new Date(date.getTime() + 3 * 60 * 60 * 1000) 
        },
      ];
      
      const remaining = removeBookedSlots(availableSlots, bookedSlots);
      
      expect(remaining).toHaveLength(1);
    });
  });

  describe('getDayAvailability', () => {
    const weekdayHours: OpeningHours[] = [
      { dayOfWeek: 1, open: '08:00', close: '17:00' }, // Monday
      { dayOfWeek: 2, open: '08:00', close: '17:00' }, // Tuesday
      { dayOfWeek: 3, open: '08:00', close: '17:00' }, // Wednesday
      { dayOfWeek: 4, open: '08:00', close: '17:00' }, // Thursday
      { dayOfWeek: 5, open: '08:00', close: '17:00' }, // Friday
    ];

    it('should return empty slots for closed days', () => {
      const sunday = new Date('2026-01-25'); // Sunday
      
      const availability = getDayAvailability(sunday, weekdayHours, [], 60);
      
      expect(availability.slots).toHaveLength(0);
      expect(availability.isFullyBooked).toBe(true);
    });

    it('should return available slots for open days', () => {
      const monday = new Date('2026-01-20'); // Monday
      
      const availability = getDayAvailability(monday, weekdayHours, [], 60);
      
      expect(availability.slots.length).toBeGreaterThan(0);
      expect(availability.isFullyBooked).toBe(false);
    });

    it('should mark fully booked days correctly', () => {
      const monday = new Date('2026-01-20');
      monday.setHours(0, 0, 0, 0);
      
      // Book entire day
      const bookedSlots: TimeSlot[] = [
        { 
          start: new Date(monday.getTime() + 8 * 60 * 60 * 1000), 
          end: new Date(monday.getTime() + 17 * 60 * 60 * 1000) 
        },
      ];
      
      const availability = getDayAvailability(monday, weekdayHours, bookedSlots, 60);
      
      expect(availability.isFullyBooked).toBe(true);
    });
  });
});
