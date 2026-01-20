/**
 * SDK Export Compatibility Tests
 * 
 * Validates @digilist/client-sdk exports are stable and complete
 */

import { describe, it, expect, vi } from 'vitest';

// Unmock the SDK to test real exports
vi.unmock('@digilist/client-sdk');

describe('Client SDK Exports', () => {
  describe('Services', () => {
    it('should export RentalObjectService', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.RentalObjectService).toBeDefined();
    });

    it('should export BookingService', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.BookingService).toBeDefined();
    });

    it('should export AuthService', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.AuthService).toBeDefined();
    });

    it('should export CategoryService', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.CategoryService).toBeDefined();
    });
  });

  describe('Hooks', () => {
    it('should export useRentalObjects', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.useRentalObjects).toBeDefined();
      expect(typeof sdk.useRentalObjects).toBe('function');
    });

    it('should export useRentalObject', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.useRentalObject).toBeDefined();
      expect(typeof sdk.useRentalObject).toBe('function');
    });

    it('should export useBookings', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.useBookings).toBeDefined();
      expect(typeof sdk.useBookings).toBe('function');
    });

    it('should export useCreateBooking', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.useCreateBooking).toBeDefined();
      expect(typeof sdk.useCreateBooking).toBe('function');
    });
  });

  describe('Query Keys', () => {
    it('should export queryKeys factory', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.queryKeys).toBeDefined();
    });

    it('should have rentalObjects query key', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.queryKeys.rentalObjects).toBeDefined();
    });

    it('should have bookings query key', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.queryKeys.bookings).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should export ApiError', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.ApiError).toBeDefined();
    });

    it('should export initializeClient', async () => {
      const sdk = await import('@digilist/client-sdk');
      expect(sdk.initializeClient).toBeDefined();
      expect(typeof sdk.initializeClient).toBe('function');
    });
  });
});
