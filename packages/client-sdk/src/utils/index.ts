/**
 * Utils Index
 * Exports all utility functions
 */

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
} from './date-utils';

export {
  // Geocoding (Mapbox Forward Geocoding)
  geocodeListingAddress,
  geocodeAddresses,
  clearGeocodeCache,
  getCachedGeocode,
  buildAddressString,
  isGeocodeSuccess,
  isGeocodeError,
  // Legacy (deprecated)
  geocodeAddress,
  // Types
  type ListingAddress,
  type GeocodeResult,
  type GeocodeError,
  type GeocodeErrorCode,
  type GeocodeConfig,
  type BatchGeocodeResult,
  type GeocodedLocation, // deprecated alias
} from './geocode';

export {
  // Image compression
  compressImage,
  compressImages,
  isImageFile,
  needsCompression,
  formatFileSize,
  validateImageType,
  validateImageSize,
  validateImageFile,
} from './image-compression';

export {
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
} from './upload-progress';

export {
  // Flow context constants
  FLOW_CONTEXT_KEY,
  MAX_FLOW_CONTEXT_SIZE,
  FLOW_CONTEXT_EXPIRY_MS,
  // Flow context serialization/deserialization
  serializeFlowContext,
  deserializeFlowContext,
  isValidFlowContext,
  // Flow context expiration
  isFlowContextExpired,
  getFlowContextTTL,
  // URL validation
  validateReturnToUrl,
  sanitizeReturnToUrl,
  // Flow context signature/verification
  signFlowContext,
  verifyFlowContext,
  // Flow context storage helpers
  saveFlowContextToStorage,
  loadFlowContextFromStorage,
  clearFlowContextFromStorage,
  hasStoredFlowContext,
  // ReturnToConfig helpers
  createReturnToConfig,
  validateReturnToConfig,
  // Flow context factory
  createFlowContext,
} from './flow-context';

export {
  // Session persistence (auth flow state)
  saveSessionState,
  restoreSessionState,
  clearSessionState,
  hasPendingSession,
  // Types
  type SessionState,
} from './session-storage';

export {
  // ListingType to Category migration utilities
  // @deprecated These utilities are for migration purposes only
  LISTING_TYPE_TO_CATEGORY,
  CATEGORY_TO_LISTING_TYPE,
  CATEGORY_DEFAULT_TIME_MODE,
  migrateListingTypeToCategory,
  migrateCategoryToListingType,
  isLegacyListingType,
  isRentalObjectCategory,
  normalizeToCategory,
  getDefaultTimeMode,
  // Display labels
  CATEGORY_LABELS_NB,
  CATEGORY_LABELS_EN,
  getCategoryLabel,
  CATEGORY_ICONS,
} from './listing-type-migration';
