/**
 * Recurring Booking Pattern Tests
 * 
 * Tests recurring/season booking pattern generation
 * Per tender requirements for repeating rentals
 */

import { describe, it, expect } from 'vitest';

// =============================================================================
// TYPES
// =============================================================================

type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

interface RecurrencePattern {
  type: RecurrenceType;
  startDate: Date;
  endDate: Date;
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  daysOfWeek?: number[]; // 0-6 for weekly patterns
  dayOfMonth?: number; // 1-31 for monthly patterns
}

interface BookingSlot {
  date: Date;
  startTime: Date;
  endTime: Date;
}

// =============================================================================
// RECURRING PATTERN LOGIC
// =============================================================================

function generateRecurringSlots(pattern: RecurrencePattern): BookingSlot[] {
  const slots: BookingSlot[] = [];
  const current = new Date(pattern.startDate);
  const [startHour, startMin] = pattern.timeStart.split(':').map(Number);
  const [endHour, endMin] = pattern.timeEnd.split(':').map(Number);
  
  while (current <= pattern.endDate) {
    let shouldAdd = false;
    
    switch (pattern.type) {
      case 'daily':
        shouldAdd = true;
        break;
        
      case 'weekly':
        if (pattern.daysOfWeek?.includes(current.getDay())) {
          shouldAdd = true;
        }
        break;
        
      case 'biweekly':
        if (pattern.daysOfWeek?.includes(current.getDay())) {
          const weeksSinceStart = Math.floor(
            (current.getTime() - pattern.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          if (weeksSinceStart % 2 === 0) {
            shouldAdd = true;
          }
        }
        break;
        
      case 'monthly':
        if (current.getDate() === pattern.dayOfMonth) {
          shouldAdd = true;
        }
        break;
    }
    
    if (shouldAdd) {
      const startTime = new Date(current);
      startTime.setHours(startHour, startMin, 0, 0);
      
      const endTime = new Date(current);
      endTime.setHours(endHour, endMin, 0, 0);
      
      slots.push({
        date: new Date(current),
        startTime,
        endTime,
      });
    }
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

function validateRecurrencePattern(pattern: RecurrencePattern): string[] {
  const errors: string[] = [];
  
  if (pattern.endDate < pattern.startDate) {
    errors.push('End date must be after start date');
  }
  
  if (pattern.type === 'weekly' || pattern.type === 'biweekly') {
    if (!pattern.daysOfWeek || pattern.daysOfWeek.length === 0) {
      errors.push('Days of week required for weekly/biweekly patterns');
    }
  }
  
  if (pattern.type === 'monthly') {
    if (!pattern.dayOfMonth || pattern.dayOfMonth < 1 || pattern.dayOfMonth > 31) {
      errors.push('Valid day of month required for monthly patterns');
    }
  }
  
  // Check for excessive booking count
  const slots = generateRecurringSlots(pattern);
  if (slots.length > 52) {
    errors.push('Recurring pattern generates more than 52 bookings');
  }
  
  return errors;
}

// =============================================================================
// TESTS
// =============================================================================

describe('Recurring Booking Patterns', () => {
  describe('generateRecurringSlots', () => {
    it('should generate daily slots', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-25'),
        timeStart: '10:00',
        timeEnd: '12:00',
      };
      
      const slots = generateRecurringSlots(pattern);
      
      expect(slots).toHaveLength(6); // 6 days inclusive
    });

    it('should generate weekly slots for specific days', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        timeStart: '18:00',
        timeEnd: '20:00',
        daysOfWeek: [1, 3], // Monday and Wednesday
      };
      
      const slots = generateRecurringSlots(pattern);
      
      // January 2026 has 4 Mondays and 4 Wednesdays (approximately)
      expect(slots.length).toBeGreaterThanOrEqual(8);
    });

    it('should generate biweekly slots', () => {
      const pattern: RecurrencePattern = {
        type: 'biweekly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-02-28'),
        timeStart: '09:00',
        timeEnd: '11:00',
        daysOfWeek: [2], // Tuesday
      };
      
      const slots = generateRecurringSlots(pattern);
      
      // Every other Tuesday for ~8 weeks = ~4 slots
      expect(slots.length).toBeGreaterThanOrEqual(4);
    });

    it('should generate monthly slots', () => {
      const pattern: RecurrencePattern = {
        type: 'monthly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        timeStart: '14:00',
        timeEnd: '16:00',
        dayOfMonth: 15,
      };
      
      const slots = generateRecurringSlots(pattern);
      
      expect(slots).toHaveLength(12); // 12 months
    });

    it('should set correct times for each slot', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-01-20'),
        timeStart: '14:30',
        timeEnd: '16:45',
      };
      
      const slots = generateRecurringSlots(pattern);
      
      expect(slots).toHaveLength(1);
      expect(slots[0].startTime.getHours()).toBe(14);
      expect(slots[0].startTime.getMinutes()).toBe(30);
      expect(slots[0].endTime.getHours()).toBe(16);
      expect(slots[0].endTime.getMinutes()).toBe(45);
    });
  });

  describe('validateRecurrencePattern', () => {
    it('should reject end date before start date', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-01-01'),
        timeStart: '10:00',
        timeEnd: '12:00',
      };
      
      const errors = validateRecurrencePattern(pattern);
      
      expect(errors).toContain('End date must be after start date');
    });

    it('should require days of week for weekly patterns', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        timeStart: '10:00',
        timeEnd: '12:00',
        daysOfWeek: [],
      };
      
      const errors = validateRecurrencePattern(pattern);
      
      expect(errors).toContain('Days of week required for weekly/biweekly patterns');
    });

    it('should require day of month for monthly patterns', () => {
      const pattern: RecurrencePattern = {
        type: 'monthly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        timeStart: '10:00',
        timeEnd: '12:00',
      };
      
      const errors = validateRecurrencePattern(pattern);
      
      expect(errors).toContain('Valid day of month required for monthly patterns');
    });

    it('should warn about excessive bookings', () => {
      const pattern: RecurrencePattern = {
        type: 'daily',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        timeStart: '10:00',
        timeEnd: '12:00',
      };
      
      const errors = validateRecurrencePattern(pattern);
      
      expect(errors).toContain('Recurring pattern generates more than 52 bookings');
    });

    it('should accept valid weekly pattern', () => {
      const pattern: RecurrencePattern = {
        type: 'weekly',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        timeStart: '18:00',
        timeEnd: '20:00',
        daysOfWeek: [2, 4], // Tuesday, Thursday
      };
      
      const errors = validateRecurrencePattern(pattern);
      
      expect(errors).toHaveLength(0);
    });
  });
});
