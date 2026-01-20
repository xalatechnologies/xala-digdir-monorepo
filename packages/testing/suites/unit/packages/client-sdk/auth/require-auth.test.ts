/**
 * Unit Tests for requireAuth and resumeFlow helpers
 * Tests the AuthService methods for session-safe return-to-flow authentication
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { FlowContext } from '@digilist/api/types/auth';
import {
  AuthService,
  type RequireAuthOptions,
} from '@digilist/api/services/auth.service';
import { FLOW_CONTEXT_KEY } from '@digilist/api/utils/flow-context';

// =============================================================================
// Mock client factory
// =============================================================================

vi.mock('../../core/client-factory', () => ({
  getClient: () => ({
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { redirectUrl: 'https://auth.example.com/oauth' } }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
  }),
}));

// =============================================================================
// Test Fixtures
// =============================================================================

function createValidFlowContext(overrides?: Partial<FlowContext>): FlowContext {
  return {
    returnTo: '/listings/123',
    timestamp: Date.now(),
    tenantId: 'tenant-1',
    correlationId: 'flow_abc123_xyz789',
    ...overrides,
  };
}

function createBookingFlowContext(): FlowContext {
  return {
    returnTo: '/listings/123',
    timestamp: Date.now(),
    tenantId: 'tenant-1',
    correlationId: 'flow_abc123_xyz789',
    listingId: 'listing-123',
    bookingMode: 'SLOTS',
    selectedDates: ['2024-01-15', '2024-01-16'],
    selectedSlots: [
      { date: '2024-01-15', startTime: '09:00', endTime: '10:00' },
      { date: '2024-01-15', startTime: '14:00', endTime: '15:00' },
    ],
    recurringRules: {
      frequency: 'weekly',
      interval: 1,
      endDate: '2024-03-15',
    },
    formData: {
      notes: 'Test booking',
      attendees: 5,
    },
  };
}

// =============================================================================
// Mock sessionStorage
// =============================================================================

const createMockSessionStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
  };
};

// =============================================================================
// Tests
// =============================================================================

describe('AuthService Flow Context Methods', () => {
  let authService: AuthService;
  let mockSessionStorage: ReturnType<typeof createMockSessionStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage = createMockSessionStorage();

    // Mock window.location for URL validation and path generation
    vi.stubGlobal('window', {
      location: {
        origin: 'https://digilist.no',
        pathname: '/current/path',
        search: '?query=test',
      },
    });
    vi.stubGlobal('sessionStorage', mockSessionStorage);

    authService = new AuthService();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ===========================================================================
  // requireAuth Tests
  // ===========================================================================

  describe('requireAuth', () => {
    describe('Basic Functionality', () => {
      it('should save flow context and return login URL', () => {
        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
        });

        expect(result.success).toBe(true);
        expect(result.loginUrl).toContain('/login');
        expect(result.loginUrl).toContain('returnTo=');
        expect(result.flowContext).toBeDefined();
        expect(result.flowContext.tenantId).toBe('tenant-1');
      });

      it('should use provided returnTo URL', () => {
        const result = authService.requireAuth({
          returnTo: '/bookings/456',
          tenantId: 'tenant-1',
        });

        expect(result.flowContext.returnTo).toBe('/bookings/456');
        expect(result.loginUrl).toContain(encodeURIComponent('/bookings/456'));
      });

      it('should use current path when returnTo not provided', () => {
        // Update window mock to use a path that passes validation
        vi.stubGlobal('window', {
          location: {
            origin: 'https://digilist.no',
            pathname: '/listings/current',
            search: '',
          },
        });

        const result = authService.requireAuth({
          tenantId: 'tenant-1',
        });

        // Should use window.location.pathname
        expect(result.flowContext.returnTo).toBe('/listings/current');
      });

      it('should generate unique correlationId', () => {
        const result1 = authService.requireAuth({
          returnTo: '/listings',
          tenantId: 'tenant-1',
        });

        // Clear storage to allow new context
        mockSessionStorage.clear();

        const result2 = authService.requireAuth({
          returnTo: '/listings',
          tenantId: 'tenant-1',
        });

        expect(result1.flowContext.correlationId).toBeDefined();
        expect(result2.flowContext.correlationId).toBeDefined();
        expect(result1.flowContext.correlationId).not.toBe(result2.flowContext.correlationId);
      });

      it('should set timestamp on created flow context', () => {
        const beforeTime = Date.now();

        const result = authService.requireAuth({
          returnTo: '/listings',
          tenantId: 'tenant-1',
        });

        const afterTime = Date.now();

        expect(result.flowContext.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(result.flowContext.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });

    describe('Error Handling', () => {
      it('should throw error when tenantId is not provided and no flowContext given', () => {
        expect(() => {
          authService.requireAuth({
            returnTo: '/listings/123',
          } as RequireAuthOptions);
        }).toThrow('tenantId is required when flowContext is not provided');
      });

      it('should not throw when flowContext is provided without tenantId', () => {
        const flowContext = createValidFlowContext();

        const result = authService.requireAuth({
          flowContext,
        });

        expect(result.success).toBe(true);
        expect(result.flowContext).toBe(flowContext);
      });
    });

    describe('Booking State Preservation', () => {
      it('should preserve listingId in flow context', () => {
        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          listingId: 'listing-123',
        });

        expect(result.flowContext.listingId).toBe('listing-123');
      });

      it('should preserve bookingMode in flow context', () => {
        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          bookingMode: 'SLOTS',
        });

        expect(result.flowContext.bookingMode).toBe('SLOTS');
      });

      it('should preserve selectedDates in flow context', () => {
        const selectedDates = ['2024-01-15', '2024-01-16'];

        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          selectedDates,
        });

        expect(result.flowContext.selectedDates).toEqual(selectedDates);
      });

      it('should preserve selectedSlots in flow context', () => {
        const selectedSlots = [
          { date: '2024-01-15', startTime: '09:00', endTime: '10:00' },
          { date: '2024-01-15', startTime: '14:00', endTime: '15:00' },
        ];

        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          selectedSlots,
        });

        expect(result.flowContext.selectedSlots).toEqual(selectedSlots);
      });

      it('should preserve recurringRules in flow context', () => {
        const recurringRules = {
          frequency: 'weekly' as const,
          interval: 2,
          endDate: '2024-06-30',
        };

        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          recurringRules,
        });

        expect(result.flowContext.recurringRules).toEqual(recurringRules);
      });

      it('should preserve formData in flow context', () => {
        const formData = {
          notes: 'Test booking notes',
          attendees: 10,
          equipment: ['projector', 'whiteboard'],
        };

        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
          formData,
        });

        expect(result.flowContext.formData).toEqual(formData);
      });

      it('should preserve complete booking flow state', () => {
        const result = authService.requireAuth({
          returnTo: '/listings/listing-456',
          tenantId: 'kommune-oslo',
          listingId: 'listing-456',
          bookingMode: 'SLOTS',
          selectedDates: ['2024-02-20'],
          selectedSlots: [
            { date: '2024-02-20', startTime: '10:00', endTime: '12:00' },
          ],
          recurringRules: {
            frequency: 'weekly',
            interval: 1,
          },
          formData: {
            purpose: 'Team meeting',
            attendees: 5,
          },
        });

        expect(result.flowContext.tenantId).toBe('kommune-oslo');
        expect(result.flowContext.listingId).toBe('listing-456');
        expect(result.flowContext.bookingMode).toBe('SLOTS');
        expect(result.flowContext.selectedDates).toEqual(['2024-02-20']);
        expect(result.flowContext.selectedSlots).toHaveLength(1);
        expect(result.flowContext.recurringRules?.frequency).toBe('weekly');
        expect(result.flowContext.formData?.purpose).toBe('Team meeting');
      });
    });

    describe('Using Existing FlowContext', () => {
      it('should use provided flowContext directly', () => {
        const existingContext = createBookingFlowContext();

        const result = authService.requireAuth({
          flowContext: existingContext,
        });

        expect(result.flowContext).toBe(existingContext);
        expect(result.flowContext.listingId).toBe('listing-123');
        expect(result.flowContext.bookingMode).toBe('SLOTS');
      });

      it('should ignore other options when flowContext is provided', () => {
        const existingContext = createValidFlowContext({
          tenantId: 'original-tenant',
          returnTo: '/original/path',
        });

        const result = authService.requireAuth({
          flowContext: existingContext,
          tenantId: 'different-tenant',
          returnTo: '/different/path',
          listingId: 'listing-999',
        });

        expect(result.flowContext.tenantId).toBe('original-tenant');
        expect(result.flowContext.returnTo).toBe('/original/path');
        expect(result.flowContext.listingId).toBeUndefined();
      });
    });

    describe('Storage Integration', () => {
      it('should save flow context to sessionStorage', () => {
        authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
        });

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
          FLOW_CONTEXT_KEY,
          expect.any(String)
        );
      });

      it('should return success false if storage fails', () => {
        mockSessionStorage.setItem.mockImplementationOnce(() => {
          throw new Error('Storage quota exceeded');
        });

        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
        });

        expect(result.success).toBe(false);
      });
    });

    describe('URL Security', () => {
      it('should sanitize malicious returnTo URLs', () => {
        const result = authService.requireAuth({
          returnTo: 'javascript:alert(1)',
          tenantId: 'tenant-1',
        });

        // Should be sanitized to '/'
        expect(result.flowContext.returnTo).toBe('/');
      });

      it('should sanitize external URLs', () => {
        const result = authService.requireAuth({
          returnTo: 'https://evil.com/steal-data',
          tenantId: 'tenant-1',
        });

        expect(result.flowContext.returnTo).toBe('/');
      });

      it('should allow valid relative paths', () => {
        const result = authService.requireAuth({
          returnTo: '/listings/123',
          tenantId: 'tenant-1',
        });

        expect(result.flowContext.returnTo).toBe('/listings/123');
      });
    });
  });

  // ===========================================================================
  // resumeFlow Tests
  // ===========================================================================

  describe('resumeFlow', () => {
    describe('No Stored Context', () => {
      it('should return hasContext false when no context stored', () => {
        mockSessionStorage.getItem.mockReturnValueOnce(null);

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(false);
        expect(result.flowContext).toBeUndefined();
      });
    });

    describe('Valid Stored Context', () => {
      it('should restore valid flow context', () => {
        const storedContext = createValidFlowContext();
        const serialized = JSON.stringify(storedContext);
        // Mock needs to return value for multiple calls (hasStoredFlowContext and loadFlowContextFromStorage)
        mockSessionStorage.getItem.mockReturnValue(serialized);

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(true);
        expect(result.flowContext).toEqual(storedContext);

        // Reset mock after test
        mockSessionStorage.getItem.mockReset();
      });

      it('should restore booking flow context with all fields', () => {
        const storedContext = createBookingFlowContext();
        const serialized = JSON.stringify(storedContext);
        mockSessionStorage.getItem.mockReturnValue(serialized);

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(true);
        expect(result.flowContext?.listingId).toBe('listing-123');
        expect(result.flowContext?.bookingMode).toBe('SLOTS');
        expect(result.flowContext?.selectedSlots).toHaveLength(2);
        expect(result.flowContext?.recurringRules?.frequency).toBe('weekly');
        expect(result.flowContext?.formData?.notes).toBe('Test booking');

        mockSessionStorage.getItem.mockReset();
      });

      it('should include returnToConfig in result', () => {
        const storedContext = createValidFlowContext();
        const serialized = JSON.stringify(storedContext);
        mockSessionStorage.getItem.mockReturnValue(serialized);

        const result = authService.resumeFlow();

        expect(result.returnToConfig).toBeDefined();
        expect(result.returnToConfig?.url).toBe(storedContext.returnTo);
        expect(result.returnToConfig?.flowContext).toEqual(storedContext);
        expect(result.returnToConfig?.expiresAt).toBe(
          storedContext.timestamp + 30 * 60 * 1000
        );

        mockSessionStorage.getItem.mockReset();
      });
    });

    describe('Clear After Load', () => {
      it('should clear context after load by default', () => {
        const storedContext = createValidFlowContext();
        const serialized = JSON.stringify(storedContext);
        mockSessionStorage.getItem.mockReturnValue(serialized);

        authService.resumeFlow();

        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

        mockSessionStorage.getItem.mockReset();
      });

      it('should not clear context when clearAfterLoad is false', () => {
        const storedContext = createValidFlowContext();
        const serialized = JSON.stringify(storedContext);
        mockSessionStorage.getItem.mockReturnValue(serialized);

        authService.resumeFlow(false);

        expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();

        mockSessionStorage.getItem.mockReset();
      });
    });

    describe('Invalid Stored Context', () => {
      it('should return hasContext false for malformed JSON', () => {
        // When storage contains invalid JSON, hasStoredFlowContext() returns false
        // and resumeFlow returns early without wasInvalid flag
        // (The underlying utility clears the storage in this case)
        mockSessionStorage.getItem.mockReturnValue('not valid json');

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(false);
        // Storage cleanup happens in loadFlowContextFromStorage
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

        mockSessionStorage.getItem.mockReset();
      });

      it('should return hasContext false for missing required fields', () => {
        const incompleteContext = { returnTo: '/listings' }; // Missing timestamp, tenantId, correlationId
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify(incompleteContext));

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(false);
        // Storage cleanup happens in loadFlowContextFromStorage
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

        mockSessionStorage.getItem.mockReset();
      });

      it('should return wasInvalid true when context becomes invalid between checks', () => {
        // Simulates a race condition where hasStoredFlowContext returns true
        // but loadFlowContextFromStorage returns null (context changed/corrupted)
        const validContext = createValidFlowContext();
        mockSessionStorage.getItem
          .mockReturnValueOnce(JSON.stringify(validContext)) // First call (hasStoredFlowContext)
          .mockReturnValueOnce('corrupted data'); // Second call (loadFlowContextFromStorage)

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(false);
        expect(result.wasInvalid).toBe(true);

        mockSessionStorage.getItem.mockReset();
      });
    });

    describe('Expired Stored Context', () => {
      it('should return hasContext false for expired context', () => {
        // When storage contains expired context, hasStoredFlowContext() returns false
        // and resumeFlow returns early (the underlying utility clears expired context)
        const expiredContext = createValidFlowContext({
          timestamp: Date.now() - (31 * 60 * 1000), // 31 minutes ago
        });
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredContext));

        const result = authService.resumeFlow();

        expect(result.hasContext).toBe(false);
        // Storage cleanup happens in loadFlowContextFromStorage for expired contexts
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

        mockSessionStorage.getItem.mockReset();
      });

      it('should handle context that expires during load as invalid', () => {
        // When context expires between hasStoredFlowContext and loadFlowContextFromStorage,
        // loadFlowContextFromStorage clears the expired context and returns null,
        // resulting in wasInvalid: true (since context couldn't be loaded)
        const freshContext = createValidFlowContext();
        const expiredContext = createValidFlowContext({
          timestamp: Date.now() - (31 * 60 * 1000),
        });

        mockSessionStorage.getItem
          .mockReturnValueOnce(JSON.stringify(freshContext)) // First call (hasStoredFlowContext)
          .mockReturnValueOnce(JSON.stringify(expiredContext)); // Second call (loadFlowContextFromStorage)

        const result = authService.resumeFlow();

        // loadFlowContextFromStorage returns null for expired contexts,
        // so wasInvalid is set (context couldn't be loaded successfully)
        expect(result.hasContext).toBe(false);
        expect(result.wasInvalid).toBe(true);

        mockSessionStorage.getItem.mockReset();
      });

      it('should clear expired context automatically via loadFlowContextFromStorage', () => {
        const expiredContext = createValidFlowContext({
          timestamp: Date.now() - (31 * 60 * 1000),
        });
        mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredContext));

        authService.resumeFlow(true);

        // Storage cleanup happens in loadFlowContextFromStorage
        expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

        mockSessionStorage.getItem.mockReset();
      });
    });
  });

  // ===========================================================================
  // hasStoredFlowContext Tests
  // ===========================================================================

  describe('hasStoredFlowContext', () => {
    it('should return true when valid context exists', () => {
      const storedContext = createValidFlowContext();
      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(storedContext));

      expect(authService.hasStoredFlowContext()).toBe(true);
    });

    it('should return false when no context exists', () => {
      mockSessionStorage.getItem.mockReturnValueOnce(null);

      expect(authService.hasStoredFlowContext()).toBe(false);
    });

    it('should return false for expired context', () => {
      const expiredContext = createValidFlowContext({
        timestamp: Date.now() - (31 * 60 * 1000),
      });
      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(expiredContext));

      expect(authService.hasStoredFlowContext()).toBe(false);
    });

    it('should return false for invalid context', () => {
      mockSessionStorage.getItem.mockReturnValueOnce('invalid json');

      expect(authService.hasStoredFlowContext()).toBe(false);
    });
  });

  // ===========================================================================
  // clearFlowContext Tests
  // ===========================================================================

  describe('clearFlowContext', () => {
    it('should remove flow context from storage', () => {
      authService.clearFlowContext();

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);
    });
  });

  // ===========================================================================
  // validateReturnTo Tests
  // ===========================================================================

  describe('validateReturnTo', () => {
    it('should accept valid relative paths', () => {
      expect(authService.validateReturnTo('/listings')).toBe(true);
      expect(authService.validateReturnTo('/bookings/123')).toBe(true);
      expect(authService.validateReturnTo('/dashboard')).toBe(true);
    });

    it('should reject javascript: URLs', () => {
      expect(authService.validateReturnTo('javascript:alert(1)')).toBe(false);
      expect(authService.validateReturnTo('JAVASCRIPT:void(0)')).toBe(false);
    });

    it('should reject data: URLs', () => {
      expect(authService.validateReturnTo('data:text/html,<script>alert(1)</script>')).toBe(false);
    });

    it('should reject external URLs', () => {
      expect(authService.validateReturnTo('https://evil.com/')).toBe(false);
      expect(authService.validateReturnTo('http://malicious.org/path')).toBe(false);
    });

    it('should reject protocol-relative URLs', () => {
      expect(authService.validateReturnTo('//evil.com/path')).toBe(false);
    });

    it('should accept same-origin absolute URLs', () => {
      expect(authService.validateReturnTo('https://digilist.no/listings')).toBe(true);
    });

    it('should use custom allowed origins', () => {
      const customOrigins = ['https://staging.digilist.no'];

      expect(authService.validateReturnTo('https://staging.digilist.no/listings', customOrigins)).toBe(true);
      expect(authService.validateReturnTo('https://digilist.no/listings', customOrigins)).toBe(false);
    });
  });

  // ===========================================================================
  // initiateAuthWithContext Tests
  // ===========================================================================

  describe('initiateAuthWithContext', () => {
    it('should save flow context before initiating OAuth', async () => {
      await authService.initiateAuthWithContext({
        provider: 'vipps',
        returnTo: '/listings/123',
        tenantId: 'tenant-1',
        listingId: 'listing-123',
      });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        FLOW_CONTEXT_KEY,
        expect.any(String)
      );
    });

    it('should include all booking state in saved context', async () => {
      await authService.initiateAuthWithContext({
        provider: 'idporten',
        returnTo: '/listings/456',
        tenantId: 'tenant-1',
        listingId: 'listing-456',
        bookingMode: 'SLOTS',
        selectedSlots: [
          { date: '2024-03-15', startTime: '10:00', endTime: '11:00' },
        ],
        formData: {
          notes: 'Important meeting',
        },
      });

      const savedData = mockSessionStorage.setItem.mock.calls[0][1];
      const savedContext = JSON.parse(savedData);

      expect(savedContext.listingId).toBe('listing-456');
      expect(savedContext.bookingMode).toBe('SLOTS');
      expect(savedContext.selectedSlots).toHaveLength(1);
      expect(savedContext.formData?.notes).toBe('Important meeting');
    });
  });

  // ===========================================================================
  // Integration Tests
  // ===========================================================================

  describe('Integration: requireAuth -> resumeFlow', () => {
    it('should be able to resume flow after requireAuth', () => {
      // Step 1: Call requireAuth (simulates user clicking login)
      const requireResult = authService.requireAuth({
        returnTo: '/listings/booking-page',
        tenantId: 'kommune-oslo',
        listingId: 'listing-789',
        bookingMode: 'DURATION',
        selectedDates: ['2024-04-01'],
        formData: {
          duration: 60,
          notes: 'Conference room booking',
        },
      });

      expect(requireResult.success).toBe(true);

      // Step 2: Simulate login completion - resumeFlow reads from storage
      // Reset mock to return what was saved
      const savedContext = JSON.parse(mockSessionStorage.setItem.mock.calls[0][1]);
      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(savedContext));

      const resumeResult = authService.resumeFlow();

      expect(resumeResult.hasContext).toBe(true);
      expect(resumeResult.flowContext?.listingId).toBe('listing-789');
      expect(resumeResult.flowContext?.bookingMode).toBe('DURATION');
      expect(resumeResult.flowContext?.formData?.duration).toBe(60);
    });

    it('should handle expired context between requireAuth and resumeFlow', () => {
      // Step 1: Call requireAuth
      authService.requireAuth({
        returnTo: '/listings/123',
        tenantId: 'tenant-1',
      });

      // Step 2: Simulate time passing (context expires)
      const savedData = mockSessionStorage.setItem.mock.calls[0][1];
      const savedContext = JSON.parse(savedData);
      const expiredContext = {
        ...savedContext,
        timestamp: Date.now() - (31 * 60 * 1000), // Expired
      };
      // Set mock to return expired context (loadFlowContextFromStorage clears it)
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredContext));

      // Step 3: Try to resume - expired context returns hasContext: false
      const resumeResult = authService.resumeFlow();

      expect(resumeResult.hasContext).toBe(false);
      // Context was cleared during load
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(FLOW_CONTEXT_KEY);

      mockSessionStorage.getItem.mockReset();
    });
  });
});
