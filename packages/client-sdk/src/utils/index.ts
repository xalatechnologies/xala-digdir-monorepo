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
