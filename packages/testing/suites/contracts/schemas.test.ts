/**
 * Contract Schemas Tests
 * 
 * Ensures Zod schemas validate correctly and TypeScript types are inferred properly.
 */
import { describe, it, expect } from 'vitest';
import {
  UUIDSchema,
  SlugSchema,
  MetadataSchema,
  PaginationSchema,
  SortOrderSchema,
} from '@testing/stubs/api-importscommon.schema';
import {
  RentalObjectStatusSchema,
  RentalObjectCategorySchema,
  BookingTimeModeSchema,
  CreateRentalObjectSchema,
} from '@testing/stubs/api-importsrental-object.schema';
import {
  BookingStatusSchema,
  CreateBookingSchema,
} from '@testing/stubs/api-importsbooking.schema';
import {
  CreateOrganizationSchema,
} from '@testing/stubs/api-importsorganization.schema';
import {
  ActionCodeSchema,
  CapabilitySchema,
} from '@testing/stubs/api-importscapabilities.schema';

describe('Common Schemas', () => {
  describe('UUIDSchema', () => {
    it('should validate valid UUIDs', () => {
      const result = UUIDSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const result = UUIDSchema.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('SlugSchema', () => {
    it('should validate lowercase slugs', () => {
      expect(SlugSchema.safeParse('my-slug').success).toBe(true);
      expect(SlugSchema.safeParse('my-slug-123').success).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(SlugSchema.safeParse('My Slug').success).toBe(false);
      expect(SlugSchema.safeParse('').success).toBe(false);
    });
  });

  describe('MetadataSchema', () => {
    it('should validate arbitrary objects', () => {
      const result = MetadataSchema.safeParse({
        key: 'value',
        nested: { foo: 'bar' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('PaginationSchema', () => {
    it('should use default values', () => {
      const result = PaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should enforce maximum limit', () => {
      const result = PaginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false); // 200 > max of 100
    });

    it('should accept valid values', () => {
      const result = PaginationSchema.parse({ page: 2, limit: 50 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });
  });

  describe('SortOrderSchema', () => {
    it('should validate sort order values', () => {
      expect(SortOrderSchema.safeParse('asc').success).toBe(true);
      expect(SortOrderSchema.safeParse('desc').success).toBe(true);
      expect(SortOrderSchema.safeParse('invalid').success).toBe(false);
    });
  });
});

describe('RentalObject Schemas', () => {
  describe('RentalObjectStatusSchema', () => {
    it('should validate non-empty status strings', () => {
      expect(RentalObjectStatusSchema.safeParse('draft').success).toBe(true);
      expect(RentalObjectStatusSchema.safeParse('published').success).toBe(true);
      expect(RentalObjectStatusSchema.safeParse('archived').success).toBe(true);
      // Dynamic - any string is valid, just needs to be non-empty
    });

    it('should reject empty string', () => {
      expect(RentalObjectStatusSchema.safeParse('').success).toBe(false);
    });
  });

  describe('RentalObjectCategorySchema', () => {
    it('should validate non-empty category strings', () => {
      expect(RentalObjectCategorySchema.safeParse('LOKALER_OG_BANER').success).toBe(true);
      // Dynamic - any non-empty string is valid
    });

    it('should reject empty string', () => {
      expect(RentalObjectCategorySchema.safeParse('').success).toBe(false);
    });
  });

  describe('BookingTimeModeSchema', () => {
    it('should validate time mode values', () => {
      expect(BookingTimeModeSchema.safeParse('PERIOD').success).toBe(true);
      expect(BookingTimeModeSchema.safeParse('SLOT').success).toBe(true);
      expect(BookingTimeModeSchema.safeParse('ALL_DAY').success).toBe(true);
    });
  });

  describe('CreateRentalObjectSchema', () => {
    it('should validate complete rental object creation', () => {
      const result = CreateRentalObjectSchema.safeParse({
        name: 'Test Object',
        category: 'LOKALER_OG_BANER',
        timeMode: 'PERIOD',
        organizationId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject incomplete data (missing category)', () => {
      const result = CreateRentalObjectSchema.safeParse({
        name: 'Test',
        // Missing required 'category' field
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Booking Schemas', () => {
  describe('BookingStatusSchema', () => {
    it('should validate booking status values', () => {
      expect(BookingStatusSchema.safeParse('pending').success).toBe(true);
      expect(BookingStatusSchema.safeParse('confirmed').success).toBe(true);
      expect(BookingStatusSchema.safeParse('cancelled').success).toBe(true);
    });
  });

  describe('CreateBookingSchema', () => {
    it('should validate complete booking creation', () => {
      const result = CreateBookingSchema.safeParse({
        rentalObjectId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2025-01-20T10:00:00Z',
        endTime: '2025-01-20T12:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject booking without required fields', () => {
      const result = CreateBookingSchema.safeParse({
        rentalObjectId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Organization Schemas', () => {
  describe('CreateOrganizationSchema', () => {
    it('should validate organization creation', () => {
      const result = CreateOrganizationSchema.safeParse({
        name: 'Test Organization',
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = CreateOrganizationSchema.safeParse({
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('Capabilities Schemas', () => {
  describe('ActionCodeSchema', () => {
    it('should validate action codes', () => {
      expect(ActionCodeSchema.safeParse('create').success).toBe(true);
      expect(ActionCodeSchema.safeParse('update').success).toBe(true);
      expect(ActionCodeSchema.safeParse('delete').success).toBe(true);
      expect(ActionCodeSchema.safeParse('publish').success).toBe(true);
      expect(ActionCodeSchema.safeParse('unpublish').success).toBe(true);
      expect(ActionCodeSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('CapabilitySchema', () => {
    it('should validate capability strings', () => {
      expect(CapabilitySchema.safeParse('CAP_USER_VIEW').success).toBe(true);
      expect(CapabilitySchema.safeParse('CAP_RENTAL_OBJECT_EDIT').success).toBe(true);
    });

    it('should reject non-CAP_ prefixed strings', () => {
      expect(CapabilitySchema.safeParse('USER_VIEW').success).toBe(false);
    });
  });
});
