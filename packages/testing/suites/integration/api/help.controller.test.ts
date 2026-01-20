/**
 * Help Controller Integration Tests
 * Tests for KRAV-SUP-01 (Opplæringsplan) and KRAV-SUP-03 (Brukerstøtte)
 * Target: 95%+ coverage
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupMockApi } from '@digilist/api/mocks/api-server.mock';

const API_URL = process.env.API_URL || 'http://localhost:4000';
const TENANT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const headers = {
  'Content-Type': 'application/json',
  'X-Tenant-Id': TENANT_ID,
};

describe('HelpController', () => {
  setupMockApi();
  // =========================================================================
  // GET /api/help/faq
  // =========================================================================
  describe('GET /api/help/faq', () => {
  setupMockApi();
    it('should return all FAQs without category filter', async () => {
      const res = await fetch(`${API_URL}/api/help/faq`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      expect(data.meta).toBeDefined();
      expect(data.meta.categories).toBeInstanceOf(Array);
    });

    it('should filter FAQs by category', async () => {
      const res = await fetch(`${API_URL}/api/help/faq?category=booking`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      data.data.forEach((faq: any) => {
        expect(faq.category).toBe('booking');
      });
    });

    it('should return FAQ with required fields', async () => {
      const res = await fetch(`${API_URL}/api/help/faq`, { headers });
      const data = await res.json();

      const faq = data.data[0];
      expect(faq).toHaveProperty('id');
      expect(faq).toHaveProperty('category');
      expect(faq).toHaveProperty('question');
      expect(faq).toHaveProperty('answer');
      expect(faq).toHaveProperty('sortOrder');
    });

    it('should return empty array for unknown category', async () => {
      const res = await fetch(`${API_URL}/api/help/faq?category=nonexistent`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toEqual([]);
    });
  });

  // =========================================================================
  // GET /api/help/guides
  // =========================================================================
  describe('GET /api/help/guides', () => {
  setupMockApi();
    it('should return guides for user role by default', async () => {
      const res = await fetch(`${API_URL}/api/help/guides`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      data.data.forEach((guide: any) => {
        expect(guide.role).toBe('user');
      });
    });

    it('should return guides for admin role', async () => {
      const res = await fetch(`${API_URL}/api/help/guides?role=admin`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      data.data.forEach((guide: any) => {
        expect(guide.role).toBe('admin');
      });
    });

    it('should return guide with required fields', async () => {
      const res = await fetch(`${API_URL}/api/help/guides?role=user`, { headers });
      const data = await res.json();

      const guide = data.data[0];
      expect(guide).toHaveProperty('id');
      expect(guide).toHaveProperty('role');
      expect(guide).toHaveProperty('title');
      expect(guide).toHaveProperty('description');
      expect(guide).toHaveProperty('steps');
      expect(guide.steps).toBeInstanceOf(Array);
      expect(guide).toHaveProperty('estimatedMinutes');
    });
  });

  // =========================================================================
  // GET /api/help/training
  // =========================================================================
  describe('GET /api/help/training', () => {
  setupMockApi();
    it('should return training plan', async () => {
      const res = await fetch(`${API_URL}/api/help/training`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toHaveProperty('plan');
      expect(data.data.plan.title).toBe('Opplæringsplan for Digilist');
    });

    it('should include training modules', async () => {
      const res = await fetch(`${API_URL}/api/help/training`, { headers });
      const data = await res.json();

      expect(data.data.plan.modules).toBeInstanceOf(Array);
      expect(data.data.plan.modules.length).toBeGreaterThan(0);

      const module = data.data.plan.modules[0];
      expect(module).toHaveProperty('id');
      expect(module).toHaveProperty('title');
      expect(module).toHaveProperty('description');
      expect(module).toHaveProperty('duration');
      expect(module).toHaveProperty('targetRoles');
    });

    it('should include resources and support info', async () => {
      const res = await fetch(`${API_URL}/api/help/training`, { headers });
      const data = await res.json();

      expect(data.data).toHaveProperty('resources');
      expect(data.data.resources).toBeInstanceOf(Array);
      expect(data.data).toHaveProperty('support');
      expect(data.data.support).toHaveProperty('email');
    });
  });

  // =========================================================================
  // GET /api/help/tooltips
  // =========================================================================
  describe('GET /api/help/tooltips', () => {
  setupMockApi();
    it('should return tooltip dictionary', async () => {
      const res = await fetch(`${API_URL}/api/help/tooltips`, { headers });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data).toBeDefined();
      expect(typeof data.data).toBe('object');
    });

    it('should include booking tooltips', async () => {
      const res = await fetch(`${API_URL}/api/help/tooltips`, { headers });
      const data = await res.json();

      expect(data.data.booking).toBeDefined();
      expect(data.data.booking.startTime).toBeDefined();
      expect(data.data.booking.endTime).toBeDefined();
    });

    it('should include listing tooltips', async () => {
      const res = await fetch(`${API_URL}/api/help/tooltips`, { headers });
      const data = await res.json();

      expect(data.data.listing).toBeDefined();
      expect(data.data.listing.status).toBeDefined();
    });
  });

  // =========================================================================
  // POST /api/help/contact
  // =========================================================================
  describe('POST /api/help/contact', () => {
  setupMockApi();
    it('should create support ticket with valid data', async () => {
      const res = await fetch(`${API_URL}/api/help/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.no',
          subject: 'Test Subject',
          message: 'This is a test message',
          category: 'booking',
        }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.ticketId).toMatch(/^TKT-/);
      expect(data.data.status).toBe('received');
      expect(data.data.submittedAt).toBeDefined();
    });

    it('should create ticket with minimal required fields', async () => {
      const res = await fetch(`${API_URL}/api/help/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'minimal@example.no',
          message: 'Minimal test',
        }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.data.ticketId).toBeDefined();
    });

    it('should reject request without email', async () => {
      const res = await fetch(`${API_URL}/api/help/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'Test without email',
        }),
      });
      expect(res.status).toBe(400);
    });

    it('should reject request without message', async () => {
      const res = await fetch(`${API_URL}/api/help/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: 'test@example.no',
        }),
      });
      expect(res.status).toBe(400);
    });
  });
});
