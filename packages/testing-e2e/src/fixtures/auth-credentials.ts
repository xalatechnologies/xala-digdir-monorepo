export const TEST_CREDENTIALS = {
  user: {
    email: 'user@example.com',
    password: 'password',
    baseUrl: process.env.WEB_URL || 'http://localhost:6001',
  },
  admin: {
    email: 'admin@platform.test',
    password: 'test-password',
    baseUrl: process.env.BACKOFFICE_URL || 'http://localhost:6003',
  },
};
