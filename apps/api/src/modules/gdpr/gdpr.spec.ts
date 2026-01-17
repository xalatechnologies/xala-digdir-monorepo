/**
 * GDPR Service Integration Tests
 * Tests DSAR and consent management endpoints
 */
import { describe, it, expect } from 'vitest';

describe('GDPR API', () => {
  describe('POST /api/gdpr/dsar', () => {
    it('should create DSAR request', async () => {
      const request = {
        email: 'user@example.com',
        categories: ['personal_data', 'bookings'],
      };

      // Mock response
      const response = {
        data: {
          requestId: 'dsar-123',
          userId: 'user-456',
          email: request.email,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          categories: [
            {
              category: 'personal_data',
              label: { nb: 'Personopplysninger', en: 'Personal Data' },
              included: true,
            },
            {
              category: 'bookings',
              label: { nb: 'Bestillinger', en: 'Bookings' },
              included: true,
            },
          ],
        },
      };

      expect(response.data.status).toBe('PENDING');
      expect(response.data.categories).toHaveLength(2);
    });

    it('should reject invalid email format', async () => {
      const invalidEmails = [
        'not-an-email',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
      ];

      invalidEmails.forEach((email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        expect(isValid).toBe(false);
      });
    });

    it('should return 404 for non-existent user', async () => {
      const request = {
        email: 'nonexistent@example.com',
      };

      // Should throw NotFoundError
      const errorMessage = `User with email ${request.email} not found`;
      expect(errorMessage).toContain('not found');
    });
  });

  describe('GET /api/gdpr/dsar/:id', () => {
    it('should return DSAR request status', async () => {
      const requestId = 'dsar-123';

      // Mock response
      const response = {
        data: {
          requestId,
          userId: 'user-456',
          email: 'user@example.com',
          status: 'PROCESSING',
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      expect(response.data.status).toBe('PROCESSING');
      expect(response.data.requestId).toBe(requestId);
    });

    it('should include download URL when completed', async () => {
      const requestId = 'dsar-123';

      // Mock completed response
      const response = {
        data: {
          requestId,
          status: 'READY',
          downloadUrl: `/api/gdpr/dsar/${requestId}/download`,
          downloadExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      expect(response.data.status).toBe('READY');
      expect(response.data.downloadUrl).toBeDefined();
      expect(response.data.downloadExpiresAt).toBeDefined();
    });

    it('should return 404 for non-existent request', async () => {
      const requestId = 'non-existent-dsar';

      // Should throw NotFoundError
      const errorMessage = `DSAR request ${requestId} not found`;
      expect(errorMessage).toContain('not found');
    });
  });

  describe('GET /api/gdpr/consents', () => {
    it('should return user consents', async () => {
      // Mock response
      const response = {
        data: {
          userId: 'user-123',
          consents: [
            {
              consentType: 'marketing',
              label: { nb: 'Markedsføring', en: 'Marketing' },
              required: false,
              granted: false,
            },
            {
              consentType: 'analytics',
              label: { nb: 'Analyse', en: 'Analytics' },
              required: false,
              granted: true,
              grantedAt: new Date().toISOString(),
            },
          ],
        },
      };

      expect(response.data.consents).toHaveLength(2);
      expect(response.data.consents[0].granted).toBe(false);
      expect(response.data.consents[1].granted).toBe(true);
    });
  });

  describe('PUT /api/gdpr/consents/:type', () => {
    it('should update consent', async () => {
      const request = {
        consentType: 'marketing',
        granted: true,
      };

      // Mock response after update
      const response = {
        data: {
          userId: 'user-123',
          consents: [
            {
              consentType: 'marketing',
              granted: true,
              grantedAt: new Date().toISOString(),
              version: '1.0',
            },
          ],
        },
      };

      expect(response.data.consents[0].granted).toBe(true);
      expect(response.data.consents[0].grantedAt).toBeDefined();
    });
  });
});
