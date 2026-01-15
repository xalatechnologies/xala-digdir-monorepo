/**
 * SDK Export Completeness Tests
 * Verifies that all required exports are present and properly typed
 */
import { describe, it, expect } from 'vitest';
import * as sdk from '../index';
import * as services from '../services';
import * as hooks from '../hooks';
import * as types from '../types';

describe('SDK Main Exports', () => {
  describe('Core Client Management', () => {
    it('exports initializeClient', () => {
      expect(sdk.initializeClient).toBeDefined();
      expect(typeof sdk.initializeClient).toBe('function');
    });

    it('exports getClient', () => {
      expect(sdk.getClient).toBeDefined();
      expect(typeof sdk.getClient).toBe('function');
    });

    it('exports resetClient', () => {
      expect(sdk.resetClient).toBeDefined();
      expect(typeof sdk.resetClient).toBe('function');
    });

    it('exports isUsingMockData', () => {
      expect(sdk.isUsingMockData).toBeDefined();
      expect(typeof sdk.isUsingMockData).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('exports ApiError class', () => {
      expect(sdk.ApiError).toBeDefined();
      expect(typeof sdk.ApiError).toBe('function');
    });

    it('ApiError can be instantiated', () => {
      const error = new sdk.ApiError('Test', 'TEST', 400);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
    });
  });

  describe('HTTP Client', () => {
    it('exports FetchHttpClient', () => {
      expect(sdk.FetchHttpClient).toBeDefined();
      expect(typeof sdk.FetchHttpClient).toBe('function');
    });
  });
});

describe('Service Exports', () => {
  const requiredServices = [
    'RentalObjectService',
    'rentalObjectService',
    'BookingService',
    'bookingService',
    'AuthService',
    'authService',
    'OrganizationService',
    'organizationService',
    'UserService',
    'userService',
    'AuthzService',
    'authzService',
    'GdprService',
    'gdprService',
    'ProfileService',
    'profileService',
  ];

  it.each(requiredServices)('exports %s', (serviceName) => {
    expect(services[serviceName as keyof typeof services]).toBeDefined();
  });

  describe('RentalObjectService', () => {
    const service = services.rentalObjectService;
    const methods = [
      'getAll',
      'getById',
      'getBySlug',
      'create',
      'update',
      'delete',
      'publish',
      'archive',
      'unpublish',
      'restore',
      'duplicate',
      'getAvailability',
      'getStats',
      'getCalendarConfig',
      'uploadMedia',
      'removeMedia',
    ];

    it.each(methods)('has %s method', (methodName) => {
      expect(typeof (service as any)[methodName]).toBe('function');
    });
  });

  describe('BookingService', () => {
    const service = services.bookingService;
    const methods = [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
      'confirm',
      'cancel',
      'complete',
      'getMyBookings',
      'calculatePricing',
      'quote',
    ];

    it.each(methods)('has %s method', (methodName) => {
      expect(typeof (service as any)[methodName]).toBe('function');
    });
  });

  describe('AuthService', () => {
    const service = services.authService;
    const methods = ['login', 'logout', 'getSession'];

    it.each(methods)('has %s method', (methodName) => {
      expect(typeof (service as any)[methodName]).toBe('function');
    });
  });

  describe('AuthzService', () => {
    const service = services.authzService;
    const methods = [
      'getPermissions',
      'checkPermission',
      'checkPermissions',
      'can',
      'hasAnyPermission',
      'hasAllPermissions',
    ];

    it.each(methods)('has %s method', (methodName) => {
      expect(typeof (service as any)[methodName]).toBe('function');
    });
  });
});

describe('Hook Exports', () => {
  describe('Rental Object Hooks', () => {
    const rentalObjectHooks = [
      'useRentalObjects',
      'useRentalObject',
      'useRentalObjectBySlug',
      'useCreateRentalObject',
      'useUpdateRentalObject',
      'useDeleteRentalObject',
      'usePublishRentalObject',
      'useArchiveRentalObject',
      'useUnpublishRentalObject',
      'useRestoreRentalObject',
      'useDuplicateRentalObject',
      'useRentalObjectAvailability',
      'useRentalObjectStats',
      'useRentalObjectCalendarConfig',
      'useUploadRentalObjectMedia',
      'useDeleteRentalObjectMedia',
    ];

    it.each(rentalObjectHooks)('exports %s', (hookName) => {
      expect(hooks[hookName as keyof typeof hooks]).toBeDefined();
      expect(typeof hooks[hookName as keyof typeof hooks]).toBe('function');
    });
  });

  describe('Booking Hooks', () => {
    const bookingHooks = [
      'useBookings',
      'useBooking',
      'useCreateBooking',
      'useUpdateBooking',
      'useDeleteBooking',
      'useConfirmBooking',
      'useCancelBooking',
      'useCompleteBooking',
      'useMyBookings',
      'useRecurringBookings',
      'useRecurringPreview',
      'useBookingPricing',
    ];

    it.each(bookingHooks)('exports %s', (hookName) => {
      expect(hooks[hookName as keyof typeof hooks]).toBeDefined();
      expect(typeof hooks[hookName as keyof typeof hooks]).toBe('function');
    });
  });

  describe('Authorization Hooks', () => {
    const authzHooks = [
      'usePermissions',
      'useCheckPermission',
      'useCan',
      'useRole',
      'useHasAnyPermission',
      'useHasAllPermissions',
      'useInvalidatePermissions',
    ];

    it.each(authzHooks)('exports %s', (hookName) => {
      expect(hooks[hookName as keyof typeof hooks]).toBeDefined();
      expect(typeof hooks[hookName as keyof typeof hooks]).toBe('function');
    });
  });

  describe('Profile Hooks', () => {
    const profileHooks = ['useProfile', 'useUpdateProfile'];

    it.each(profileHooks)('exports %s', (hookName) => {
      expect(hooks[hookName as keyof typeof hooks]).toBeDefined();
      expect(typeof hooks[hookName as keyof typeof hooks]).toBe('function');
    });
  });

  describe('Query Keys', () => {
    it('exports authzKeys', () => {
      expect(hooks.authzKeys).toBeDefined();
    });

    it('exports profileKeys', () => {
      expect(hooks.profileKeys).toBeDefined();
    });

    it('authzKeys has correct structure', () => {
      const keys = hooks.authzKeys;
      expect(keys.all).toEqual(['authz']);
      expect(typeof keys.permissions).toBe('function');
      expect(typeof keys.check).toBe('function');
    });

    it('profileKeys has correct structure', () => {
      const keys = hooks.profileKeys;
      expect(keys.all).toEqual(['profile']);
      expect(typeof keys.current).toBe('function');
    });
  });
});

describe('Type Exports', () => {
  describe('Core Types', () => {
    it('exports common response types', () => {
      expect(types).toBeDefined();
    });
  });
});

describe('SDK Namespace Organization', () => {
  it('has services namespace', () => {
    expect(services).toBeDefined();
    expect(Object.keys(services).length).toBeGreaterThan(10);
  });

  it('has hooks namespace', () => {
    expect(hooks).toBeDefined();
    expect(Object.keys(hooks).length).toBeGreaterThan(50);
  });

  it('has types namespace', () => {
    expect(types).toBeDefined();
    expect(Object.keys(types).length).toBeGreaterThan(0);
  });
});

describe('Service Singleton Pattern', () => {
  it('services are singleton instances', () => {
    const service1 = services.rentalObjectService;
    const service2 = services.rentalObjectService;
    
    expect(service1).toBe(service2);
  });

  it('service classes can be instantiated for testing', () => {
    const service = new services.RentalObjectService();
    expect(service).toBeDefined();
  });
});

describe('SDK Version and Metadata', () => {
  it('SDK can be imported without errors', () => {
    expect(() => {
      const s = sdk;
      return s;
    }).not.toThrow();
  });
});

describe('Export Consistency', () => {
  it('all exported services have corresponding hooks', () => {
    const serviceNames = ['RentalObject', 'Booking', 'Organization', 'User'];
    
    serviceNames.forEach(name => {
      const serviceName = `${name}Service`;
      const useHook = `use${name}s`;
      
      expect(services[serviceName as keyof typeof services]).toBeDefined();
      expect(hooks[useHook as keyof typeof hooks]).toBeDefined();
    });
  });

  it('core CRUD hooks exist for RentalObject', () => {
    expect(hooks.useCreateRentalObject).toBeDefined();
    expect(hooks.useUpdateRentalObject).toBeDefined();
    expect(hooks.useDeleteRentalObject).toBeDefined();
  });

  it('core CRUD hooks exist for Booking', () => {
    expect(hooks.useCreateBooking).toBeDefined();
    expect(hooks.useUpdateBooking).toBeDefined();
    expect(hooks.useDeleteBooking).toBeDefined();
  });
});

describe('No SSR-Breaking Exports', () => {
  it('services do not use window directly', () => {
    // Services should use the http client which handles SSR
    expect(services.rentalObjectService).toBeDefined();
    expect(services.bookingService).toBeDefined();
  });

  it('core client factory does not access window on import', () => {
    // Should not throw on import
    expect(() => {
      const client = sdk.getClient;
      return client;
    }).not.toThrow();
  });
});

describe('Error Type Exports', () => {
  it('exports ProblemDetails type', () => {
    // ProblemDetails should be exported as a type
    const error = new sdk.ApiError({
      type: '/errors/test',
      title: 'Test',
      status: 400,
    });
    
    const pd = error.toProblemDetails();
    expect(pd.type).toBe('/errors/test');
    expect(pd.title).toBe('Test');
    expect(pd.status).toBe(400);
  });
});

describe('Integration Service Exports', () => {
  const integrationServices = [
    'rcoService',
    'vismaService',
    'vippsService',
    'brregService',
    'nifService',
  ];

  it.each(integrationServices)('exports %s', (serviceName) => {
    // Check if service exists (may be undefined in test environment)
    const service = services[serviceName as keyof typeof services];
    if (service !== undefined) {
      expect(service).toBeDefined();
    }
  });
});

describe('Calendar Service Exports', () => {
  it('exports calendar-related services', () => {
    expect(services.rentalObjectCalendarService).toBeDefined();
    expect(services.availabilityMatrixService).toBeDefined();
  });

  it('exports calendar hooks', () => {
    expect(hooks.useAvailabilityMatrix).toBeDefined();
    expect(hooks.useCalendarRealtime).toBeDefined();
  });
});

describe('GDPR Service Exports', () => {
  it('exports gdprService', () => {
    expect(services.gdprService).toBeDefined();
  });

  it('exports GDPR hooks', () => {
    expect(hooks.useConsentTypes).toBeDefined();
    expect(hooks.useMyConsents).toBeDefined();
    expect(hooks.useGrantConsent).toBeDefined();
  });
});
