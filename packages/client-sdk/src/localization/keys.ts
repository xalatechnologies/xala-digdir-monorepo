/**
 * SDK Localization Keys
 * 
 * This file defines all translation key constants used by the SDK.
 * Translation strings are resolved by the consuming app's i18n system.
 * 
 * Pattern: sdk.<domain>.<entity>.<value>
 * 
 * Example usage:
 * ```tsx
 * import { SDK_KEYS } from '@digilist/client-sdk/localization';
 * const { t } = useTranslation();
 * const label = t(SDK_KEYS.booking.status.pending);
 * ```
 */

// =============================================================================
// Rental Object Categories
// =============================================================================

export const RENTAL_OBJECT_CATEGORY_KEYS = {
  LOKALER_OG_BANER: 'sdk.rentalObject.category.LOKALER_OG_BANER',
  UTSTYR_OG_INVENTAR: 'sdk.rentalObject.category.UTSTYR_OG_INVENTAR',
  KJORETOY_OG_TRANSPORT: 'sdk.rentalObject.category.KJORETOY_OG_TRANSPORT',
  OPPLEVELSER_OG_ARRANGEMENT: 'sdk.rentalObject.category.OPPLEVELSER_OG_ARRANGEMENT',
} as const;

// =============================================================================
// Booking Time Modes
// =============================================================================

export const TIME_MODE_KEYS = {
  PERIOD: 'sdk.timeMode.PERIOD',
  SLOT: 'sdk.timeMode.SLOT',
  ALL_DAY: 'sdk.timeMode.ALL_DAY',
} as const;

// =============================================================================
// Pricing Units
// =============================================================================

export const PRICING_UNIT_KEYS = {
  hour: 'sdk.pricingUnit.hour',
  day: 'sdk.pricingUnit.day',
  booking: 'sdk.pricingUnit.booking',
  week: 'sdk.pricingUnit.week',
  month: 'sdk.pricingUnit.month',
} as const;

// =============================================================================
// Booking Status
// =============================================================================

export const BOOKING_STATUS_KEYS = {
  pending: 'sdk.booking.status.pending',
  pending_approval: 'sdk.booking.status.pendingApproval',
  approved: 'sdk.booking.status.approved',
  confirmed: 'sdk.booking.status.confirmed',
  rejected: 'sdk.booking.status.rejected',
  cancelled: 'sdk.booking.status.cancelled',
  completed: 'sdk.booking.status.completed',
  expired: 'sdk.booking.status.expired',
} as const;

// =============================================================================
// Payment Status
// =============================================================================

export const PAYMENT_STATUS_KEYS = {
  unpaid: 'sdk.payment.status.unpaid',
  paid: 'sdk.payment.status.paid',
  partial: 'sdk.payment.status.partial',
  refunded: 'sdk.payment.status.refunded',
} as const;

// =============================================================================
// Allocation Type
// =============================================================================

export const ALLOCATION_TYPE_KEYS = {
  BOOKING: 'sdk.allocation.type.BOOKING',
  BLOCK: 'sdk.allocation.type.BLOCK',
  MAINTENANCE: 'sdk.allocation.type.MAINTENANCE',
  SEASONAL: 'sdk.allocation.type.SEASONAL',
} as const;

// =============================================================================
// Actor Types
// =============================================================================

export const ACTOR_TYPE_KEYS = {
  private: 'sdk.actorType.private',
  business: 'sdk.actorType.business',
  sports_club: 'sdk.actorType.sports_club',
  youth_organization: 'sdk.actorType.youth_organization',
  school: 'sdk.actorType.school',
  municipality: 'sdk.actorType.municipality',
} as const;

// =============================================================================
// Organization Status
// =============================================================================

export const ORGANIZATION_STATUS_KEYS = {
  active: 'sdk.organization.status.active',
  inactive: 'sdk.organization.status.inactive',
  suspended: 'sdk.organization.status.suspended',
} as const;

// =============================================================================
// User Roles
// =============================================================================

export const USER_ROLE_KEYS = {
  super_admin: 'sdk.user.role.super_admin',
  admin: 'sdk.user.role.admin',
  saksbehandler: 'sdk.user.role.saksbehandler',
  user: 'sdk.user.role.user',
} as const;

// =============================================================================
// User Status
// =============================================================================

