/**
 * Unit Tests for Formatting Utilities
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime, formatDuration } from './formatters';

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('past times', () => {
    it('should format minutes ago in Norwegian', () => {
      const pastDate = new Date('2024-01-15T11:30:00Z'); // 30 minutes ago
      const result = formatRelativeTime(pastDate, 'nb-NO');
      expect(result).toBe('for 30 minutter siden');
    });

    it('should format hours ago in Norwegian', () => {
      const pastDate = new Date('2024-01-15T10:00:00Z'); // 2 hours ago
      const result = formatRelativeTime(pastDate, 'nb-NO');
      expect(result).toBe('for 2 timer siden');
    });

    it('should format days ago in Norwegian', () => {
      const pastDate = new Date('2024-01-13T12:00:00Z'); // 2 days ago
      const result = formatRelativeTime(pastDate, 'nb-NO');
      expect(result).toBe('i forgårs'); // Intl.RelativeTimeFormat with numeric: 'auto' uses natural language
    });

    it('should format minutes ago in English', () => {
      const pastDate = new Date('2024-01-15T11:45:00Z'); // 15 minutes ago
      const result = formatRelativeTime(pastDate, 'en-US');
      expect(result).toBe('15 minutes ago');
    });

    it('should format hours ago in English', () => {
      const pastDate = new Date('2024-01-15T09:00:00Z'); // 3 hours ago
      const result = formatRelativeTime(pastDate, 'en-US');
      expect(result).toBe('3 hours ago');
    });

    it('should format days ago in English', () => {
      const pastDate = new Date('2024-01-10T12:00:00Z'); // 5 days ago
      const result = formatRelativeTime(pastDate, 'en-US');
      expect(result).toBe('5 days ago');
    });
  });

  describe('future times', () => {
    it('should format minutes from now in Norwegian', () => {
      const futureDate = new Date('2024-01-15T12:45:00Z'); // in 45 minutes
      const result = formatRelativeTime(futureDate, 'nb-NO');
      expect(result).toBe('om 45 minutter');
    });

    it('should format hours from now in Norwegian', () => {
      const futureDate = new Date('2024-01-15T15:00:00Z'); // in 3 hours
      const result = formatRelativeTime(futureDate, 'nb-NO');
      expect(result).toBe('om 3 timer');
    });

    it('should format days from now in Norwegian', () => {
      const futureDate = new Date('2024-01-18T12:00:00Z'); // in 3 days
      const result = formatRelativeTime(futureDate, 'nb-NO');
      expect(result).toBe('om 3 døgn'); // Intl.RelativeTimeFormat uses 'døgn' for future days
    });

    it('should format minutes from now in English', () => {
      const futureDate = new Date('2024-01-15T12:20:00Z'); // in 20 minutes
      const result = formatRelativeTime(futureDate, 'en-US');
      expect(result).toBe('in 20 minutes');
    });

    it('should format hours from now in English', () => {
      const futureDate = new Date('2024-01-15T14:00:00Z'); // in 2 hours
      const result = formatRelativeTime(futureDate, 'en-US');
      expect(result).toBe('in 2 hours');
    });

    it('should format days from now in English', () => {
      const futureDate = new Date('2024-01-20T12:00:00Z'); // in 5 days
      const result = formatRelativeTime(futureDate, 'en-US');
      expect(result).toBe('in 5 days');
    });
  });

  describe('edge cases', () => {
    it('should handle very recent time (less than a minute)', () => {
      const nowDate = new Date('2024-01-15T12:00:30Z'); // 30 seconds ago (rounds to 1 minute)
      const result = formatRelativeTime(nowDate, 'nb-NO');
      expect(result).toBe('om 1 minutt'); // Rounds to nearest minute
    });

    it('should handle very recent time in English', () => {
      const nowDate = new Date('2024-01-15T12:00:45Z'); // 45 seconds from now (rounds to 1 minute)
      const result = formatRelativeTime(nowDate, 'en-US');
      expect(result).toBe('in 1 minute'); // Rounds to nearest minute
    });

    it('should handle invalid date string', () => {
      const result = formatRelativeTime('invalid-date', 'nb-NO');
      expect(result).toBe('');
    });

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('not-a-date');
      const result = formatRelativeTime(invalidDate, 'nb-NO');
      expect(result).toBe('');
    });

    it('should use default locale when not specified', () => {
      const pastDate = new Date('2024-01-15T11:00:00Z'); // 1 hour ago
      const result = formatRelativeTime(pastDate);
      expect(result).toBe('for 1 time siden');
    });
  });

  describe('ISO string dates', () => {
    it('should accept ISO date strings', () => {
      const isoString = '2024-01-15T10:00:00Z'; // 2 hours ago
      const result = formatRelativeTime(isoString, 'nb-NO');
      expect(result).toBe('for 2 timer siden');
    });

    it('should accept ISO date strings in English', () => {
      const isoString = '2024-01-15T14:00:00Z'; // in 2 hours
      const result = formatRelativeTime(isoString, 'en-US');
      expect(result).toBe('in 2 hours');
    });
  });

  describe('time unit boundaries', () => {
    it('should switch from minutes to hours at 60 minutes', () => {
      const date59min = new Date('2024-01-15T11:01:00Z'); // 59 minutes ago
      const date60min = new Date('2024-01-15T11:00:00Z'); // 60 minutes ago

      const result59 = formatRelativeTime(date59min, 'nb-NO');
      const result60 = formatRelativeTime(date60min, 'nb-NO');

      expect(result59).toBe('for 59 minutter siden');
      expect(result60).toBe('for 1 time siden');
    });

    it('should switch from hours to days at 24 hours', () => {
      const date23h = new Date('2024-01-14T13:00:00Z'); // 23 hours ago
      const date24h = new Date('2024-01-14T12:00:00Z'); // 24 hours ago (exactly 1 day)

      const result23 = formatRelativeTime(date23h, 'nb-NO');
      const result24 = formatRelativeTime(date24h, 'nb-NO');

      expect(result23).toBe('for 23 timer siden');
      expect(result24).toBe('i går'); // Intl.RelativeTimeFormat with numeric: 'auto' uses 'i går' (yesterday)
    });
  });
});

describe('formatDuration', () => {
  describe('compact format (default)', () => {
    it('should format minutes in Norwegian', () => {
      const duration = 5 * 60 * 1000; // 5 minutes
      const result = formatDuration(duration);
      expect(result).toBe('5m');
    });

    it('should format hours and minutes in Norwegian', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1t 30m');
    });

    it('should format hours and minutes in English', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'en-US' });
      expect(result).toBe('1h 30m');
    });

    it('should format days and hours', () => {
      const duration = 26 * 60 * 60 * 1000; // 1 day 2 hours
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1d 2t');
    });

    it('should format complex durations', () => {
      const duration = 25 * 60 * 60 * 1000 + 30 * 60 * 1000; // 1 day 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1d 1t 30m');
    });

    it('should format seconds for short durations', () => {
      const duration = 45 * 1000; // 45 seconds
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('45s');
    });

    it('should not include seconds for durations over 1 hour', () => {
      const duration = 1 * 60 * 60 * 1000 + 5 * 60 * 1000 + 30 * 1000; // 1h 5m 30s
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1t 5m');
    });
  });

  describe('long format', () => {
    it('should format minutes in Norwegian (singular)', () => {
      const duration = 1 * 60 * 1000; // 1 minute
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('1 minutt');
    });

    it('should format minutes in Norwegian (plural)', () => {
      const duration = 5 * 60 * 1000; // 5 minutes
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('5 minutter');
    });

    it('should format hours in Norwegian (singular)', () => {
      const duration = 1 * 60 * 60 * 1000; // 1 hour
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('1 time');
    });

    it('should format hours in Norwegian (plural)', () => {
      const duration = 3 * 60 * 60 * 1000; // 3 hours
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('3 timer');
    });

    it('should format days in Norwegian (singular)', () => {
      const duration = 1 * 24 * 60 * 60 * 1000; // 1 day
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('1 dag');
    });

    it('should format days in Norwegian (plural)', () => {
      const duration = 3 * 24 * 60 * 60 * 1000; // 3 days
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('3 dager');
    });

    it('should format complex duration in Norwegian', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });
      expect(result).toBe('1 time 30 minutter');
    });

    it('should format minutes in English (singular)', () => {
      const duration = 1 * 60 * 1000; // 1 minute
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('1 minute');
    });

    it('should format minutes in English (plural)', () => {
      const duration = 5 * 60 * 1000; // 5 minutes
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('5 minutes');
    });

    it('should format hours in English (singular)', () => {
      const duration = 1 * 60 * 60 * 1000; // 1 hour
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('1 hour');
    });

    it('should format hours in English (plural)', () => {
      const duration = 2 * 60 * 60 * 1000; // 2 hours
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('2 hours');
    });

    it('should format complex duration in English', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('1 hour 30 minutes');
    });

    it('should format seconds in English (singular)', () => {
      const duration = 1 * 1000; // 1 second
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('1 second');
    });

    it('should format seconds in English (plural)', () => {
      const duration = 45 * 1000; // 45 seconds
      const result = formatDuration(duration, { style: 'long', locale: 'en-US' });
      expect(result).toBe('45 seconds');
    });
  });

  describe('input unit handling', () => {
    it('should handle milliseconds (default)', () => {
      const duration = 5400000; // 90 minutes in milliseconds
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1t 30m');
    });

    it('should handle seconds as input unit', () => {
      const duration = 5400; // 90 minutes in seconds
      const result = formatDuration(duration, { unit: 'seconds', locale: 'nb-NO' });
      expect(result).toBe('1t 30m');
    });

    it('should convert seconds correctly', () => {
      const duration = 3661; // 1 hour, 1 minute, 1 second in seconds
      const result = formatDuration(duration, { unit: 'seconds', locale: 'nb-NO' });
      expect(result).toBe('1t 1m');
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration', () => {
      const result = formatDuration(0, { locale: 'nb-NO' });
      expect(result).toBe('0m');
    });

    it('should handle negative duration', () => {
      const result = formatDuration(-1000, { locale: 'nb-NO' });
      expect(result).toBe('0m');
    });

    it('should handle very small duration (rounding to 0)', () => {
      const duration = 500; // 0.5 seconds
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('0m');
    });

    it('should handle exactly 1 hour', () => {
      const duration = 60 * 60 * 1000; // exactly 1 hour
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1t');
    });

    it('should handle exactly 1 day', () => {
      const duration = 24 * 60 * 60 * 1000; // exactly 1 day
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1d');
    });
  });

  describe('locale variations', () => {
    it('should handle nb locale prefix', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'nb' });
      expect(result).toBe('1t 30m');
    });

    it('should handle en locale prefix', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'en' });
      expect(result).toBe('1h 30m');
    });

    it('should handle nb-NO locale', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'nb-NO' });
      expect(result).toBe('1t 30m');
    });

    it('should handle en-US locale', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'en-US' });
      expect(result).toBe('1h 30m');
    });

    it('should handle en-GB locale', () => {
      const duration = 90 * 60 * 1000; // 1 hour 30 minutes
      const result = formatDuration(duration, { locale: 'en-GB' });
      expect(result).toBe('1h 30m');
    });
  });

  describe('real-world examples', () => {
    it('should format booking duration (2 hours)', () => {
      const duration = 2 * 60 * 60 * 1000;
      const compact = formatDuration(duration, { locale: 'nb-NO' });
      const long = formatDuration(duration, { style: 'long', locale: 'nb-NO' });

      expect(compact).toBe('2t');
      expect(long).toBe('2 timer');
    });

    it('should format audit log time difference (5 minutes)', () => {
      const duration = 5 * 60 * 1000;
      const result = formatDuration(duration, { locale: 'en-US' });

      expect(result).toBe('5m');
    });

    it('should format notification age (3 days)', () => {
      const duration = 3 * 24 * 60 * 60 * 1000;
      const result = formatDuration(duration, { style: 'long', locale: 'nb-NO' });

      expect(result).toBe('3 dager');
    });

    it('should format session timeout (30 minutes)', () => {
      const duration = 1800; // 30 minutes in seconds
      const result = formatDuration(duration, { unit: 'seconds', locale: 'en-US' });

      expect(result).toBe('30m');
    });
  });
});
