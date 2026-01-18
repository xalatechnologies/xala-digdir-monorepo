/**
 * Projection Schemas Tests
 * 
 * Ensures projection DTOs validate correctly.
 */
import { describe, it, expect } from 'vitest';
import {
  RentalObjectCardProjectionSchema,
  RentalObjectDetailsProjectionSchema,
} from '@digilist/contracts/projections/rental-object.projection';
import { CapabilitiesProjectionSchema } from '@digilist/contracts/projections/capabilities.projection';

describe('Rental Object Projections', () => {
  describe('RentalObjectCardProjectionSchema', () => {
    it('should validate a complete card projection', () => {
      const card = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-object',
        name: 'Test Object',
        typeLabel: 'Venue',
        categoryI18nKey: 'sdk.category.LOKALER_OG_BANER',
        locationFormatted: 'Test Street 1, 0001 Oslo',
        priceDisplay: '100 NOK/time',
        capacityLabel: '10 personer',
        primaryImageUrl: 'https://example.com/image.jpg',
        descriptionExcerpt: 'A great place...',
        isAvailable: true,
        isFeatured: false,
        tags: ['sports', 'outdoor'],
      };

      const result = RentalObjectCardProjectionSchema.safeParse(card);
      expect(result.success).toBe(true);
    });

    it('should validate minimal card projection', () => {
      const card = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test',
        name: 'Test',
        typeLabel: 'Venue',
        categoryI18nKey: 'sdk.category.test',
        priceDisplay: '100 NOK',
        isAvailable: true,
      };

      const result = RentalObjectCardProjectionSchema.safeParse(card);
      expect(result.success).toBe(true);
    });
  });

  describe('RentalObjectDetailsProjectionSchema', () => {
    it('should validate a details projection', () => {
      const details = {
        // Base card fields
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'test-object',
        name: 'Test Object',
        typeLabel: 'Venue',
        categoryI18nKey: 'sdk.category.LOKALER_OG_BANER',
        priceDisplay: '100 NOK/time',
        isAvailable: true,
        // Extended fields
        description: 'Full description here...',
        images: [
          { url: 'https://example.com/image1.jpg', alt: 'Image 1', isPrimary: true },
          { url: 'https://example.com/image2.jpg', alt: 'Image 2' },
        ],
        location: {
          address: 'Test Street 1',
          city: 'Oslo',
          municipality: 'Oslo',
          coordinates: { lat: 59.9, lng: 10.7 },
        },
        pricing: {
          basePrice: 100,
          currency: 'NOK',
          unit: 'hour',
          unitLabel: 'per time',
          formattedPrice: '100 NOK',
        },
        canBook: true,
        canEdit: false,
        availableActions: [
          { action: 'book', label: 'Book Now', enabled: true },
          { action: 'share', label: 'Share', enabled: true },
        ],
      };

      const result = RentalObjectDetailsProjectionSchema.safeParse(details);
      expect(result.success).toBe(true);
    });
  });
});

describe('Capabilities Projections', () => {
  describe('CapabilitiesProjectionSchema', () => {
    it('should validate a capabilities projection', () => {
      const capabilities = {
        role: 'admin',
        capabilities: ['CAP_USER_VIEW', 'CAP_USER_EDIT'],
        featureFlags: { feature1: true, feature2: false },
        uiHints: {
          showAdminNav: true,
          showReports: true,
        },
        organizationScopes: ['org-1', 'org-2'],
      };

      const result = CapabilitiesProjectionSchema.safeParse(capabilities);
      expect(result.success).toBe(true);
    });

    it('should validate minimal capabilities projection', () => {
      const capabilities = {
        role: 'user',
        capabilities: [],
        featureFlags: {},
      };

      const result = CapabilitiesProjectionSchema.safeParse(capabilities);
      expect(result.success).toBe(true);
    });
  });
});