export const USER_STATUS_KEYS = {
  active: 'sdk.user.status.active',
  inactive: 'sdk.user.status.inactive',
  suspended: 'sdk.user.status.suspended',
} as const;

// =============================================================================
// Member Roles
// =============================================================================

export const MEMBER_ROLE_KEYS = {
  admin: 'sdk.member.role.admin',
  member: 'sdk.member.role.member',
} as const;

// =============================================================================
// Rental Object Status
// =============================================================================

export const RENTAL_OBJECT_STATUS_KEYS = {
  draft: 'sdk.rentalObject.status.draft',
  published: 'sdk.rentalObject.status.published',
  archived: 'sdk.rentalObject.status.archived',
  maintenance: 'sdk.rentalObject.status.maintenance',
} as const;

// =============================================================================
// Review Status
// =============================================================================

export const REVIEW_STATUS_KEYS = {
  pending: 'sdk.review.status.pending',
  approved: 'sdk.review.status.approved',
  rejected: 'sdk.review.status.rejected',
} as const;

// =============================================================================
// Season Status
// =============================================================================

export const SEASON_STATUS_KEYS = {
  draft: 'sdk.season.status.draft',
  open: 'sdk.season.status.open',
  closed: 'sdk.season.status.closed',
  active: 'sdk.season.status.active',
  completed: 'sdk.season.status.completed',
} as const;

// =============================================================================
// Season Application Status
// =============================================================================

export const SEASON_APPLICATION_STATUS_KEYS = {
  pending: 'sdk.seasonApplication.status.pending',
  approved: 'sdk.seasonApplication.status.approved',
  rejected: 'sdk.seasonApplication.status.rejected',
  waitlist: 'sdk.seasonApplication.status.waitlist',
} as const;

// =============================================================================
// Weekdays
// =============================================================================

export const WEEKDAY_KEYS = {
  monday: 'sdk.weekday.monday',
  tuesday: 'sdk.weekday.tuesday',
  wednesday: 'sdk.weekday.wednesday',
  thursday: 'sdk.weekday.thursday',
  friday: 'sdk.weekday.friday',
  saturday: 'sdk.weekday.saturday',
  sunday: 'sdk.weekday.sunday',
} as const;

export const WEEKDAY_SHORT_KEYS = {
  monday: 'sdk.weekday.short.monday',
  tuesday: 'sdk.weekday.short.tuesday',
  wednesday: 'sdk.weekday.short.wednesday',
  thursday: 'sdk.weekday.short.thursday',
  friday: 'sdk.weekday.short.friday',
  saturday: 'sdk.weekday.short.saturday',
  sunday: 'sdk.weekday.short.sunday',
} as const;

// =============================================================================
// Duration Format
// =============================================================================

export const DURATION_KEYS = {
  minute: 'sdk.duration.minute',
  minutes: 'sdk.duration.minutes',
  hour: 'sdk.duration.hour',
  hours: 'sdk.duration.hours',
  day: 'sdk.duration.day',
  days: 'sdk.duration.days',
} as const;

// =============================================================================
// Verification Labels
// =============================================================================

export const VERIFICATION_KEYS = {
  verified: 'sdk.verification.verified',
  notVerified: 'sdk.verification.notVerified',
} as const;

// =============================================================================
// Common Placeholders
// =============================================================================

export const PLACEHOLDER_KEYS = {
  noAddress: 'sdk.placeholder.noAddress',
  noReviews: 'sdk.placeholder.noReviews',
  noImage: 'sdk.placeholder.noImage',
  unknown: 'sdk.placeholder.unknown',
  priceNotSet: 'sdk.placeholder.priceNotSet',
} as const;

// =============================================================================
// Error Messages
// =============================================================================

export const ERROR_KEYS = {
  notFound: 'sdk.error.notFound',
  invalidAddress: 'sdk.error.invalidAddress',
  providerError: 'sdk.error.providerError',
  timeout: 'sdk.error.timeout',
  unauthorized: 'sdk.error.unauthorized',
  forbidden: 'sdk.error.forbidden',
  validation: 'sdk.error.validation',
  serverError: 'sdk.error.serverError',
} as const;

// =============================================================================
// Rating Labels
// =============================================================================

export const RATING_LABEL_KEYS = {
  1: 'sdk.rating.1',
  2: 'sdk.rating.2',
  3: 'sdk.rating.3',
  4: 'sdk.rating.4',
  5: 'sdk.rating.5',
} as const;

