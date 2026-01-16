/**
 * k6 Performance Test Configuration
 * Load, stress, and spike testing for the Unified API
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const tenantLatency = new Trend('tenant_request_duration');
const listingLatency = new Trend('listing_request_duration');
const bookingLatency = new Trend('booking_request_duration');

// Configuration
const BASE_URL = __ENV.API_URL || 'http://localhost:4000';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-tenant-id': 'perf-test-tenant',
};

/**
 * Test Options
 * 
 * Stages:
 * - Load test: Gradual ramp-up to target VUs
 * - Stress test: Push beyond normal load
 * - Spike test: Sudden traffic bursts
 */
export const options = {
  scenarios: {
    // Load Test: Sustained load
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },   // Ramp up
        { duration: '1m', target: 50 },    // Hold
        { duration: '30s', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '10s',
    },
    // Stress Test: Beyond capacity
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '1m', target: 200 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
      startTime: '2m30s', // After load test
    },
    // Spike Test: Sudden burst
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },  // Spike
        { duration: '1m', target: 500 },   // Hold
        { duration: '10s', target: 0 },    // Drop
      ],
      gracefulRampDown: '5s',
      startTime: '5m', // After stress test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    errors: ['rate<0.01'],
    tenant_request_duration: ['p(95)<300'],
    listing_request_duration: ['p(95)<400'],
    booking_request_duration: ['p(95)<500'],
  },
};

// Setup: Create test data
export function setup() {
  // Create a tenant for testing
  const createRes = http.post(`${BASE_URL}/api/tenants`, JSON.stringify({
    name: 'Performance Test Tenant',
    slug: `perf-test-${Date.now()}`,
    ownerEmail: 'perf@test.com',
    ownerName: 'Perf Tester',
    plan: 'enterprise',
  }), { headers: HEADERS });
  
  return { tenantId: createRes.json('tenant.id') || 'default' };
}

// Main test function
export default function(data) {
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response is ok': (r) => r.json('status') === 'ok',
    });
  });

  group('Tenant Operations', () => {
    // List tenants
    const listRes = http.get(`${BASE_URL}/api/tenants`, { headers: HEADERS });
    tenantLatency.add(listRes.timings.duration);
    
    const listOk = check(listRes, {
      'tenant list is 200': (r) => r.status === 200,
      'tenant list has data': (r) => Array.isArray(r.json('data')),
    });
    errorRate.add(!listOk);

    sleep(0.1);
  });

  group('Listing Operations', () => {
    // List listings
    const listRes = http.get(`${BASE_URL}/api/listings`, { headers: HEADERS });
    listingLatency.add(listRes.timings.duration);
    
    const listOk = check(listRes, {
      'listing list is 200': (r) => r.status === 200,
    });
    errorRate.add(!listOk);

    // Create listing
    const createRes = http.post(`${BASE_URL}/api/listings`, JSON.stringify({
      title: `Test Listing ${Date.now()}`,
      slug: `test-listing-${Date.now()}`,
      type: 'service',
      description: 'Performance test listing',
    }), { headers: HEADERS });
    
    const createOk = check(createRes, {
      'listing create is 201': (r) => r.status === 201,
    });
    errorRate.add(!createOk);

    sleep(0.2);
  });

  group('Booking Operations', () => {
    // List bookings
    const listRes = http.get(`${BASE_URL}/api/bookings`, { headers: HEADERS });
    bookingLatency.add(listRes.timings.duration);
    
    const listOk = check(listRes, {
      'booking list is 200': (r) => r.status === 200,
    });
    errorRate.add(!listOk);

    sleep(0.1);
  });

  group('Monitoring Operations', () => {
    // Get audit logs
    const auditRes = http.get(`${BASE_URL}/api/monitoring/audit-logs`, { headers: HEADERS });
    check(auditRes, {
      'audit logs is 200': (r) => r.status === 200,
    });

    // Get alerts
    const alertsRes = http.get(`${BASE_URL}/api/monitoring/alerts`, { headers: HEADERS });
    check(alertsRes, {
      'alerts is 200': (r) => r.status === 200,
    });

    sleep(0.1);
  });

  sleep(1);
}

// Teardown: Cleanup
export function teardown(data) {
  // Delete test tenant if created
  if (data.tenantId && data.tenantId !== 'default') {
    http.del(`${BASE_URL}/api/tenants/${data.tenantId}`, null, { headers: HEADERS });
  }
}
