/**
 * Microsoft Outlook Integration Types
 * Calendar sync via Microsoft Graph API
 *
 * Environment Variables Required:
 * - OUTLOOK_TENANT_ID (Azure AD tenant ID)
 * - OUTLOOK_CLIENT_ID (Azure AD application ID)
 * - OUTLOOK_CLIENT_SECRET (Azure AD client secret)
 *
 * Permissions Required:
 * - Calendars.ReadWrite (delegated or application)
 * - User.Read (delegated or application)
 *
 * Rate Limits:
 * - 10,000 requests per 10 minutes per app per tenant
 */

// =============================================================================
// Core Types
// =============================================================================

export interface OutlookConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  useMock: boolean;
}

export interface OutlookConnectionStatus {
  connected: boolean;
  provider: 'Microsoft Outlook';
  version?: string;
  lastSync?: string;
  calendarCount: number;
  eventCount: number;
}

export interface OutlookSyncResult {
  success: boolean;
  syncedAt: string;
  eventsSynced: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
}

// =============================================================================
// Calendar Types
// =============================================================================

export interface OutlookCalendar {
  id: string;
  name: string;
  color?: string;
  isDefault: boolean;
  canEdit: boolean;
  owner?: OutlookEmailAddress;
}

export interface OutlookEmailAddress {
  name: string;
  address: string;
}

// =============================================================================
// Event Types
// =============================================================================

export interface OutlookEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  start: OutlookDateTime;
  end: OutlookDateTime;
  location?: OutlookLocation;
  organizer?: OutlookEmailAddress;
  attendees: OutlookAttendee[];
  isAllDay: boolean;
  isCancelled: boolean;
  status: OutlookEventStatus;
  recurrence?: OutlookRecurrence;
  createdAt: string;
  updatedAt: string;
  externalId?: string; // Link to Digilist booking
}

export interface OutlookDateTime {
  dateTime: string;
  timeZone: string;
}

export interface OutlookLocation {
  displayName: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface OutlookAttendee {
  email: OutlookEmailAddress;
  status: OutlookResponseStatus;
  type: 'required' | 'optional' | 'resource';
}

export type OutlookResponseStatus = 'none' | 'organizer' | 'tentative' | 'accepted' | 'declined';
export type OutlookEventStatus = 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown';

export interface OutlookRecurrence {
  pattern: {
    type: 'daily' | 'weekly' | 'absoluteMonthly' | 'relativeMonthly' | 'absoluteYearly' | 'relativeYearly';
    interval: number;
    daysOfWeek?: string[];
    dayOfMonth?: number;
    month?: number;
  };
  range: {
    type: 'endDate' | 'noEnd' | 'numbered';
    startDate: string;
    endDate?: string;
    numberOfOccurrences?: number;
  };
}

// =============================================================================
// DTOs
// =============================================================================

export interface CreateOutlookEventDTO {
  bookingId: string;
  calendarId?: string;
  subject: string;
  body?: string;
  start: OutlookDateTime;
  end: OutlookDateTime;
  location?: string;
  attendees?: {
    email: string;
    name?: string;
    type?: 'required' | 'optional' | 'resource';
  }[];
  isAllDay?: boolean;
  recurrence?: OutlookRecurrence;
}

export interface UpdateOutlookEventDTO {
  subject?: string;
  body?: string;
  start?: OutlookDateTime;
  end?: OutlookDateTime;
  location?: string;
  attendees?: {
    email: string;
    name?: string;
    type?: 'required' | 'optional' | 'resource';
  }[];
  isAllDay?: boolean;
}

export interface OutlookEventQueryParams {
  calendarId?: string;
  startDateTime?: string;
  endDateTime?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Sync Types
// =============================================================================

export interface OutlookSyncMapping {
  bookingId: string;
  outlookEventId: string;
  calendarId: string;
  lastSynced: string;
  syncDirection: 'digilist_to_outlook' | 'outlook_to_digilist' | 'bidirectional';
}

// =============================================================================
// Integration Event Types (for audit trail)
// =============================================================================

export interface OutlookIntegrationEvent {
  id: string;
  eventType: OutlookEventType;
  entityType: 'calendar' | 'event' | 'sync';
  entityId: string;
  externalRef?: string;
  status: 'pending' | 'success' | 'failed' | 'retry';
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
  retryCount: number;
  createdAt: string;
  processedAt?: string;
}

export type OutlookEventType =
  | 'event_created'
  | 'event_updated'
  | 'event_deleted'
  | 'event_cancelled'
  | 'calendar_sync'
  | 'sync_completed';

// =============================================================================
// Client Interface
// =============================================================================

export interface IOutlookClient {
  // Connection
  getStatus(): Promise<OutlookConnectionStatus>;
  sync(calendarId?: string): Promise<OutlookSyncResult>;

  // Calendars
  getCalendars(): Promise<OutlookCalendar[]>;
  getCalendar(calendarId: string): Promise<OutlookCalendar>;

  // Events
  createEvent(data: CreateOutlookEventDTO): Promise<OutlookEvent>;
  getEvents(params?: OutlookEventQueryParams): Promise<{ data: OutlookEvent[]; total: number }>;
  getEvent(eventId: string, calendarId?: string): Promise<OutlookEvent>;
  updateEvent(eventId: string, data: UpdateOutlookEventDTO, calendarId?: string): Promise<OutlookEvent>;
  deleteEvent(eventId: string, calendarId?: string): Promise<void>;
  cancelEvent(eventId: string, comment?: string, calendarId?: string): Promise<OutlookEvent>;

  // Sync Mappings
  getEventByBookingId(bookingId: string): Promise<OutlookEvent | null>;
  linkBookingToEvent(bookingId: string, eventId: string, calendarId: string): Promise<OutlookSyncMapping>;
  unlinkBooking(bookingId: string): Promise<void>;
}
