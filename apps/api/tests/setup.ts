/**
 * Vitest Test Setup
 * Common test utilities and mocks
 */
import { vi, beforeEach, afterEach } from 'vitest';
import { container } from '../src/core/container';
import { resetAuditService } from '../src/core/audit/audit.service';

// Mock database
export const createMockDb = () => ({
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  query: {},
});

// Mock adapters
export const createMockAdapters = () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  cache: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  },
  analytics: {
    track: vi.fn().mockResolvedValue(undefined),
    identify: vi.fn().mockResolvedValue(undefined),
  },
  email: {
    send: vi.fn().mockResolvedValue(undefined),
  },
});

// Test fixtures
export const fixtures = {
  tenant: {
    id: 'tenant-123',
    name: 'Test Tenant',
    slug: 'test-tenant',
    status: 'active',
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  user: {
    id: 'user-123',
    tenantId: 'tenant-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  listing: {
    id: 'listing-123',
    tenantId: 'tenant-123',
    title: 'Test Listing',
    slug: 'test-listing',
    type: 'rental',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  booking: {
    id: 'booking-123',
    tenantId: 'tenant-123',
    listingId: 'listing-123',
    customerId: 'user-123',
    status: 'pending',
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

// Reset mocks before each test and register container providers
export const setupTestHooks = () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singletons and container
    resetAuditService();
    container.clear();
    const mockDb = createMockDb();
    const mockAdapters = createMockAdapters();
    container.registerValue('Database', mockDb);
    container.registerValue('Adapters', mockAdapters);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
};

