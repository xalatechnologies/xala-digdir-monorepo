/**
 * Action Code Enum - Centralized Action Definitions
 * 
 * Risk Mitigation: Prevents Action Enum Drift between API and UI
 * All action strings MUST be defined here and used throughout.
 */

// ==============================================================================
// LAYER 1: Action Codes (Centralized Source of Truth)
// ==============================================================================

/**
 * Listing Actions
 */
export enum ListingActionCode {
  VIEW = 'view',
  BOOK = 'book',
  FAVORITE = 'favorite',
  SHARE = 'share',
  REVIEW = 'review',
  EDIT = 'edit',
  DELETE = 'delete',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
  ARCHIVE = 'archive',
  RESTORE = 'restore',
  DUPLICATE = 'duplicate',
}

/**
 * Booking Actions
 */
export enum BookingActionCode {
  VIEW = 'view',
  CANCEL = 'cancel',
  MODIFY = 'modify',
  RESCHEDULE = 'reschedule',
  PAY = 'pay',
  CONFIRM = 'confirm',
  COMPLETE = 'complete',
  DOWNLOAD_RECEIPT = 'download_receipt',
  DOWNLOAD_INVOICE = 'download_invoice',
  REQUEST_REFUND = 'request_refund',
  // Saksbehandler/Admin actions
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
  ESCALATE = 'escalate',
}

/**
 * Organization Actions
 */
export enum OrganizationActionCode {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  INVITE_MEMBER = 'invite_member',
  REMOVE_MEMBER = 'remove_member',
  CHANGE_ROLE = 'change_role',
  VIEW_BILLING = 'view_billing',
  MANAGE_BILLING = 'manage_billing',
  APPLY_SEASON = 'apply_season',
}

/**
 * User Actions
 */
export enum UserActionCode {
  VIEW = 'view',
  EDIT = 'edit',
  DEACTIVATE = 'deactivate',
  REACTIVATE = 'reactivate',
  DELETE = 'delete',
  RESET_PASSWORD = 'reset_password',
  CHANGE_ROLE = 'change_role',
  IMPERSONATE = 'impersonate',
}

/**
 * Season Application Actions
 */
export enum SeasonApplicationActionCode {
  VIEW = 'view',
  EDIT = 'edit',
  SUBMIT = 'submit',
  WITHDRAW = 'withdraw',
  APPROVE = 'approve',
  REJECT = 'reject',
  ALLOCATE = 'allocate',
  FINALIZE = 'finalize',
}

/**
 * Review Actions
 */
export enum ReviewActionCode {
  VIEW = 'view',
  CREATE = 'create',
  EDIT = 'edit',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG = 'flag',
}

/**
 * Config/Admin Actions
 */
export enum ConfigActionCode {
  VIEW = 'view',
  EDIT = 'edit',
  CREATE = 'create',
  DELETE = 'delete',
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
}

/**
 * Message/Conversation Actions
 */
export enum ConversationActionCode {
  VIEW = 'view',
  REPLY = 'reply',
  CLOSE = 'close',
  REOPEN = 'reopen',
  ASSIGN = 'assign',
  ESCALATE = 'escalate',
}

// ==============================================================================
// LAYER 2: Action DTO Types
// ==============================================================================

/**
 * Action Decision from API
 */
export interface ActionDTO {
  action: string;
  enabled: boolean;
  reasonKey: string | null;
  constraints?: Record<string, unknown>;
}

/**
 * Policy Decision from API (for audit/transparency)
 */
export interface PolicyDecisionDTO {
  policyId: string;
  decision: 'allow' | 'deny';
  reasonKey: string;
  params?: Record<string, unknown>;
}

/**
 * Standard reason keys returned by API
 */
export enum PolicyReasonKey {
  // Permission reasons
  ROLE_INSUFFICIENT = 'role.insufficient_permissions',
  ROLE_NOT_OWNER = 'role.not_owner',
  ROLE_NOT_MEMBER = 'role.not_member',
  