// =============================================================================
// Priority Labels
// =============================================================================

export const PRIORITY_KEYS = {
  prefix: 'sdk.priority.prefix',
} as const;

// =============================================================================
// Aggregated SDK Keys Export
// =============================================================================

export const SDK_KEYS = {
  rentalObject: {
    category: RENTAL_OBJECT_CATEGORY_KEYS,
    status: RENTAL_OBJECT_STATUS_KEYS,
  },
  timeMode: TIME_MODE_KEYS,
  pricingUnit: PRICING_UNIT_KEYS,
  booking: {
    status: BOOKING_STATUS_KEYS,
  },
  payment: {
    status: PAYMENT_STATUS_KEYS,
  },
  allocation: {
    type: ALLOCATION_TYPE_KEYS,
  },
  actorType: ACTOR_TYPE_KEYS,
  organization: {
    status: ORGANIZATION_STATUS_KEYS,
  },
  user: {
    role: USER_ROLE_KEYS,
    status: USER_STATUS_KEYS,
  },
  member: {
    role: MEMBER_ROLE_KEYS,
  },
  review: {
    status: REVIEW_STATUS_KEYS,
  },
  rating: RATING_LABEL_KEYS,
  season: {
    status: SEASON_STATUS_KEYS,
  },
  seasonApplication: {
    status: SEASON_APPLICATION_STATUS_KEYS,
  },
  weekday: WEEKDAY_KEYS,
  weekdayShort: WEEKDAY_SHORT_KEYS,
  duration: DURATION_KEYS,
  verification: VERIFICATION_KEYS,
  placeholder: PLACEHOLDER_KEYS,
  priority: PRIORITY_KEYS,
  error: ERROR_KEYS,
} as const;

// =============================================================================
// Type-safe key getter functions
// =============================================================================

import type {
  BookingStatus,
  PaymentStatus,
  OrganizationStatus,
  UserRole,
  UserStatus,
  ActorType,
  BookingTimeMode,
  PricingUnit,
} from '@/types/enums';
import type { RentalObjectCategory, RentalObjectStatus } from '@/types/rental-object';

export function getBookingStatusKey(status: BookingStatus): string {
  return BOOKING_STATUS_KEYS[status] ?? status;
}

export function getPaymentStatusKey(status: PaymentStatus): string {
  return PAYMENT_STATUS_KEYS[status] ?? status;
}

export function getOrganizationStatusKey(status: OrganizationStatus): string {
  return ORGANIZATION_STATUS_KEYS[status] ?? status;
}

export function getUserRoleKey(role: UserRole): string {
  return USER_ROLE_KEYS[role] ?? role;
}

export function getUserStatusKey(status: UserStatus): string {
  return USER_STATUS_KEYS[status] ?? status;
}

export function getActorTypeKey(type: ActorType): string {
  return ACTOR_TYPE_KEYS[type] ?? type;
}

export function getRentalObjectCategoryKey(category: RentalObjectCategory): string {
  return RENTAL_OBJECT_CATEGORY_KEYS[category] ?? category;
}

export function getRentalObjectStatusKey(status: RentalObjectStatus): string {
  return RENTAL_OBJECT_STATUS_KEYS[status] ?? status;
}

export function getTimeModeKey(mode: BookingTimeMode): string {
  return TIME_MODE_KEYS[mode] ?? mode;
}

export function getPricingUnitKey(unit: PricingUnit): string {
  return PRICING_UNIT_KEYS[unit] ?? unit;
}

export function getAllocationTypeKey(type: string): string {
  return ALLOCATION_TYPE_KEYS[type as keyof typeof ALLOCATION_TYPE_KEYS] ?? type;
}

export function getMemberRoleKey(role: 'admin' | 'member'): string {
  return MEMBER_ROLE_KEYS[role] ?? role;
}

export function getWeekdayKey(day: string): string {
  const key = day.toLowerCase() as keyof typeof WEEKDAY_KEYS;
  return WEEKDAY_KEYS[key] ?? day;
}

export function getWeekdayShortKey(day: string): string {
  const key = day.toLowerCase() as keyof typeof WEEKDAY_SHORT_KEYS;
  return WEEKDAY_SHORT_KEYS[key] ?? day;
}
