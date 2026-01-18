/**
 * API test helpers
 */

const API_BASE = process.env.API_URL || 'http://localhost:4000';

export interface ApiTestResponse<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
  headers: Headers;
}

/**
 * Make authenticated API request for testing
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
): Promise<ApiTestResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  return {
    status: response.status,
    ok: response.ok,
    data: data as T,
    headers: response.headers,
  };
}

/**
 * Wait for API to be available (useful for integration tests)
 */
export async function waitForApi(
  healthEndpoint = '/api/health',
  maxAttempts = 30,
  intervalMs = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${API_BASE}${healthEndpoint}`);
      if (response.ok) return true;
    } catch {
      // API not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

/**
 * Create test login and get session cookie
 */
export async function testLogin(
  role: string,
  tenantId = 'test-tenant'
): Promise<string | null> {
  const response = await fetch(`${API_BASE}/api/auth/test-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, tenantId }),
  });

  if (!response.ok) return null;
  
  return response.headers.get('set-cookie');
}
