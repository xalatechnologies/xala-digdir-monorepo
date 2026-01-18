// Skip E2E tests if not explicitly enabled
import { setupMockApi } from '@xala/api/mocks/api-server.mock';
/**
 * Monitoring Workflow Journey E2E Test
 * Full flow: Create alert → Trigger → Acknowledge → Create incident → Resolve
 */
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000';
const TENANT_ID = 'test-tenant';

test.describe('Monitoring Workflow Journey', () => {
  setupMockApi();
  let alertId: string;
  let incidentId: string;

  test('1. Create monitoring alert', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/monitoring/alerts`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        name: 'High API Latency',
        type: 'threshold',
        severity: 'warning',
        condition: {
          metric: 'api.latency.p99',
          operator: 'gt',
          threshold: 500,
        },
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.alert.name).toBe('High API Latency');
    alertId = body.alert.id;
  });

  test('2. List active alerts', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/monitoring/alerts`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.alerts.length).toBeGreaterThan(0);
  });

  test('3. Acknowledge alert', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/monitoring/alerts/${alertId}/acknowledge`, {
      headers: { 
        'x-tenant-id': TENANT_ID,
        'x-user-id': 'on-call-engineer',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('4. Create incident from alert', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/monitoring/incidents`, {
      headers: { 'x-tenant-id': TENANT_ID },
      data: {
        title: 'API Performance Degradation',
        description: 'Elevated latency detected on multiple endpoints',
        severity: 'medium',
        alertId,
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.incident.status).toBe('open');
    incidentId = body.incident.id;
  });

  test('5. Update incident status to investigating', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/monitoring/incidents/${incidentId}/status`, {
      headers: { 
        'x-tenant-id': TENANT_ID,
        'x-user-id': 'sre-team',
      },
      data: { 
        status: 'investigating',
        message: 'Investigating root cause',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('6. Get incident timeline', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/monitoring/incidents/${incidentId}`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.incident.timeline).toBeDefined();
  });

  test('7. Resolve incident', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/monitoring/incidents/${incidentId}/status`, {
      headers: { 
        'x-tenant-id': TENANT_ID,
        'x-user-id': 'sre-team',
      },
      data: { 
        status: 'resolved',
        message: 'Issue resolved - database connection pool increased',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('8. Resolve associated alert', async ({ request }) => {
    const response = await request.put(`${API_URL}/api/monitoring/alerts/${alertId}/resolve`, {
      headers: { 
        'x-tenant-id': TENANT_ID,
        'x-user-id': 'sre-team',
      },
    });

    expect(response.status()).toBe(200);
  });

  test('9. Verify audit trail', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/monitoring/audit-logs`, {
      headers: { 'x-tenant-id': TENANT_ID },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
  });
});
