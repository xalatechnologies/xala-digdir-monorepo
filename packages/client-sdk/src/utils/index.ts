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
  // Geocoding
  geocodeAddress,
  geocodeAddresses,
  clearGeocodeCache,
  getCachedGeocode,
  type GeocodedLocation,
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
