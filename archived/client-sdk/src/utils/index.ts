/**
 * Utility exports
 */

export {
  // Date/Time formatting
  formatTime,
  formatDate,
  formatDateTime,
  formatFullDate,
  formatDateRange,
  formatPeriod,
  formatWeekRange,
  formatTimeSlot,
  // Number formatting
  formatCurrency,
  formatCurrencyWithDecimals,
  formatPercent,
  formatPercentage,
  formatNumber,
  formatDecimal,
  // Domain-specific
  weekdayNames,
  weekdayFullNames,
  formatWeekdays,
  formatDuration,
  formatTimeAgo,
} from './format';

// RBAC utilities
export {
  BACKOFFICE_ROLE_PERMISSIONS,
  WEB_ROLE_PERMISSIONS,
  createRBAC,
  createBackofficeRBAC,
  createWebRBAC,
} from './rbac';
export type {
  PermissionKey,
  BackofficeRole,
  WebRole,
  RBACConfig,
  RBACResult,
} from './rbac';
