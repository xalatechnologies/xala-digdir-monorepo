/**
 * @digilist/client-sdk
 * Enterprise-grade type-safe SDK for the Digilist Backoffice API
 *
 * Supports dual API routing:
 * - Platform API (port 4001): auth, users, tenants, organizations, RBAC, audit, GDPR, notifications
 * - Domain API (port 4000): bookings, rental-objects, calendar, seasons, pricing, etc.
 *
 * @example
 * ```typescript
 * import { initializeClient, listingService, useListings, realtimeClient } from '@digilist/client-sdk';
 *
 * // Initialize client with dual API support
 * initializeClient({
 *   baseUrl: 'https://api.digilist.no',           // Domain API
 *   platformApiUrl: 'https://platform.digilist.no', // Platform API (optional)
 *   tenantId: 'your-tenant-id',
 * });
 *
 * // Use service directly
 * const listings = await listingService.getAll();
 *
 * // Or use React Query hook
 * function MyComponent() {
 *   const { data, isLoading } = useListings();
 *   ...
 * }
 *
 * // Real-time events via WebSocket
 * realtimeClient.connect({ url: 'wss://api.digilist.no/ws/audit' });
 * realtimeClient.onAudit((event) => console.log('Audit:', event));
 * ```
 */

// Core - Client management
export {
  initializeClient,
  getClient,
  getClientConfig,
  updateClientConfig,
  setAuthToken,
  clearAuthToken,
  setTenantId,
  isClientInitialized,
  createClient,
  resetClient,
  isUsingMockData,
  // Dual API support (Platform vs Domain)
  setPlatformApiUrl,
  getPlatformApiUrl,
  isDualApiMode,
  getDomainApiUrl,
} from './core/client-factory';

// API Routing - Platform vs Domain routing
export {
  type ApiType,
  getApiTypeForPath,
  isPlatformPath,
  isDomainPath,
  routeRequest,
  getPlatformPaths,
  getDomainPaths,
} from './core/api-router';

export type {
  IHttpClient,
  ApiClientConfig,
  RequestOptions,
  HttpResponse,
  HttpMethod,
  ProblemDetails,
} from './core/http-client.interface';

export { ApiError } from './core/http-client.interface';
export { FetchHttpClient } from './core/fetch-client';

// Types - All type definitions
export * from './types';

// Constants - Listing type labels and options
export { LISTING_TYPE_LABELS, LISTING_TYPE_OPTIONS, CAPACITY_OPTIONS } from './types/rental-object';

// Constants - Notification preferences
export {
  NOTIFICATION_TYPES_REGISTRY,
  DEFAULT_NOTIFICATION_PREFERENCES,
  getDefaultChannelSettings,
  isChannelEnabled,
  updateChannelSetting,
} from './types/notification-preferences';

// Services (specific classes exported for type checking)
export { RentalObjectService } from './services/rental-object.service';
export { BookingService } from './services/booking.service';
export { OrganizationService } from './services/organization.service';
export { UserService } from './services/user.service';
export { StorageService } from './services/storage.service';

// Services - Domain services (24 services)
export * from './services';

// Re-export specific service instances that apps import directly
export { organizationService } from './services/organization.service';
export { idportenService } from './services/idporten.service';
export { vippsAuthService } from './services/vipps.service';

// Hooks - React Query hooks (requires React and @tanstack/react-query)
export * from './hooks';

// Realtime - WebSocket client for real-time events
export {
  realtimeClient,
  createAuditWebSocketUrl,
  createTenantWebSocketUrl,
} from './realtime';
export type {
  RealtimeEventType,
  RealtimeEvent,
  RealtimeEventHandler,
  RealtimeClientConfig,
} from './realtime';

// Utils - Common utility functions
export {
  // Date/time formatting
  formatDate,
  formatTime,
  formatWeekRange,
  formatDateTime,
  formatRelativeTime,
  // Number formatting
  formatCurrency,
  formatPercent,
  // Period/seasonal formatting
  formatWeekdays,
  formatPeriod,
  formatTimeSlot,
  // Geocoding (Google Places API primary, Mapbox fallback)
  geocodeAddress,
  geocodeAddresses,
  clearGeocodeCache,
  getCachedGeocode,
  buildAddressString,
  // Upload progress calculation
  calculatePercentage,
  calculateSpeed,
  calculateETA,
  createProgressEvent,
  // Upload progress formatting
  formatBytes,
  formatSpeed,
  formatETA,
  formatProgress,
  // Upload progress tracking
  UploadProgressTracker,
  // Flow context utilities (session-safe return-to-flow)
  FLOW_CONTEXT_KEY,
  MAX_FLOW_CONTEXT_SIZE,
  FLOW_CONTEXT_EXPIRY_MS,
  serializeFlowContext,
  deserializeFlowContext,
  isValidFlowContext,
  isFlowContextExpired,
  getFlowContextTTL,
  validateReturnToUrl,
  sanitizeReturnToUrl,
  saveFlowContextToStorage,
  loadFlowContextFromStorage,
  clearFlowContextFromStorage,
  hasStoredFlowContext,
  createFlowContext,
} from './utils';

export type {
  GeocodedLocation,
  GeocodeConfig,
} from './utils';

// DAL - Data Access Layer (cache management, query keys)
export * from './dal';

// Providers - React context providers
export { RealtimeProvider, useRealtimeStatus } from './providers';
export type { RealtimeProviderProps, RealtimeContextValue } from './providers';

// Localization - Translation key constants for i18n
export * from './localization';
