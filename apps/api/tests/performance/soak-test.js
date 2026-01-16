/**
 * Soak Test - Long-running stability test
 * Tests for memory leaks and connection pool issues over extended period
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const requestCount = new Counter('requests');
const memoryTrend = new Trend('memory_usage');

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';
const HEADERS = {
  'Content-Type': 'application/json',
  'x-tenant-id': 'soak-test-tenant',
};

export const options = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 20,
      duration: '1h', // 1 hour soak test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.001'], // Less than 0.1% errors for soak
    errors: ['rate<0.001'],
  },
};

export default function() {
  // Mix of read/write operations
  const operations = [
    () => http.get(`${BASE_URL}/health`),
    () => http.get(`${BASE_URL}/api/tenants`, { headers: HEADERS }),
    () => http.get(`${BASE_URL}/api/listings`, { headers: HEADERS }),
    () => http.get(`${BASE_URL}/api/bookings`, { headers: HEADERS }),
    () => http.get(`${BASE_URL}/api/monitoring/audit-logs`, { headers: HEADERS }),
    () => http.get(`${BASE_URL}/api/monitoring/alerts`, { headers: HEADERS }),
  ];

  // Random operation
  const op = operations[Math.floor(Math.random() * operations.length)];
  const res = op();
  
  requestCount.add(1);
  
  const ok = check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!ok);
  
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5s between requests
}

export function handleSummary(data) {
  return {
    'soak-test-summary.json': JSON.stringify(data, null, 2),
  };
}
