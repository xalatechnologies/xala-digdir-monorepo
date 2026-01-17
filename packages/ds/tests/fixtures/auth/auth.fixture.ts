export const TEST_CREDENTIALS = {
  user: {
    name: 'Test User',
    email: 'user@test.com',
    token: 'demo-token-user',
    role: 'user',
    baseUrl: 'http://localhost:5178', // Minside app (current port)
  },
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    token: 'demo-token-admin',
    role: 'admin',
    baseUrl: 'http://localhost:5179', // Backoffice app (current port)
  },
};

// Re-export for convenience
export const MINSIDE_URL = TEST_CREDENTIALS.user.baseUrl;
export const BACKOFFICE_URL = TEST_CREDENTIALS.admin.baseUrl;