  // Booking policy reasons
  BOOKING_WINDOW_CLOSED = 'policy.booking_window_closed',
  MODIFICATION_WINDOW_EXPIRED = 'policy.modification_window_expired',
  CANCELLATION_DEADLINE_PASSED = 'policy.cancellation_deadline_passed',
  SLOT_ALREADY_BOOKED = 'slot.already_booked',
  SLOT_BLOCKED = 'slot.blocked',
  SLOT_OUTSIDE_HOURS = 'slot.outside_operating_hours',
  
  // Listing reasons
  LISTING_NOT_PUBLISHED = 'listing.not_published',
  LISTING_ARCHIVED = 'listing.archived',
  LISTING_HAS_ACTIVE_BOOKINGS = 'listing.has_active_bookings',
  
  // User reasons
  USER_NOT_VERIFIED = 'user.not_verified',
  USER_DEACTIVATED = 'user.deactivated',
  USER_BLACKLISTED = 'user.blacklisted',
  
  // Organization reasons
  ORG_NOT_VERIFIED = 'org.not_verified',
  ORG_HAS_PENDING_INVOICES = 'org.has_pending_invoices',
  ORG_LIMIT_REACHED = 'org.member_limit_reached',
  
  // Season reasons
  SEASON_NOT_OPEN = 'season.not_open',
  SEASON_CLOSED = 'season.closed',
  SEASON_FULLY_ALLOCATED = 'season.fully_allocated',
  APPLICATION_ALREADY_SUBMITTED = 'application.already_submitted',
  
  // Generic
  FEATURE_DISABLED = 'feature.disabled',
  MAINTENANCE_MODE = 'system.maintenance_mode',
}

// ==============================================================================
// LAYER 3: Action Helpers (Pure Functions)
// ==============================================================================

/**
 * Check if an action is enabled in the actions array
 */
export function isActionEnabled(
  actions: ActionDTO[],
  actionCode: string
): boolean {
  const action = actions.find(a => a.action === actionCode);
  return action?.enabled ?? false;
}

/**
 * Get the reason key for a disabled action
 */
export function getActionReasonKey(
  actions: ActionDTO[],
  actionCode: string
): string | null {
  const action = actions.find(a => a.action === actionCode);
  return action?.reasonKey ?? null;
}

/**
 * Get action constraints (e.g., deadline for cancellation)
 */
export function getActionConstraints(
  actions: ActionDTO[],
  actionCode: string
): Record<string, unknown> | undefined {
  const action = actions.find(a => a.action === actionCode);
  return action?.constraints;
}

/**
 * Filter to only enabled actions
 */
export function getEnabledActions(actions: ActionDTO[]): ActionDTO[] {
  return actions.filter(a => a.enabled);
}

/**
 * Filter to only disabled actions (with reasons)
 */
export function getDisabledActions(actions: ActionDTO[]): ActionDTO[] {
  return actions.filter(a => !a.enabled && a.reasonKey);
}

/**
 * Check if a specific policy decision exists
 */
export function hasPolicyDecision(
  decisions: PolicyDecisionDTO[],
  policyId: string,
  decision: 'allow' | 'deny'
): boolean {
  return decisions.some(d => d.policyId === policyId && d.decision === decision);
}

/**
 * Get all deny reasons from policy decisions
 */
export function getDenyReasons(decisions: PolicyDecisionDTO[]): string[] {
  return decisions
    .filter(d => d.decision === 'deny')
    .map(d => d.reasonKey);
}

// ==============================================================================
// LAYER 4: Type Guards
// ==============================================================================

/**
 * Check if a string is a valid ListingActionCode
 */
export function isListingAction(action: string): action is ListingActionCode {
  return Object.values(ListingActionCode).includes(action as ListingActionCode);
}

/**
 * Check if a string is a valid BookingActionCode
 */
export function isBookingAction(action: string): action is BookingActionCode {
  return Object.values(BookingActionCode).includes(action as BookingActionCode);
}

/**
 * Check if a string is a valid PolicyReasonKey
 */
export function isKnownReasonKey(key: string): key is PolicyReasonKey {
  return Object.values(PolicyReasonKey).includes(key as PolicyReasonKey);
}
