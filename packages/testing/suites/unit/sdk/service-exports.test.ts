/**
 * SDK Service Exports Tests
 * Validates SDK exports are available
 */

import { describe, it, expect } from 'vitest';

describe('SDK Service Exports', () => {
  describe('RentalObjectService', () => {
    it('should export RentalObjectService class', async () => {
      const { RentalObjectService } = await import('@digilist/client-sdk');
      expect(RentalObjectService).toBeDefined();
      expect(typeof RentalObjectService).toBe('function');
    });
  });

  describe('BookingService', () => {
    it('should export BookingService class', async () => {
      const { BookingService } = await import('@digilist/client-sdk');
      expect(BookingService).toBeDefined();
      expect(typeof BookingService).toBe('function');
    });
  });

  describe('OrganizationService', () => {
    it('should export OrganizationService class', async () => {
      const { OrganizationService } = await import('@digilist/client-sdk');
      expect(OrganizationService).toBeDefined();
      expect(typeof OrganizationService).toBe('function');
    });
  });

  describe('UserService', () => {
    it('should export UserService class', async () => {
      const { UserService } = await import('@digilist/client-sdk');
      expect(UserService).toBeDefined();
      expect(typeof UserService).toBe('function');
    });
  });

  describe('StorageService', () => {
    it('should export StorageService class', async () => {
      const { StorageService } = await import('@digilist/client-sdk');
      expect(StorageService).toBeDefined();
      expect(typeof StorageService).toBe('function');
    });
  });
});
